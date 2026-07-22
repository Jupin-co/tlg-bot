import { Bot, Context, session, SessionFlavor } from 'grammy';
import {
  conversations,
  createConversation,
  Conversation,
  ConversationFlavor,
} from '@grammyjs/conversations';
import { saveUser, createOrder, updateOrderStatus, getAdminIds } from './core/db';
import { setupAdmin } from './bot/admin';

// --- Environment & Context ---
export interface Env {
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  DB: D1Database;
}

interface SessionData {
  adminDeliveryOrderId?: number;
  adminDeliveryUserId?: number;
}

export type BotContext = Context & SessionFlavor<SessionData> & ConversationFlavor<Context> & {
  env: Env;
};
export type BotConversation = Conversation<BotContext>;

// --- D1 Session Adapter ---
class D1Adapter {
  constructor(private db: D1Database) {}
  async read(key: string): Promise<any> {
    const row = await this.db.prepare("SELECT value FROM sessions WHERE id = ?").bind(key).first();
    if (row && row.value) return JSON.parse(row.value as string);
    return undefined;
  }
  async write(key: string, value: any): Promise<void> {
    await this.db
      .prepare("INSERT INTO sessions (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value")
      .bind(key, JSON.stringify(value))
      .run();
  }
  async delete(key: string): Promise<void> {
    await this.db.prepare("DELETE FROM sessions WHERE id = ?").bind(key).run();
  }
}

// --- Conversations ---

async function orderWizard(conversation: BotConversation, ctx: BotContext) {
  const tgId = ctx.from?.id;
  if (!tgId) return;

  // 2. Ask Days
  await ctx.reply("Welcome! Let's configure your order.\n\nHow many **Days** of service do you need? (Please enter a number)");
  const daysCtx = await conversation.waitFor(":text");
  const days = parseInt(daysCtx.msg.text);
  if (isNaN(days) || days <= 0) {
    await ctx.reply("Invalid number. Please run /start again.");
    return;
  }

  // 3. Ask GBs
  await ctx.reply(`Great! You want ${days} days.\n\nHow many **Gigabytes (GB)** do you need?`);
  const gbCtx = await conversation.waitFor(":text");
  const gb = parseInt(gbCtx.msg.text);
  if (isNaN(gb) || gb <= 0) {
    await ctx.reply("Invalid number. Please run /start again.");
    return;
  }

  // 4. Calculate Price & Ask for Payment
  const price = (days * 1) + (gb * 2); // Example logic
  await ctx.reply(`Order Summary:\n- Days: ${days}\n- GB: ${gb}\n- Price: $${price}\n\nPlease pay $${price} and **upload a screenshot of the payment receipt** (as a photo message) to continue.`);
  
  // 5. Wait for Photo
  const photoCtx = await conversation.waitFor(":photo");
  const photo = photoCtx.msg.photo;
  
  // 6. Save Order
  const orderId = await createOrder(ctx.env.DB, tgId, days, gb, price);

  await ctx.reply("Thank you! Your payment receipt has been submitted. The admin will review it shortly.");

  // 7. Send to Admins
  const username = ctx.from?.username || "unknown";
  const adminMsg = `📦 **New Order #${orderId}**\nUser: @${username} (${tgId})\nDays: ${days}\nGB: ${gb}\nPrice: $${price}\nStatus: PENDING PAYMENT`;
  
  // Use getAdminIds to notify all admins
  const adminIds = await getAdminIds(ctx.env.DB);
  if (adminIds.length === 0) {
    // fallback if no admin in db
    adminIds.push(parseInt(ctx.env.ADMIN_CHAT_ID));
  }

  for (const adminId of adminIds) {
    await ctx.api.sendPhoto(adminId, photo[0].file_id, {
      caption: adminMsg,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Approve", callback_data: `approve_${orderId}_${tgId}` },
            { text: "❌ Reject", callback_data: `reject_${orderId}_${tgId}` }
          ]
        ]
      }
    }).catch(console.error); // handle blocks
  }
}

async function adminDeliveryWizard(conversation: BotConversation, ctx: BotContext) {
  const orderId = conversation.session.adminDeliveryOrderId;
  const userId = conversation.session.adminDeliveryUserId;

  if (!orderId || !userId) return;

  await ctx.reply(`Please enter the product details (e.g., link, credentials) for Order #${orderId} to deliver to the user:`);
  
  const detailsCtx = await conversation.waitFor(":text");
  const details = detailsCtx.msg.text;

  // Update DB
  await updateOrderStatus(ctx.env.DB, orderId, 'DELIVERED');

  // Send to User
  await ctx.api.sendMessage(userId, `🎉 Your Order #${orderId} has been approved and delivered!\n\nHere are your details:\n${details}`);

  await ctx.reply("Product delivered to the user and order marked as DELIVERED!");
}

// --- Bot Setup ---

let bot: Bot<BotContext>;

export function initBot(env: Env) {
  if (bot) return bot;

  bot = new Bot<BotContext>(env.BOT_TOKEN, {
    botInfo: {
      id: 8818123904,
      is_bot: true,
      first_name: "Garavoli-bot",
      username: "Garavoli_bot",
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      supports_guest_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      can_manage_bots: false,
      supports_join_request_queries: false
    }
  });

  bot.use(async (ctx, next) => {
    ctx.env = env;
    await next();
  });

  bot.use(
    session({
      initial: () => ({}),
      storage: new D1Adapter(env.DB),
    })
  );

  bot.use(conversations());
  bot.use(createConversation(orderWizard));
  bot.use(createConversation(adminDeliveryWizard));

  setupAdmin(bot);

  // User command
  bot.command("start", async (ctx) => {
    // Capture rich user data
    const profile = {
      telegram_id: ctx.from?.id!,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      language_code: ctx.from?.language_code,
      is_premium: ctx.from?.is_premium,
      start_param: ctx.match, // from /start <payload>
    };
    await saveUser(ctx.env.DB, profile);
    
    // Determine the web app URL from the current request or hardcode it
    // For now we will use the worker's URL that hosts the HTML.
    // In production, you might want to use a specific domain.
    const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";

    await ctx.reply("Welcome to the E-Commerce Bot! You can use our Mini App to browse the catalog, or use the text wizard to create an order.", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🛍️ Open Catalog (Mini App)", web_app: { url: webAppUrl } }
          ],
          [
            { text: "📝 Quick Order (Text Wizard)", callback_data: "start_wizard" }
          ]
        ]
      }
    });
  });

  bot.callbackQuery("start_wizard", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("orderWizard");
  });

  // Admin callbacks
  bot.callbackQuery(/reject_(\d+)_(\d+)/, async (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const userId = parseInt(ctx.match[2]);
    
    await updateOrderStatus(ctx.env.DB, orderId, 'REJECTED');
    await ctx.api.sendMessage(userId, `❌ Your payment for Order #${orderId} was rejected. Please contact support if you think this is a mistake.`);
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n❌ REJECTED" });
    await ctx.answerCallbackQuery("Rejected.");
  });

  bot.callbackQuery(/approve_(\d+)_(\d+)/, async (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const userId = parseInt(ctx.match[2]);
    
    ctx.session.adminDeliveryOrderId = orderId;
    ctx.session.adminDeliveryUserId = userId;
    
    await ctx.conversation.enter("adminDeliveryWizard");
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n✅ APPROVED (Pending Delivery...)" });
    await ctx.answerCallbackQuery("Approving...");
  });

  return bot;
}
