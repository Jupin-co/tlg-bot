DROP TABLE IF EXISTS ticket_messages;
DROP TABLE IF EXISTS tickets;

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  invoice_id INTEGER,
  heading TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(telegram_id),
  FOREIGN KEY(invoice_id) REFERENCES invoices(id)
);

CREATE TABLE ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticket_id) REFERENCES tickets(id),
  FOREIGN KEY(sender_id) REFERENCES users(telegram_id)
);
