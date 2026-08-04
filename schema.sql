DROP TABLE IF EXISTS user_usage_logs;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS languages;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language_code TEXT,
    is_premium BOOLEAN DEFAULT 0,
    start_param TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
INSERT INTO roles (id, name) VALUES (1, 'USER'), (2, 'ADMIN'), (3, 'SUPER_ADMIN');

CREATE TABLE themes (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
INSERT INTO themes (id, name) VALUES (1, 'light'), (2, 'dark');

CREATE TABLE languages (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL
);
INSERT INTO languages (id, code) VALUES (1, 'en'), (2, 'fa');

CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    phone_number TEXT,
    role_id INTEGER DEFAULT 1,
    theme_id INTEGER DEFAULT 1,
    language_id INTEGER DEFAULT 2,
    FOREIGN KEY(user_id) REFERENCES users(telegram_id),
    FOREIGN KEY(role_id) REFERENCES roles(id),
    FOREIGN KEY(theme_id) REFERENCES themes(id),
    FOREIGN KEY(language_id) REFERENCES languages(id)
);

CREATE TABLE user_usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(telegram_id)
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    base_price INTEGER NOT NULL,
    stock INTEGER DEFAULT -1,
    is_selling BOOLEAN DEFAULT 1,
    is_hidden BOOLEAN DEFAULT 0,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price_modifier INTEGER DEFAULT 0,
    stock INTEGER DEFAULT -1,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    days INTEGER NOT NULL,
    gb INTEGER NOT NULL,
    price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(telegram_id)
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
