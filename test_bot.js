const { Bot } = require('grammy');
async function test() {
  const bot = new Bot('8818123904:AAG2pNcsMrcROzjAUcXgQQsw6xY7d0oXQ6w');
  await bot.init();
  console.log(bot.botInfo);
}
test().catch(console.error);
