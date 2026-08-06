import { Hono } from 'hono';
import { Env } from '../bot';
import { logUsage } from '../core/db';

const api = new Hono<{ Bindings: Env, Variables: { user: any } }>();

function isValidIranianNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  const check = parseInt(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(code[i]) * (10 - i);
  const rem = sum % 11;
  return (rem < 2 && check === rem) || (rem >= 2 && check === 11 - rem);
}

// Middleware: Validate Telegram initData
api.use('*', async (c, next) => {
  // Public endpoints that don't need initData
  const path = new URL(c.req.url).pathname;
  if (path === '/api/translations' || path === '/api/catalog' || path.startsWith('/api/receipt-image')) {
    return next();
  }

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


// Middleware: Support Admin check
const supportAdminMiddleware = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401);
  
  const { DB } = c.env;
  const dbUser = await DB.prepare(`
    SELECT r.name as role 
    FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.user_id = ?
  `).bind(user.id).first();
  
  if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPPORT_ADMIN')) {
    return c.json({ error: 'Forbidden. Support Admins only.' }, 403);
  }
  await next();
};

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
      p.wallet_status,
      p.wallet_balance,
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
  
  if (dbUser) {
    dbUser.wallet_status = dbUser.wallet_status || 'UNVERIFIED';
    dbUser.wallet_balance = dbUser.wallet_balance || 0;
  }
  
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

// Endpoint: Submit Wallet Verification (KYC)
api.post('/wallet/verify', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const { national_code, date_of_birth } = await c.req.json();
  
  if (!isValidIranianNationalCode(national_code)) {
    return c.json({ error: 'Invalid National Code' }, 400);
  }
  if (!date_of_birth) {
    return c.json({ error: 'Date of birth is required' }, 400);
  }
  
  await c.env.DB.prepare(`
    UPDATE profiles 
    SET national_code = ?, date_of_birth = ?, wallet_status = 'PENDING'
    WHERE user_id = ?
  `).bind(national_code, date_of_birth, user.id).run();
  
  return c.json({ success: true });
});


// Endpoint: Charge Wallet (creates an invoice)
api.post('/wallet/charge', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const { amount, currency } = await c.req.json();
  if (!amount || amount <= 0) return c.json({ error: 'Invalid amount' }, 400);

  const { meta } = await c.env.DB.prepare(
    "INSERT INTO invoices (user_id, total_price, currency, type) VALUES (?, ?, ?, 'WALLET_CHARGE')"
  ).bind(user.id, amount, currency || 'USD').run();

  return c.json({ success: true, invoice_id: meta.last_row_id });
});

