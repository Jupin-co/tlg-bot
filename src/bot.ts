import { Bot, Context } from 'grammy';
import { saveUser, updateUserPhone, logUsage } from './core/db';
import { setupAdmin } from './bot/admin';

// --- Environment & Context ---
export interface Env {
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  DB: D1Database;
  RECEIPTS_BUCKET: R2Bucket;
}



export type BotContext = Context & {
  env: Env;
};

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

  setupAdmin(bot);

  // User command
  bot.command("start", async (ctx) => {
    const profile = {
      telegram_id: ctx.from?.id!,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      language_code: ctx.from?.language_code,
      is_premium: ctx.from?.is_premium,
      start_param: ctx.match,
    };
    
    await saveUser(ctx.env.DB, profile);
    await logUsage(ctx.env.DB, profile.telegram_id, 'START_BOT', { start_param: profile.start_param });
    
    const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";

    // We send a normal text message with inline button to open the Mini App
    await ctx.reply("Welcome to our Store! Click 'Open Mini App' below to browse our products and manage your profile.", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🛍️ Open Mini App", web_app: { url: webAppUrl } }
          ]
        ]
      }
    });

    // Check if user already has a phone number in profile
    const existingProfile = await ctx.env.DB.prepare("SELECT phone_number FROM profiles WHERE user_id = ?").bind(profile.telegram_id).first();
    const hasPhoneNumber = !!(existingProfile && existingProfile.phone_number);

    if (!hasPhoneNumber) {
      await ctx.reply("You can optionally share your contact with us to complete your profile.", {
        reply_markup: {
          keyboard: [
            [{ text: "📞 Share Phone Number", request_contact: true }]
          ],
          resize_keyboard: true,
          is_persistent: true
        }
      });
    } else {
      // Remove any lingering persistent keyboard
      await ctx.reply("Welcome back!", {
        reply_markup: {
          remove_keyboard: true
        }
      });
    }
  });

  bot.on("message:contact", async (ctx) => {
    const contact = ctx.message.contact;
    const tgId = ctx.from?.id;
    if (contact && tgId) {
      if (contact.user_id === tgId) {
        await updateUserPhone(ctx.env.DB, tgId, contact.phone_number);
        await logUsage(ctx.env.DB, tgId, 'SHARE_CONTACT', { phone_number: contact.phone_number });
        
        // Delete the contact message to keep chat clean
        try {
          await ctx.deleteMessage();
        } catch (e) {
          console.error("Failed to delete contact message", e);
        }

        // Send a temporary success message
        const msg = await ctx.reply("Thank you! Your phone number has been saved to your profile.");
        setTimeout(() => {
          ctx.api.deleteMessage(ctx.chat.id, msg.message_id).catch(() => {});
        }, 5000);
      } else {
        await ctx.reply("Please share your own contact number.");
      }
    }
  });

  // Log other user messages if needed
  bot.on("message:text", async (ctx) => {
    if (ctx.from) {
      await logUsage(ctx.env.DB, ctx.from.id, 'SEND_TEXT_MESSAGE', { text: ctx.message.text });
      // We do not process text input based on requirements. Just tell them to use the Mini App.
      const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
      await ctx.reply("Please use the Mini App to interact with the bot.", {
        reply_markup: {
          inline_keyboard: [[{ text: "Open Mini App", web_app: { url: webAppUrl } }]]
        }
      });
    }
  });

  return bot;
}
