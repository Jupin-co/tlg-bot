import sqlite3
import sys

db_path = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a057899cee6fc2d936f120527af1e81c89736982508d9c89562a21207e86ddcb.sqlite'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE profiles ADD COLUMN national_code TEXT;")
    cursor.execute("ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;")
    cursor.execute("ALTER TABLE profiles ADD COLUMN wallet_status TEXT DEFAULT 'UNVERIFIED';")
    cursor.execute("ALTER TABLE profiles ADD COLUMN wallet_balance INTEGER DEFAULT 0;")
    cursor.execute("ALTER TABLE invoices ADD COLUMN type TEXT DEFAULT 'PRODUCT_PURCHASE';")
    conn.commit()
    conn.close()
    print("Migration successful")
except Exception as e:
    print(f"Migration failed: {e}")
    sys.exit(1)
