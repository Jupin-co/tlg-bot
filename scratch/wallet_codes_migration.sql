CREATE TABLE IF NOT EXISTS wallet_charge_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    expires_at TIMESTAMP,
    max_total_uses INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_charge_code_uses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(code_id) REFERENCES wallet_charge_codes(id),
    FOREIGN KEY(user_id) REFERENCES users(telegram_id),
    UNIQUE(code_id, user_id)
);
