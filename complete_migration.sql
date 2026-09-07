-- Add image_url to products if not exists
ALTER TABLE products ADD COLUMN image_url TEXT;

-- Create variants table if not exists
CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price_modifier INTEGER DEFAULT 0,
    stock INTEGER DEFAULT -1,
    details TEXT,
    image_url TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Add variant_id to baskets if not exists
ALTER TABLE baskets ADD COLUMN variant_id INTEGER REFERENCES product_variants(id);

-- Add variant support to invoice_items if not exists
ALTER TABLE invoice_items ADD COLUMN variant_id INTEGER REFERENCES product_variants(id);
