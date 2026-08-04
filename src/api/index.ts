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
  const { id, category_id, name, description, base_price, currency, duration_days, stock, is_selling, is_hidden } = await c.req.json();
  const ccy = currency || 'USD';
  const duration = duration_days || 0;
  
  if (id) {
    await c.env.DB.prepare(
      "UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, currency = ?, duration_days = ?, stock = ?, is_selling = ?, is_hidden = ? WHERE id = ?"
    ).bind(category_id, name, description || null, base_price, ccy, duration, stock || -1, is_selling ? 1 : 0, is_hidden ? 1 : 0, id).run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO products (category_id, name, description, base_price, currency, duration_days, stock, is_selling, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(category_id, name, description || null, base_price, ccy, duration, stock || -1, is_selling !== false ? 1 : 0, is_hidden ? 1 : 0).run();
  }
  return c.json({ success: true });
});

// --- ADMIN SETTINGS ---
api.get('/admin/settings', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();
  const settings = (results || []).reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
  return c.json({ settings });
});

api.post('/admin/settings', adminMiddleware, async (c) => {
  const { card_holder, card_number } = await c.req.json();
  await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'card_holder'").bind(card_holder || '').run();
  await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'card_number'").bind(card_number || '').run();
  return c.json({ success: true });
});

// --- ADMIN PAYMENTS ---
api.get('/admin/payments', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, i.user_id, i.total_price, i.currency, u.username, u.first_name 
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    JOIN users u ON i.user_id = u.telegram_id
    WHERE p.status = 'PENDING_APPROVAL'
  `).all();
  return c.json({ payments: results });
});

api.post('/admin/payments/:id/approve', adminMiddleware, async (c) => {
  const paymentId = c.req.param('id');
  
  // Update payment status
  await c.env.DB.prepare("UPDATE payments SET status = 'APPROVED' WHERE id = ?").bind(paymentId).run();
  
  // Get invoice details
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (!pRecord) return c.json({ error: 'Payment not found' }, 404);
  const invoiceId = pRecord.invoice_id;
  
  await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED' WHERE id = ?").bind(invoiceId).run();
  
  // Get invoice items to add to inventory
  const { results: items } = await c.env.DB.prepare(`
    SELECT i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  `).bind(invoiceId).all();

  // Create inventory records
  for (const item of items as any[]) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + item.snapshot_duration_days * 24 * 60 * 60 * 1000);
    
    await c.env.DB.prepare(`
      INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      item.user_id, paymentId, item.snapshot_name, item.snapshot_description, 
      startsAt.toISOString(), endsAt.toISOString()
    ).run();
  }
  
  return c.json({ success: true });
});

api.post('/admin/payments/:id/reject', adminMiddleware, async (c) => {
  const paymentId = c.req.param('id');
  await c.env.DB.prepare("UPDATE payments SET status = 'REJECTED' WHERE id = ?").bind(paymentId).run();
  
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (pRecord) {
    await c.env.DB.prepare("UPDATE invoices SET status = 'REJECTED' WHERE id = ?").bind(pRecord.invoice_id).run();
  }
  
  return c.json({ success: true });
});

// --- USER BASKET ---
api.get('/basket', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);

  const { results } = await c.env.DB.prepare(`
    SELECT b.id as basket_id, b.quantity, p.* 
    FROM baskets b 
    JOIN products p ON b.product_id = p.id 
    WHERE b.user_id = ?
  `).bind(user.id).all();
  return c.json({ basket: results });
});

api.post('/basket/add', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const { product_id } = await c.req.json();
  
  // Check if exists
  const exists = await c.env.DB.prepare("SELECT id FROM baskets WHERE user_id = ? AND product_id = ?").bind(user.id, product_id).first();
  if (exists) {
    await c.env.DB.prepare("UPDATE baskets SET quantity = quantity + 1 WHERE id = ?").bind(exists.id).run();
  } else {
    await c.env.DB.prepare("INSERT INTO baskets (user_id, product_id) VALUES (?, ?)").bind(user.id, product_id).run();
  }
  return c.json({ success: true });
});

api.post('/basket/remove', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const { basket_id } = await c.req.json();
  await c.env.DB.prepare("DELETE FROM baskets WHERE id = ? AND user_id = ?").bind(basket_id, user.id).run();
  return c.json({ success: true });
});

