import { Bot, InlineKeyboard } from 'grammy';
import { createConversation } from '@grammyjs/conversations';
import { BotContext, BotConversation } from '../bot';

// Middleware to check if user is admin
async function checkAdmin(ctx: BotContext, next: () => Promise<void>) {
  if (!ctx.from?.id) return;
  const res = await ctx.env.DB.prepare("SELECT is_admin FROM users WHERE telegram_id = ?").bind(ctx.from.id).first();
  if (res && res.is_admin === 1) {
    await next();
  }
}

// Conversation: Add Product
async function addProductWizard(conversation: BotConversation, ctx: BotContext) {
  await ctx.reply("📦 **Add New Product**\n\nWhat is the name of the product? (Type /cancel to abort)");
  const nameCtx = await conversation.waitFor(":text");
  if (nameCtx.msg.text === '/cancel') return ctx.reply("Cancelled.");
  const name = nameCtx.msg.text;

  await ctx.reply(`Name: ${name}\n\nWhat is the price in USD? (Enter a number)`);
  const priceCtx = await conversation.waitFor(":text");
  const price = parseInt(priceCtx.msg.text);
  if (isNaN(price)) {
    await ctx.reply("Invalid price. Cancelled.");
    return;
  }

  // Save to DB
  await ctx.env.DB.prepare("INSERT INTO products (name, base_price, category_id) VALUES (?, ?, NULL)")
    .bind(name, price).run();

  await ctx.reply(`✅ Product **${name}** added successfully for $${price}!`);
}

// Conversation: Edit Setting
async function editSettingWizard(conversation: BotConversation, ctx: BotContext) {
  await ctx.reply("⚙️ **Edit Setting**\n\nWhich setting do you want to edit?\nExample: `welcome_message`");
  const keyCtx = await conversation.waitFor(":text");
  const key = keyCtx.msg.text;

  const current = await ctx.env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  const currentVal = current ? current.value : "(Not set)";

  await ctx.reply(`Current value for **${key}** is:\n\n${currentVal}\n\nPlease send the NEW value now:`);
  const valCtx = await conversation.waitFor(":text");
  const newVal = valCtx.msg.text;

  await ctx.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(key, newVal).run();

  await ctx.reply("✅ Setting updated successfully!");
}

export function setupAdmin(bot: Bot<BotContext>) {
  // Register conversations
  bot.use(createConversation(addProductWizard));
  bot.use(createConversation(editSettingWizard));

  bot.command('admin', checkAdmin, async (ctx) => {
    const kb = new InlineKeyboard()
      .text('📦 Manage Products', 'admin_products').row()
      .text('⚙️ Edit Settings', 'admin_settings').row()
      .text('📊 View Orders', 'admin_orders');
    
    await ctx.reply('🔐 **Admin Dashboard**\n\nSelect an option:', { reply_markup: kb });
  });

  bot.callbackQuery('admin_products', checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    const kb = new InlineKeyboard().text('➕ Add Product', 'admin_add_product');
    await ctx.editMessageText("📦 **Product Management**\n\nClick below to add a new product:", { reply_markup: kb });
  });

  bot.callbackQuery('admin_add_product', checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("addProductWizard");
  });

  bot.callbackQuery('admin_settings', checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("editSettingWizard");
  });

  bot.callbackQuery('admin_orders', checkAdmin, async (ctx) => {
    await ctx.answerCallbackQuery("Order stats coming soon!");
  });
}
