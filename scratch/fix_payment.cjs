const fs = require('fs');

const path = 'src/api/index.ts';
let content = fs.readFileSync(path, 'utf8');

// I need to find the mangled api.post('/admin/payments/:id/approve' ...
// and replace it with the correct implementation.

const startRegex = /api\.post\('\/admin\/payments\/:id\/approve', adminMiddleware, async \(c\) => \{\r?\n\s*\}\r?\n\s*\}/;

const correctCode = `api.post('/admin/payments/:id/approve', adminMiddleware, async (c) => {
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
  const { results: items } = await c.env.DB.prepare(\`
    SELECT ii.product_id, i.user_id, ii.snapshot_name, ii.snapshot_description, ii.snapshot_duration_days, ii.quantity
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.invoice_id = ?
  \`).bind(invoiceId).all();

  // Validate stock of redeem codes first to prevent partial approval if something ran out
  const codeAssignments = [];
  for (const item of items) {
    if (item.snapshot_duration_days > 0) {
      // Need a redeem code
      for (let q = 0; q < item.quantity; q++) {
        const code = await c.env.DB.prepare("SELECT id, code FROM redeem_codes WHERE product_id = ? AND (is_sold = 2 OR is_sold = 0) ORDER BY is_sold DESC LIMIT 1").bind(item.product_id).first();
        if (!code) {
          return c.json({ error: \`Not enough redeem codes available for \${item.snapshot_name}.\` }, 400);
        }
        // Temporarily mark as sold to avoid picking the same one in the loop if quantity > 1
        await c.env.DB.prepare("UPDATE redeem_codes SET is_sold = 3 WHERE id = ?").bind(code.id).run();
        codeAssignments.push({ codeId: code.id, codeStr: code.code, item });
      }
    }
  }`;

content = content.replace(startRegex, correctCode);
fs.writeFileSync(path, content);
console.log('Fixed payment approval endpoint');