// --- USER CHECKOUT / INVOICE ---
api.post('/invoice/create', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);

  const { results: basketItems } = await c.env.DB.prepare(`
    SELECT b.id as basket_id, b.quantity, p.* 
    FROM baskets b 
    JOIN products p ON b.product_id = p.id 
    WHERE b.user_id = ?
  `).bind(user.id).all();

  if (!basketItems || basketItems.length === 0) {
    return c.json({ error: 'Basket is empty' }, 400);
  }

  // Validate stock
  for (const item of basketItems as any[]) {
    if (item.stock === 0) {
      return c.json({ error: `Product ${item.name} is out of stock.` }, 400);
    }
  }

  const currency = (basketItems[0] as any).currency;
  const totalPrice = basketItems.reduce((acc, item: any) => acc + (item.base_price * item.quantity), 0);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now

  // Create invoice
  const { meta } = await c.env.DB.prepare(`
    INSERT INTO invoices (user_id, total_price, currency, status, expires_at) 
    VALUES (?, ?, ?, 'PENDING_PAYMENT', ?)
  `).bind(user.id, totalPrice, currency, expiresAt.toISOString()).run();

  const invoiceId = meta.last_row_id;

  // Create invoice items
  for (const item of basketItems as any[]) {
    await c.env.DB.prepare(`
      INSERT INTO invoice_items (invoice_id, product_id, snapshot_name, snapshot_description, snapshot_price, snapshot_duration_days, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceId, item.id, item.name, item.description || '', item.base_price, item.duration_days, item.quantity
    ).run();
  }

  // Clear basket
  await c.env.DB.prepare("DELETE FROM baskets WHERE user_id = ?").bind(user.id).run();

  return c.json({ success: true, invoice_id: invoiceId });
});

// --- USER PAYMENT UPLOAD ---
// Uses Web Crypto for unique ID and R2 for storage
api.post('/invoice/:id/receipt', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const invoiceId = c.req.param('id');
  
  // Basic check for multipart
  const contentType = c.req.header('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ error: 'Requires multipart/form-data' }, 400);
  }
  
  const formData = await c.req.parseBody();
  const file = formData['receipt'];
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'Receipt file is required' }, 400);
  }
  
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'Only images are allowed' }, 400);
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'File size must be less than 5MB' }, 400);
  }
  
  // Note: WebP conversion is complex in pure JS on V8 isolates without sharp.
  // We will store the original image to R2 directly as Cloudflare Images or CDN can optimize delivery.
  const arrayBuffer = await file.arrayBuffer();
  const uniqueId = crypto.randomUUID();
  const fileKey = `receipts/${invoiceId}_${uniqueId}_${file.name}`;
  
  await c.env.RECEIPTS_BUCKET.put(fileKey, arrayBuffer, {
    httpMetadata: { contentType: file.type }
  });
  
  const paymentData = JSON.stringify({ receipt_key: fileKey });
  
  await c.env.DB.prepare(`
    INSERT INTO payments (invoice_id, method, payment_data, status) 
    VALUES (?, 'CARD_TRANSFER', ?, 'PENDING_APPROVAL')
  `).bind(invoiceId, paymentData).run();
  
  await c.env.DB.prepare("UPDATE invoices SET status = 'PENDING_APPROVAL' WHERE id = ?").bind(invoiceId).run();

  return c.json({ success: true });
});

api.get('/receipt-image/:key', adminMiddleware, async (c) => {
  const key = c.req.param('key');
  // Reconstruct full key
  const fullKey = `receipts/${key}`;
  const object = await c.env.RECEIPTS_BUCKET.get(fullKey);
  if (!object) return c.json({ error: 'Not found' }, 404);
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  return new Response(object.body, { headers });
});

// --- USER PROFILE (PAYMENTS & INVENTORY) ---
api.get('/payments', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);

  const { results } = await c.env.DB.prepare(`
    SELECT p.*, i.total_price, i.currency 
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.user_id = ?
    ORDER BY p.created_at DESC
  `).bind(user.id).all();
  
  return c.json({ payments: results });
});

api.get('/inventory', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);

  const { results } = await c.env.DB.prepare(`
    SELECT ui.* 
    FROM user_inventory ui
    WHERE ui.user_id = ?
    ORDER BY ui.access_starts_at DESC
  `).bind(user.id).all();
  
  return c.json({ inventory: results });
});

api.get('/invoice/:id', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const invoiceId = c.req.param('id');
  
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?").bind(invoiceId, user.id).first();
  if (!invoice) return c.json({ error: 'Invoice not found' }, 404);
  
  const { results: items } = await c.env.DB.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").bind(invoiceId).all();
  
  // Fetch admin settings for payment
  const { results: settings } = await c.env.DB.prepare("SELECT key, value FROM settings WHERE key IN ('card_holder', 'card_number')").all();
  const paymentInfo = (settings || []).reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
  
  return c.json({ invoice, items, paymentInfo });
});

export default api;
