import { Database } from "bun:sqlite";
const db = new Database(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/a057899cee6fc2d936f120527af1e81c89736982508d9c89562a21207e86ddcb.sqlite");

try {
  db.exec(`
    ALTER TABLE profiles ADD COLUMN national_code TEXT;
    ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;
    ALTER TABLE profiles ADD COLUMN wallet_status TEXT DEFAULT 'UNVERIFIED';
    ALTER TABLE profiles ADD COLUMN wallet_balance INTEGER DEFAULT 0;
    
    ALTER TABLE invoices ADD COLUMN type TEXT DEFAULT 'PRODUCT_PURCHASE';
  `);
  console.log("Migration successful");
} catch (e) {
  console.error("Migration failed: ", e);
}
db.close();
