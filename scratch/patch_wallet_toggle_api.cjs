const fs = require('fs');

let apiCode = fs.readFileSync('src/api/index.ts', 'utf8');

// 1. In GET /admin/wallet-codes, we don't need to change the query, as "SELECT *" will fetch is_active automatically.

// 2. Add POST /admin/wallet-codes/:id/toggle
const endpointToggle = `api.post('/admin/wallet-codes/:id/toggle', async (c) => {
  if (!(await checkSuperAdmin(c))) return c.json({ error: 'Unauthorized' }, 403);
  const codeId = c.req.param('id');
  const codeRow = await c.env.DB.prepare("SELECT is_active FROM wallet_charge_codes WHERE id = ?").bind(codeId).first();
  if (!codeRow) return c.json({ error: 'Not found' }, 404);
  const newStatus = codeRow.is_active ? 0 : 1;
  await c.env.DB.prepare("UPDATE wallet_charge_codes SET is_active = ? WHERE id = ?").bind(newStatus, codeId).run();
  return c.json({ success: true, is_active: newStatus });
});`;

if (!apiCode.includes('/admin/wallet-codes/:id/toggle')) {
  // insert before api.get('/admin/wallet-codes/:id/uses'
  apiCode = apiCode.replace(
    "api.get('/admin/wallet-codes/:id/uses', async (c) => {",
    endpointToggle + "\n\napi.get('/admin/wallet-codes/:id/uses', async (c) => {"
  );
  console.log("Added /toggle endpoint");
}

// 3. Update /wallet/redeem
const oldRedeemCheck = `if (codeRow.max_total_uses > 0) {`;
const newRedeemCheck = `if (codeRow.is_active === 0) {
    return c.json({ error: 'err_code_inactive' }, 400);
  }
  if (codeRow.max_total_uses > 0) {`;

if (apiCode.includes(oldRedeemCheck) && !apiCode.includes('err_code_inactive')) {
    apiCode = apiCode.replace(oldRedeemCheck, newRedeemCheck);
    console.log("Added redeem check for is_active");
}

fs.writeFileSync('src/api/index.ts', apiCode);
console.log("Updated src/api/index.ts");
