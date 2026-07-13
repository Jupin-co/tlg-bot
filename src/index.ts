import { initBot, Env } from './bot';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const bot = initBot(env);
    
    if (request.method === "POST") {
      try {
        const update = await request.json();
        ctx.waitUntil(bot.handleUpdate(update));
        return new Response("OK");
      } catch (err) {
        console.error(err);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("Ecommerce Telegram Bot is running.");
  },
};