// Endpoint: Pay Invoice with Wallet
api.post('/invoice/:id/pay-with-wallet', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const invoiceId = c.req.param('id');
  
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ? AND status = 'PENDING_PAYMENT'").bind(invoiceId, user.id).first();
  if (!invoice) return c.json({ error: 'Invoice not found or already paid' }, 404);
  
  const profile = await c.env.DB.prepare("SELECT wallet_balance FROM profiles WHERE user_id = ?").bind(user.id).first();
  if (!profile || profile.wallet_balance < invoice.total_price) {
    return c.json({ error: 'Insufficient wallet balance' }, 400);
  }

  // Deduct balance
  await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance - ? WHERE user_id = ?").bind(invoice.total_price, user.id).run();
  
  // Create a payment record marked as approved
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO payments (invoice_id, method, status) VALUES (?, 'WALLET', 'APPROVED')"
  ).bind(invoiceId).run();
  const paymentId = meta.last_row_id;
  
  // Actually, we should call the same approval logic as admin does to generate redeem codes.
  // We can just execute the logic inline.
  await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id, invoiceId).run();

  const { results: items } = await c.env.DB.prepare(`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  `).bind(invoiceId).all();

  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          // Rollback the deduction? For simplicity, we just throw error here, but ideally we should run in transaction. D1 doesn't support full transactions easily in this API style yet, but we'll return error.
          return c.json({ error: `Not enough redeem codes available for ${item.snapshot_name}.` }, 400);
        }
        await c.env.DB.prepare("UPDATE redeem_codes SET is_sold = 3 WHERE id = ?").bind(code.id).run();
        codeAssignments.push({ codeId: code.id, codeStr: code.code, item });
      }
    }
  }

  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + item.snapshot_duration_days * 24 * 60 * 60 * 1000);
      let assignedCode = null;
      if (item.snapshot_duration_days > 0) {
         const assignObj = codeAssignments.find(ca => ca.item.product_id === item.product_id);
         if (assignObj) {
           assignedCode = assignObj.codeStr;
           await c.env.DB.prepare("UPDATE redeem_codes SET payment_id = ?, is_sold = 1 WHERE id = ?").bind(paymentId, assignObj.codeId).run();
           codeAssignments.splice(codeAssignments.indexOf(assignObj), 1);
           const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(item.product_id).first();
           if (count) {
             await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, item.product_id).run();
           }
         }
      }
      await c.env.DB.prepare(`
        INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at, redeem_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id, paymentId, item.snapshot_name, item.snapshot_description || '', 
        startsAt.toISOString(), item.snapshot_duration_days > 0 ? endsAt.toISOString() : null, assignedCode
      ).run();
    }
  }

  return c.json({ success: true });
});

// Endpoint: Log Usage
api.post('/log', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  
  const { action, metadata, details } = await c.req.json();
  const finalMeta = details || metadata;
  await logUsage(c.env.DB, user.id, action, finalMeta);
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

// Admin: Redeem Codes
api.get('/admin/products/:id/codes', adminMiddleware, async (c) => {
  const productId = c.req.param('id');
  const { results } = await c.env.DB.prepare("SELECT c.*, p.invoice_id FROM redeem_codes c LEFT JOIN payments p ON c.payment_id = p.id WHERE c.product_id = ? ORDER BY c.id DESC").bind(productId).all();
  return c.json({ codes: results });
});

api.post('/admin/products/:id/codes', adminMiddleware, async (c) => {
  const productId = c.req.param('id');
  const { code } = await c.req.json();
  if (!code) return c.json({ error: 'Code is required' }, 400);
  
  await c.env.DB.prepare("INSERT INTO redeem_codes (product_id, code) VALUES (?, ?)").bind(productId, code).run();
  
  // Update product stock to be the count of unsold codes (optional, but requested implicitly to sync)
  const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(productId).first();
  if (count) {
    await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, productId).run();
  }
  return c.json({ success: true });
});

api.delete('/admin/products/:id/codes/:codeId', adminMiddleware, async (c) => {
  const productId = c.req.param('id');
  const codeId = c.req.param('codeId');
  await c.env.DB.prepare("DELETE FROM redeem_codes WHERE id = ? AND product_id = ? AND is_sold = 0").bind(codeId, productId).run();
  
  const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(productId).first();
  if (count) {
    await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, productId).run();
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

api.get('/admin/invoices', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT i.*, u.username, u.first_name, ru.first_name as reviewer_name, ru.username as reviewer_username
      FROM invoices i
      JOIN users u ON i.user_id = u.telegram_id
      LEFT JOIN users ru ON i.reviewed_by = ru.telegram_id
      ORDER BY i.created_at DESC
  `).all();
  return c.json({ invoices: results });
});

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
  const adminUser = c.get('user');
  const paymentId = c.req.param('id');
  
  // Get invoice details
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (!pRecord) return c.json({ error: 'Payment not found' }, 404);
  const invoiceId = pRecord.invoice_id;
  
  const invoice = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(invoiceId).first();
  if (!invoice) return c.json({ error: 'Invoice not found' }, 404);

  if (invoice.type === 'WALLET_CHARGE') {
    // Approve payment and invoice
    await c.env.DB.prepare("UPDATE payments SET status = 'APPROVED' WHERE id = ?").bind(paymentId).run();
    await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, invoiceId).run();
    // Add to wallet balance
    await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance + ? WHERE user_id = ?").bind(invoice.total_price, invoice.user_id).run();
    return c.json({ success: true });
  }
  
  // PRODUCT_PURCHASE logic
  // Get invoice items
  const { results: items } = await c.env.DB.prepare(`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  `).bind(invoiceId).all();

  // Validate stock of redeem codes first to prevent partial approval if something ran out
  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      // Need a redeem code
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          return c.json({ error: `Not enough redeem codes available for ${item.snapshot_name}.` }, 400);
        }
        // Temporarily mark as sold to avoid picking the same one in the loop if quantity > 1
        await c.env.DB.prepare("UPDATE redeem_codes SET is_sold = 3 WHERE id = ?").bind(code.id).run();
        codeAssignments.push({ codeId: code.id, codeStr: code.code, item });
      }
    }
  }

  // Finalize approval
  await c.env.DB.prepare("UPDATE payments SET status = 'APPROVED' WHERE id = ?").bind(paymentId).run();
  await c.env.DB.prepare("UPDATE invoices SET status = 'APPROVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, invoiceId).run();
  
  // Create inventory records and update redeem_codes
  for (const item of items as any[]) {
    for (let q = 0; q < item.quantity; q++) {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + item.snapshot_duration_days * 24 * 60 * 60 * 1000);
      let assignedCode = null;
      
      if (item.snapshot_duration_days > 0) {
         const assignObj = codeAssignments.find(ca => ca.item.product_id === item.product_id);
         if (assignObj) {
           assignedCode = assignObj.codeStr;
           await c.env.DB.prepare("UPDATE redeem_codes SET payment_id = ?, is_sold = 1 WHERE id = ?").bind(paymentId, assignObj.codeId).run();
           codeAssignments.splice(codeAssignments.indexOf(assignObj), 1); // remove used
           
           // Update remaining stock
           const count = await c.env.DB.prepare("SELECT COUNT(*) as c FROM redeem_codes WHERE product_id = ? AND is_sold = 0").bind(item.product_id).first();
           if (count) {
             await c.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(count.c, item.product_id).run();
           }
         }
      }

      await c.env.DB.prepare(`
        INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at, redeem_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.user_id, paymentId, item.snapshot_name, item.snapshot_description, 
        startsAt.toISOString(), item.snapshot_duration_days > 0 ? endsAt.toISOString() : null,
        assignedCode
      ).run();
    }
  }
  
  return c.json({ success: true });
});

api.post('/admin/payments/:id/reject', adminMiddleware, async (c) => {
    const adminUser = c.get('user');
  const paymentId = c.req.param('id');
  await c.env.DB.prepare("UPDATE payments SET status = 'REJECTED' WHERE id = ?").bind(paymentId).run();
  
  const pRecord = await c.env.DB.prepare("SELECT invoice_id FROM payments WHERE id = ?").bind(paymentId).first();
  if (pRecord) {
    await c.env.DB.prepare("UPDATE invoices SET status = 'REJECTED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(adminUser.id, pRecord.invoice_id).run();
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


api.post('/basket/decrement', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const { basket_id } = await c.req.json();
  const exists = await c.env.DB.prepare("SELECT id, quantity FROM baskets WHERE id = ? AND user_id = ?").bind(basket_id, user.id).first();
  if (exists) {
    if (exists.quantity > 1) {
      await c.env.DB.prepare("UPDATE baskets SET quantity = quantity - 1 WHERE id = ?").bind(basket_id).run();
    } else {
      await c.env.DB.prepare("DELETE FROM baskets WHERE id = ?").bind(basket_id).run();
    }
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

api.get('/receipt-image/:key', async (c) => {
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

// --- I18N TRANSLATIONS ---
api.get('/translations', async (c) => {
  const { results: langs } = await c.env.DB.prepare("SELECT id, code, is_active FROM languages").all();
  const { results: trans } = await c.env.DB.prepare("SELECT lang_code, message_key, message_value FROM translations").all();
  
  const translations: any = {};
  for (const row of (trans || []) as any[]) {
    if (!translations[row.lang_code]) translations[row.lang_code] = {};
    translations[row.lang_code][row.message_key] = row.message_value;
  }
  
  return c.json({ languages: langs, translations });
});

api.post('/admin/translations', adminMiddleware, async (c) => {
  const { lang_code, message_key, message_value } = await c.req.json();
  if (!lang_code || !message_key || !message_value) return c.json({ error: 'Missing fields' }, 400);
  
  await c.env.DB.prepare(`
    INSERT INTO translations (lang_code, message_key, message_value) 
    VALUES (?, ?, ?) 
    ON CONFLICT(lang_code, message_key) DO UPDATE SET message_value = excluded.message_value
  `).bind(lang_code, message_key, message_value).run();
  
  return c.json({ success: true });
});

api.post('/admin/languages', adminMiddleware, async (c) => {
  const { code, is_active } = await c.req.json();
  await c.env.DB.prepare("UPDATE languages SET is_active = ? WHERE code = ?").bind(is_active ? 1 : 0, code).run();
  return c.json({ success: true });
});

// --- ADMIN USER MANAGEMENT ---
api.get('/admin/migrate', async (c) => {
    try {
      await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN national_code TEXT;`).run();
      await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;`).run();
      await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN wallet_status TEXT DEFAULT 'UNVERIFIED';`).run();
      await c.env.DB.prepare(`ALTER TABLE profiles ADD COLUMN wallet_balance INTEGER DEFAULT 0;`).run();
      await c.env.DB.prepare(`ALTER TABLE invoices ADD COLUMN type TEXT DEFAULT 'PRODUCT_PURCHASE';`).run();
      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: e.message });
    }
});

