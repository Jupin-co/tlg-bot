
// --- WALLET CODES API ---

api.post('/admin/wallet-codes', adminMiddleware, async (c) => {
  const { code: newCode, amount, expires_at, max_total_uses } = await c.req.json();
  if (!newCode || !amount) return c.json({ error: 'Missing fields' }, 400);

  try {
    await c.env.DB.prepare(
      "INSERT INTO wallet_charge_codes (code, amount, expires_at, max_total_uses) VALUES (?, ?, ?, ?)"
    ).bind(newCode, amount, expires_at || null, max_total_uses || null).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: 'Code already exists or invalid data' }, 400);
  }
});

api.get('/admin/wallet-codes', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT c.*, COUNT(u.id) as uses 
    FROM wallet_charge_codes c 
    LEFT JOIN wallet_charge_code_uses u ON c.id = u.code_id 
    GROUP BY c.id 
    ORDER BY c.created_at DESC
  `).all();
  return c.json({ codes: results });
});

api.get('/admin/wallet-codes/:id/uses', adminMiddleware, async (c) => {
  const codeId = c.req.param('id');
  const { results } = await c.env.DB.prepare(`
    SELECT u.*, usr.first_name, usr.username 
    FROM wallet_charge_code_uses u 
    JOIN users usr ON u.user_id = usr.telegram_id 
    WHERE u.code_id = ? 
    ORDER BY u.created_at DESC
  `).bind(codeId).all();
  return c.json({ uses: results });
});

api.post('/wallet/redeem', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { code } = await c.req.json();
  if (!code) return c.json({ error: 'Code is required' }, 400);

  // Check if wallet is ACTIVE
  const profile = await c.env.DB.prepare("SELECT wallet_status FROM profiles WHERE user_id = ?").bind(user.id).first();
  if (!profile || profile.wallet_status !== 'ACTIVE') {
    return c.json({ error: 'Wallet is not active' }, 400);
  }

  // Fetch the code
  const codeRow = await c.env.DB.prepare("SELECT * FROM wallet_charge_codes WHERE code = ?").bind(code).first();
  if (!codeRow) {
    return c.json({ error: 'Invalid code' }, 400);
  }

  // Check expiration
  if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
    return c.json({ error: 'Code has expired' }, 400);
  }

  // Check max uses
  if (codeRow.max_total_uses) {
    const { count } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM wallet_charge_code_uses WHERE code_id = ?").bind(codeRow.id).first();
    if (count >= codeRow.max_total_uses) {
      return c.json({ error: 'Code usage limit reached' }, 400);
    }
  }

  // Check if user already used it
  try {
    await c.env.DB.prepare(
      "INSERT INTO wallet_charge_code_uses (code_id, user_id) VALUES (?, ?)"
    ).bind(codeRow.id, user.id).run();
  } catch (err) {
    return c.json({ error: 'You have already redeemed this code' }, 400);
  }

  // Add balance
  await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance + ? WHERE user_id = ?").bind(codeRow.amount, user.id).run();

  // Log usage
  await c.env.DB.prepare(
    "INSERT INTO user_usage_logs (user_id, action, metadata) VALUES (?, 'REDEEM_WALLET_CODE', ?)"
  ).bind(user.id, JSON.stringify({ code: codeRow.code, amount: codeRow.amount })).run();

  return c.json({ success: true, amount: codeRow.amount });
});
