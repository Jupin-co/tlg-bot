import { Bot, Context, session, SessionFlavor } from 'grammy';
import {
  conversations,
  createConversation,
  Conversation,
  ConversationFlavor,
} from '@grammyjs/conversations';

// --- Environment & Context ---
export interface Env {
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  DB: D1Database;
}

interface SessionData {
  adminDeliveryOrderId?: string;
  adminDeliveryUserId?: string;
}

export type BotContext = Context & SessionFlavor<SessionData> & ConversationFlavor & {
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
  // 1. Ensure user exists
  const tgId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";
  if (!tgId) return;

  await ctx.env.DB.prepare("INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)").bind(tgId, username).run();

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
  const res = await ctx.env.DB.prepare("INSERT INTO orders (user_id, days, gb, price, status) VALUES (?, ?, ?, ?, ?) RETURNING id")
    .bind(tgId, days, gb, price, "PENDING_PAYMENT")
    .first();
  
  const orderId = res?.id;

  await ctx.reply("Thank you! Your payment receipt has been submitted. The admin will review it shortly.");

  // 7. Send to Admin
  const adminId = ctx.env.ADMIN_CHAT_ID;
  const adminMsg = `📦 **New Order #${orderId}**\nUser: @${username} (${tgId})\nDays: ${days}\nGB: ${gb}\nPrice: $${price}\nStatus: PENDING PAYMENT`;
  
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
  });
}

async function adminDeliveryWizard(conversation: BotConversation, ctx: BotContext) {
  // We expect conversation state to hold the orderId and userId
  const orderId = conversation.session.adminDeliveryOrderId;
  const userId = conversation.session.adminDeliveryUserId;

  await ctx.reply(`Please enter the product details (e.g., link, credentials) for Order #${orderId} to deliver to the user:`);
  
  const detailsCtx = await conversation.waitFor(":text");
  const details = detailsCtx.msg.text;

  // Update DB
  await ctx.env.DB.prepare("UPDATE orders SET status = 'DELIVERED' WHERE id = ?").bind(orderId).run();

  // Send to User
  await ctx.api.sendMessage(userId, `🎉 Your Order #${orderId} has been approved and delivered!\n\nHere are your details:\n${details}`);

  await ctx.reply("Product delivered to the user and order marked as DELIVERED!");
}

// --- Bot Setup ---

let bot: Bot<BotContext>;

export function initBot(env: Env) {
  if (bot) return bot;

  bot = new Bot<BotContext>(env.BOT_TOKEN);

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

  // User command
  bot.command("start", async (ctx) => {
    await ctx.conversation.enter("orderWizard");
  });

  // Admin callbacks
  bot.callbackQuery(/reject_(\d+)_(\d+)/, async (ctx) => {
    const orderId = ctx.match[1];
    const userId = ctx.match[2];
    
    await ctx.env.DB.prepare("UPDATE orders SET status = 'REJECTED' WHERE id = ?").bind(orderId).run();
    await ctx.api.sendMessage(userId, `❌ Your payment for Order #${orderId} was rejected. Please contact support if you think this is a mistake.`);
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n❌ REJECTED" });
    await ctx.answerCallbackQuery("Rejected.");
  });

  bot.callbackQuery(/approve_(\d+)_(\d+)/, async (ctx) => {
    const orderId = ctx.match[1];
    const userId = ctx.match[2];
    
    // We start the admin delivery wizard. We need to pass the orderId and userId into the session so the conversation can read them.
    ctx.session.adminDeliveryOrderId = orderId;
    ctx.session.adminDeliveryUserId = userId;
    
    await ctx.conversation.enter("adminDeliveryWizard");
    await ctx.editMessageCaption({ caption: ctx.msg?.caption + "\n\n✅ APPROVED (Pending Delivery...)" });
    await ctx.answerCallbackQuery("Approving...");
  });

  return bot;
}