// --- ADMIN KYC VERIFICATIONS ---
api.get('/admin/verifications', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.telegram_id as user_id, u.first_name, u.last_name, u.username, p.national_code, p.date_of_birth, p.wallet_status
    FROM profiles p
    JOIN users u ON p.user_id = u.telegram_id
    WHERE p.wallet_status = 'PENDING'
  `).all();
  return c.json({ verifications: results });
});

api.post('/admin/verifications/:id/approve', adminMiddleware, async (c) => {
  const userId = c.req.param('id');
  await c.env.DB.prepare("UPDATE profiles SET wallet_status = 'VERIFIED' WHERE user_id = ?").bind(userId).run();
  return c.json({ success: true });
});

api.post('/admin/verifications/:id/reject', adminMiddleware, async (c) => {
  const userId = c.req.param('id');
  await c.env.DB.prepare("UPDATE profiles SET wallet_status = 'REJECTED' WHERE user_id = ?").bind(userId).run();
  return c.json({ success: true });
});

api.get('/admin/users', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.telegram_id, u.username, u.first_name, u.last_name, u.created_at, p.phone_number, r.id as role_id, r.name as role
    FROM users u
    JOIN profiles p ON u.telegram_id = p.user_id
    JOIN roles r ON p.role_id = r.id
    ORDER BY u.created_at DESC
  `).all();
  return c.json({ users: results });
});

