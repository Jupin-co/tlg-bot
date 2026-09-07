ALTER TABLE product_variants ADD COLUMN details TEXT;
ALTER TABLE product_variants ADD COLUMN image_url TEXT;
ALTER TABLE baskets ADD COLUMN variant_id INTEGER;
ALTER TABLE invoice_items ADD COLUMN variant_id INTEGER;
ALTER TABLE products ADD COLUMN image_url TEXT;
