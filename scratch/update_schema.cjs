const fs = require('fs');
let code = fs.readFileSync('schema.sql', 'utf8');

if (!code.includes('SUPPORT_ADMIN')) {
  code = code.replace(
    "INSERT INTO roles (name) VALUES ('SUPER_ADMIN');",
    "INSERT INTO roles (name) VALUES ('SUPER_ADMIN');\nINSERT INTO roles (name) VALUES ('SUPPORT_ADMIN');"
  );
}

if (!code.includes('CREATE TABLE tickets')) {
  code += `\n\nCREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  invoice_id INTEGER,
  heading TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(invoice_id) REFERENCES invoices(id)
);\n\nCREATE TABLE ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticket_id) REFERENCES tickets(id),
  FOREIGN KEY(sender_id) REFERENCES users(id)
);\n`;
}

fs.writeFileSync('schema.sql', code);
console.log('Schema updated');