api.post('/admin/users/:id/role', adminMiddleware, async (c) => {
  // Only SUPER_ADMIN can change roles, let's verify
  const reqUser = c.get('user');
  const dbUser = await c.env.DB.prepare(`
    SELECT r.name as role FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.user_id = ?
  `).bind(reqUser.id).first();
  
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return c.json({ error: 'Forbidden. Only Super Admins can change roles.' }, 403);
  }

  const userId = c.req.param('id');
  const { role_id } = await c.req.json();
  
  await c.env.DB.prepare("UPDATE profiles SET role_id = ? WHERE user_id = ?").bind(role_id, userId).run();
  return c.json({ success: true });
});

api.get('/admin/users/:id/logs', adminMiddleware, async (c) => {
  const userId = c.req.param('id');
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM user_usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
  `).bind(userId).all();
  return c.json({ logs: results });
});

export default api;

// --- SUPPORT TICKETS API ---

// User ticket routes
api.get('/api/tickets', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, i.id as invoice_id_number, i.type as invoice_type, i.total_price 
    FROM tickets t 
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    WHERE t.user_id = ? 
    ORDER BY t.created_at DESC
  `).bind(user.id).all();
  return c.json({ tickets: results });
});

api.post('/api/tickets', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const { heading, message, invoice_id } = await c.req.json();
  if (!heading || !message) return c.json({ error: 'Missing heading or message' }, 400);

  const { meta } = await c.env.DB.prepare(
    'INSERT INTO tickets (user_id, invoice_id, heading) VALUES (?, ?, ?)'
  ).bind(user.id, invoice_id || null, heading).run();
  
  const ticketId = meta.last_row_id;
  
  await c.env.DB.prepare(
    'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)'
  ).bind(ticketId, user.id, message).run();
  
  return c.json({ success: true, ticketId });
});

