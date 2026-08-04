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

export default {
  fetch: app.fetch,
  async scheduled(event: any, env: Env, ctx: any) {
    // 1. Delete PENDING_PAYMENT invoices > 30 mins old
    await env.DB.prepare(`
      DELETE FROM invoices 
      WHERE status = 'PENDING_PAYMENT' AND expires_at < datetime('now')
    `).run();

    // 2. Delete REJECTED payments and their invoices > 2 days old
    const { results } = await env.DB.prepare(`
      SELECT p.id, p.payment_data, p.invoice_id 
      FROM payments p 
      WHERE p.status = 'REJECTED' AND p.created_at < datetime('now', '-2 days')
    `).all();
    
    if (results && results.length > 0) {
      for (const p of results as any[]) {
        try {
          if (p.payment_data) {
            const data = JSON.parse(p.payment_data);
            if (data.receipt_key) {
              await env.RECEIPTS_BUCKET.delete(data.receipt_key);
            }
          }
        } catch (e) {
          console.error("Failed to delete R2 object", e);
        }
        // Deleting the invoice will cascade to delete the payment and invoice_items
        await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(p.invoice_id).run();
      }
    }
  }
};
