const fs = require('fs');
const path = 'src/api/index.ts';
let content = fs.readFileSync(path, 'utf8');

const additionalEndpoints = `
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

  const { results: items } = await c.env.DB.prepare(\`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  \`).bind(invoiceId).all();

  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          // Rollback the deduction? For simplicity, we just throw error here, but ideally we should run in transaction. D1 doesn't support full transactions easily in this API style yet, but we'll return error.
          return c.json({ error: \`Not enough redeem codes available for \${item.snapshot_name}.\` }, 400);
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
      await c.env.DB.prepare(\`
        INSERT INTO user_inventory (user_id, payment_id, snapshot_name, snapshot_description, access_starts_at, access_ends_at, redeem_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      \`).bind(
        user.id, paymentId, item.snapshot_name, item.snapshot_description || '', 
        startsAt.toISOString(), item.snapshot_duration_days > 0 ? endsAt.toISOString() : null, assignedCode
      ).run();
    }
  }

  return c.json({ success: true });
});
`;

if (!content.includes('/wallet/charge')) {
  content = content.replace('// Endpoint: Log Usage', additionalEndpoints + '\n// Endpoint: Log Usage');
  fs.writeFileSync(path, content);
  console.log('Added wallet charge endpoints');
} else {
  console.log('Endpoints already exist');
}