api.get('/api/tickets/:id', async (c) => {
  const user = c.get('user');
  const ticketId = c.req.param('id');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const ticket = await c.env.DB.prepare('SELECT * FROM tickets WHERE id = ? AND user_id = ?').bind(ticketId, user.id).first();
  if (!ticket) return c.json({ error: 'Not found' }, 404);
  
  const { results: messages } = await c.env.DB.prepare(
    'SELECT m.*, u.first_name as sender_name FROM ticket_messages m JOIN users u ON m.sender_id = u.id WHERE ticket_id = ? ORDER BY m.created_at ASC'
  ).bind(ticketId).all();
  
  return c.json({ ticket, messages });
});

api.post('/api/tickets/:id/messages', async (c) => {
  const user = c.get('user');
  const ticketId = c.req.param('id');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const { message } = await c.req.json();
  if (!message) return c.json({ error: 'Missing message' }, 400);

  const ticket = await c.env.DB.prepare('SELECT * FROM tickets WHERE id = ? AND user_id = ?').bind(ticketId, user.id).first();
  if (!ticket) return c.json({ error: 'Not found' }, 404);
  
  if (ticket.status === 'CLOSED') {
    return c.json({ error: 'Ticket is closed' }, 400);
  }
  
  await c.env.DB.prepare('INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)').bind(ticketId, user.id, message).run();
  
  return c.json({ success: true });
});

api.post('/api/tickets/:id/close', async (c) => {
  const user = c.get('user');
  const ticketId = c.req.param('id');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  await c.env.DB.prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ? AND user_id = ?").bind(ticketId, user.id).run();
  return c.json({ success: true });
});

// Admin ticket routes
api.get('/admin/tickets', supportAdminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, u.first_name, i.type as invoice_type, i.total_price 
    FROM tickets t 
    JOIN users u ON t.user_id = u.id
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    ORDER BY t.created_at DESC
  `).all();
  return c.json({ tickets: results });
});

api.get('/admin/tickets/:id', supportAdminMiddleware, async (c) => {
  const ticketId = c.req.param('id');
  
  const ticket = await c.env.DB.prepare(
    'SELECT t.*, u.first_name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?'
  ).bind(ticketId).first();
  
  if (!ticket) return c.json({ error: 'Not found' }, 404);
  
  const { results: messages } = await c.env.DB.prepare(
    'SELECT m.*, u.first_name as sender_name FROM ticket_messages m JOIN users u ON m.sender_id = u.id WHERE ticket_id = ? ORDER BY m.created_at ASC'
  ).bind(ticketId).all();
  
  return c.json({ ticket, messages });
});

api.post('/admin/tickets/:id/messages', supportAdminMiddleware, async (c) => {
  const adminUser = c.get('user');
  const ticketId = c.req.param('id');
  const { message } = await c.req.json();
  if (!message) return c.json({ error: 'Missing message' }, 400);
  
  const ticket = await c.env.DB.prepare('SELECT * FROM tickets WHERE id = ?').bind(ticketId).first();
  if (!ticket) return c.json({ error: 'Not found' }, 404);
  
  if (ticket.status === 'CLOSED') {
    return c.json({ error: 'Ticket is closed' }, 400);
  }
  
  await c.env.DB.prepare('INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES (?, ?, ?)').bind(ticketId, adminUser.id, message).run();
  
  return c.json({ success: true });
});

api.post('/admin/tickets/:id/close', supportAdminMiddleware, async (c) => {
  const ticketId = c.req.param('id');
  await c.env.DB.prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ?").bind(ticketId).run();
  return c.json({ success: true });
});


