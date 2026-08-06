const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

const adminMiddlewareBlock = `// Middleware: Admin check
const adminMiddleware = async (c: any, next: any) => {`;

const supportAdminMiddlewareBlock = `
// Middleware: Support Admin check
const supportAdminMiddleware = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401);
  
  const { DB } = c.env;
  const dbUser = await DB.prepare(\`
    SELECT r.name as role 
    FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.user_id = ?
  \`).bind(user.id).first();
  
  if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPPORT_ADMIN')) {
    return c.json({ error: 'Forbidden. Support Admins only.' }, 403);
  }
  await next();
};
`;

if (!code.includes('const supportAdminMiddleware')) {
  code = code.replace(adminMiddlewareBlock, supportAdminMiddlewareBlock + '\n' + adminMiddlewareBlock);
}

const newRoutes = `
// --- SUPPORT TICKETS API ---

// User ticket routes
api.get('/api/tickets', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const { results } = await c.env.DB.prepare(\`
    SELECT t.*, i.id as invoice_id_number, i.type as invoice_type, i.total_price 
    FROM tickets t 
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    WHERE t.user_id = ? 
    ORDER BY t.created_at DESC
  \`).bind(user.id).all();
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
  const { results } = await c.env.DB.prepare(\`
    SELECT t.*, u.first_name, i.type as invoice_type, i.total_price 
    FROM tickets t 
    JOIN users u ON t.user_id = u.id
    LEFT JOIN invoices i ON t.invoice_id = i.id 
    ORDER BY t.created_at DESC
  \`).all();
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
`;

if (!code.includes('/api/tickets')) {
  // Strip the existing "export default app;" and add the new routes
  code = code.replace(/export default app;\s*$/, '');
  code += newRoutes + '\nexport default app;\n';
}

fs.writeFileSync('src/api/index.ts', code);
