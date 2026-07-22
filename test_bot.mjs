import { Bot } from 'grammy';
async function test() {
  const bot = new Bot('8818123904:AAG2pNcsMrcROzjAUcXgQQsw6xY7d0oXQ6w');
  await bot.init();
  console.log(JSON.stringify(bot.botInfo));
}
test().catch(console.error);
