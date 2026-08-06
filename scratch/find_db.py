import sqlite3
import os

folder = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/'
for file in os.listdir(folder):
    if file.endswith('.sqlite'):
        try:
            conn = sqlite3.connect(os.path.join(folder, file))
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            print(f"File: {file} - Tables: {[t[0] for t in tables]}")
            conn.close()
        except Exception as e:
            pass
