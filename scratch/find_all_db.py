import sqlite3
import os

def find_db():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.sqlite') or file.endswith('.db') or file.endswith('.sqlite3'):
                db_path = os.path.join(root, file)
                try:
                    conn = sqlite3.connect(db_path)
                    cursor = conn.cursor()
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                    tables = cursor.fetchall()
                    table_names = [t[0] for t in tables]
                    if 'profiles' in table_names:
                        print(f"FOUND: {db_path} - Tables: {table_names}")
                    conn.close()
                except Exception as e:
                    pass

find_db()
