import { Hono } from 'hono';
import { Env } from '../bot';

const api = new Hono<{ Bindings: Env, Variables: { user: any } }>();

// Middleware: Validate Telegram initData
api.use('*', async (c, next) => {
  const initData = c.req.header('x-telegram-init-data');
  if (!initData) {
    // For local dev, allow bypass if needed, but strict in prod
    return c.json({ error: 'Unauthorized. Missing initData.' }, 401);
  }
  
  // Security note: In a real app, cryptographically validate initData using BOT_TOKEN!
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (userJson) {
      const user = JSON.parse(decodeURIComponent(userJson));
      c.set('user', user);
    }
  } catch (e) {
    console.error("Failed to parse initData", e);
  }
  
  await next();
});

// Endpoint: Fetch the catalog
api.get('/catalog', async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories WHERE is_active = 1").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products WHERE is_hidden = 0").all();
  
  return c.json({ categories, products });
});

export default api;
