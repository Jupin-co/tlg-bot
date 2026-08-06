const fs = require('fs');
const file = 'src/api/index.ts';
let code = fs.readFileSync(file, 'utf8');

const newCode = `
// --- WALLET CODES (ADMIN) ---

api.get('/admin/wallet-codes', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(\`
    SELECT c.*, COUNT(u.id) as use_count
    FROM wallet_charge_codes c
    LEFT JOIN wallet_charge_code_uses u ON c.id = u.code_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  \`).all();
  return c.json({ codes: results });
});

api.post('/admin/wallet-codes', adminMiddleware, async (c) => {
  const { code: newCode, amount, expires_at, max_total_uses } = await c.req.json();
  if (!newCode || !amount) return c.json({ error: 'Missing required fields' }, 400);

  try {
    await c.env.DB.prepare(\`
      INSERT INTO wallet_charge_codes (code, amount, expires_at, max_total_uses)
      VALUES (?, ?, ?, ?)
    \`).bind(
      newCode, 
      amount, 
      expires_at || null, 
      max_total_uses || null
    ).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

api.get('/admin/wallet-codes/:id/uses', adminMiddleware, async (c) => {
  const codeId = c.req.param('id');
  const { results } = await c.env.DB.prepare(\`
    SELECT u.created_at as used_at, us.username, us.first_name, us.telegram_id
    FROM wallet_charge_code_uses u
    JOIN users us ON u.user_id = us.telegram_id
    WHERE u.code_id = ?
    ORDER BY u.created_at DESC
  \`).bind(codeId).all();
  return c.json({ uses: results });
});

// --- WALLET REDEMPTION ---

api.post('/wallet/redeem', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'No user data' }, 400);
  const { code: inputCode } = await c.req.json();
  if (!inputCode) return c.json({ error: 'Code is required' }, 400);

  const profile = await c.env.DB.prepare("SELECT wallet_status FROM profiles WHERE user_id = ?").bind(user.id).first();
  if (!profile || profile.wallet_status !== 'ACTIVE') {
    return c.json({ error: 'Wallet is not active' }, 400);
  }

  const codeRecord = await c.env.DB.prepare("SELECT * FROM wallet_charge_codes WHERE code = ?").bind(inputCode).first();
  if (!codeRecord) return c.json({ error: 'Invalid code' }, 400);

  if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
    return c.json({ error: 'Code has expired' }, 400);
  }

  // Check if user already used this code
  const existingUse = await c.env.DB.prepare("SELECT id FROM wallet_charge_code_uses WHERE code_id = ? AND user_id = ?").bind(codeRecord.id, user.id).first();
  if (existingUse) {
    return c.json({ error: 'You have already used this code' }, 400);
  }

  // Check max uses
  if (codeRecord.max_total_uses) {
    const { count } = await c.env.DB.prepare("SELECT COUNT(*) as count FROM wallet_charge_code_uses WHERE code_id = ?").bind(codeRecord.id).first();
    if (count >= codeRecord.max_total_uses) {
      return c.json({ error: 'Code usage limit reached' }, 400);
    }
  }

  // Apply charge
  try {
    await c.env.DB.prepare("UPDATE profiles SET wallet_balance = wallet_balance + ? WHERE user_id = ?").bind(codeRecord.amount, user.id).run();
    await c.env.DB.prepare("INSERT INTO wallet_charge_code_uses (code_id, user_id) VALUES (?, ?)").bind(codeRecord.id, user.id).run();
    return c.json({ success: true, newAmount: codeRecord.amount });
  } catch (e: any) {
    return c.json({ error: 'Failed to redeem code' }, 500);
  }
});
`;

if (!code.includes('api.get(\'/admin/wallet-codes\'')) {
  // Insert before standard error handler at bottom
  code = code.replace('export default app;', newCode + '\\nexport default app;');
  fs.writeFileSync(file, code);
  console.log('src/api/index.ts patched successfully');
} else {
  console.log('src/api/index.ts already contains wallet codes logic');
}
