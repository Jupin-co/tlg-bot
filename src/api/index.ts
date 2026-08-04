import { Hono } from 'hono';
import { Env } from '../bot';
import { logUsage } from '../core/db';

const api = new Hono<{ Bindings: Env, Variables: { user: any } }>();

// Middleware: Validate Telegram initData
api.use('*', async (c, next) => {
  const initData = c.req.header('x-telegram-init-data');
  if (!initData) {
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

// Middleware: Admin check
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401);
  
  const { DB } = c.env;
  const dbUser = await DB.prepare(`
    SELECT r.name as role 
    FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.user_id = ?
  `).bind(user.id).first();
  
  if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'ADMIN')) {
    return c.json({ error: 'Forbidden. Admins only.' }, 403);
  }
  await next();
};

// Endpoint: Fetch User Profile
api.get('/user', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);

  const dbUser = await c.env.DB.prepare(`
    SELECT 
      u.*, 
      p.phone_number,
      r.name as role,
      t.name as theme_preference,
      l.code as language_preference
    FROM users u
    LEFT JOIN profiles p ON u.telegram_id = p.user_id
    LEFT JOIN roles r ON p.role_id = r.id
    LEFT JOIN themes t ON p.theme_id = t.id
    LEFT JOIN languages l ON p.language_id = l.id
    WHERE u.telegram_id = ?
  `).bind(user.id).first();
  
  return c.json({ user: dbUser || user });
});

// Endpoint: Update User Preferences
api.post('/user/preferences', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const { language, theme } = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE profiles 
    SET 
      language_id = (SELECT id FROM languages WHERE code = ?), 
      theme_id = (SELECT id FROM themes WHERE name = ?) 
    WHERE user_id = ?
  `).bind(language, theme, user.id).run();
  
  return c.json({ success: true });
});

// Endpoint: Log Usage
api.post('/log', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const { action, metadata } = await c.req.json();
  await logUsage(c.env.DB, user.id, action, metadata);
  return c.json({ success: true });
});

// Endpoint: Fetch the public catalog
api.get('/catalog', async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories WHERE is_active = 1").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products WHERE is_hidden = 0").all();
  
  return c.json({ categories, products });
});

// Admin: Get full catalog
api.get('/admin/catalog', adminMiddleware, async (c) => {
  const { results: categories } = await c.env.DB.prepare("SELECT * FROM categories").all();
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products").all();
  
  return c.json({ categories, products });
});

// Admin: Add/Edit Category
api.post('/admin/categories', adminMiddleware, async (c) => {
  const { id, parent_id, name, is_active } = await c.req.json();
  if (id) {
    await c.env.DB.prepare("UPDATE categories SET name = ?, parent_id = ?, is_active = ? WHERE id = ?")
      .bind(name, parent_id || null, is_active ? 1 : 0, id).run();
  } else {
    await c.env.DB.prepare("INSERT INTO categories (name, parent_id, is_active) VALUES (?, ?, ?)")
      .bind(name, parent_id || null, is_active !== false ? 1 : 0).run();
  }
  return c.json({ success: true });
});

// Admin: Add/Edit Product
api.post('/admin/products', adminMiddleware, async (c) => {
  const { id, category_id, name, description, base_price, stock, is_selling, is_hidden } = await c.req.json();
  if (id) {
    await c.env.DB.prepare(
      "UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, stock = ?, is_selling = ?, is_hidden = ? WHERE id = ?"
    ).bind(category_id, name, description || null, base_price, stock || -1, is_selling ? 1 : 0, is_hidden ? 1 : 0, id).run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO products (category_id, name, description, base_price, stock, is_selling, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(category_id, name, description || null, base_price, stock || -1, is_selling !== false ? 1 : 0, is_hidden ? 1 : 0).run();
  }
  return c.json({ success: true });
});

export default api;
