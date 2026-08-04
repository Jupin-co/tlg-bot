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

async function getBotMessage(db: any, key: string, lang: string, defaultText: string) {
  try {
    const res = await db.prepare("SELECT message_value FROM translations WHERE message_key = ? AND lang_code = ?").bind(key, lang).first();
    if (res && res.message_value) return res.message_value;
    const fallback = await db.prepare("SELECT message_value FROM translations WHERE message_key = ? AND lang_code = 'en'").bind(key).first();
    if (fallback && fallback.message_value) return fallback.message_value;
  } catch (e) {}
  return defaultText;
}

  // User command
  bot.command("start", async (ctx) => {
    const profile = {
      telegram_id: ctx.from?.id!,
      username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      language_code: ctx.from?.language_code || 'en',
      is_premium: ctx.from?.is_premium,
      start_param: ctx.match,
    };
    
    await saveUser(ctx.env.DB, profile);
    await logUsage(ctx.env.DB, profile.telegram_id, 'START_BOT', { start_param: profile.start_param });
    
    const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";

    // Check if user already has a phone number in profile
    const existingProfile = await ctx.env.DB.prepare("SELECT phone_number FROM profiles WHERE user_id = ?").bind(profile.telegram_id).first();
    const hasPhoneNumber = !!(existingProfile && existingProfile.phone_number);

    const lang = profile.language_code;

    if (!hasPhoneNumber) {
      const msg = await getBotMessage(ctx.env.DB, 'bot_request_contact', lang, "Please share your phone number to continue.");
      const btn = await getBotMessage(ctx.env.DB, 'bot_btn_share_contact', lang, "📞 Share Phone Number");
      await ctx.reply(msg, {
        reply_markup: {
          keyboard: [
            [{ text: btn, request_contact: true }]
          ],
          resize_keyboard: true,
          is_persistent: true
        }
      });
    } else {
      const msg = await getBotMessage(ctx.env.DB, 'bot_welcome', lang, "Welcome! Click below to open the app.");
      const btn = await getBotMessage(ctx.env.DB, 'bot_btn_open_app', lang, "📱 Open App");
      await ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: btn, web_app: { url: webAppUrl } }]
          ]
        }
      });
    }
  });

  bot.on("message:contact", async (ctx) => {
    const contact = ctx.message.contact;
    const tgId = ctx.from?.id;
    const lang = ctx.from?.language_code || 'en';
    
    if (contact && tgId) {
      if (contact.user_id === tgId) {
        await updateUserPhone(ctx.env.DB, tgId, contact.phone_number);
        await logUsage(ctx.env.DB, tgId, 'SHARE_CONTACT', { phone_number: contact.phone_number });
        
        try { await ctx.deleteMessage(); } catch (e) {}

        const msg = await getBotMessage(ctx.env.DB, 'bot_contact_success', lang, "Thank you! Open the app below.");
        const btn = await getBotMessage(ctx.env.DB, 'bot_btn_open_app', lang, "📱 Open App");
        const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
        
        await ctx.reply(msg, {
          reply_markup: {
            inline_keyboard: [
              [{ text: btn, web_app: { url: webAppUrl } }]
            ]
          }
        });
      } else {
        const msg = await getBotMessage(ctx.env.DB, 'bot_contact_invalid', lang, "Please share your own contact number.");
        await ctx.reply(msg);
      }
    }
  });

  // Log other user messages if needed
  bot.on("message:text", async (ctx) => {
    if (ctx.from) {
      await logUsage(ctx.env.DB, ctx.from.id, 'SEND_TEXT_MESSAGE', { text: ctx.message.text });
      const lang = ctx.from.language_code || 'en';
      const msg = await getBotMessage(ctx.env.DB, 'bot_fallback', lang, "Please use the Mini App.");
      const btn = await getBotMessage(ctx.env.DB, 'bot_btn_open_app', lang, "📱 Open App");
      const webAppUrl = "https://tlg-bot.m-pazouki-dev.workers.dev/";
      
      await ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: btn, web_app: { url: webAppUrl } }]
          ]
        }
      });
    }
  });

  return bot;
}
