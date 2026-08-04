import { Hono } from 'hono';
import { initBot, Env } from './bot';
import api from './api';

const app = new Hono<{ Bindings: Env }>();

app.route('/api', api);

app.post('/bot', async (c) => {
  const bot = initBot(c.env);
  try {
    const update = await c.req.json();
    c.executionCtx.waitUntil(bot.handleUpdate(update));
    return c.text('OK');
  } catch (err) {
    console.error(err);
    return c.text('Error', 500);
  }
});

// Note: Root path '/' and other static assets will be handled automatically 
// by Cloudflare Workers Assets configured in wrangler.toml

export default app;
