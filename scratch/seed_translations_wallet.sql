INSERT INTO translations (message_key, lang_code, message_value) VALUES
('tab_wallet_codes', 'en', 'Wallet Codes'),
('tab_wallet_codes', 'fa', 'کدهای کیف پول'),

('lbl_create_wallet_code', 'en', 'Create Wallet Code'),
('lbl_create_wallet_code', 'fa', 'ایجاد کد کیف پول'),

('lbl_code_string', 'en', 'Code (e.g. SUMMER50)'),
('lbl_code_string', 'fa', 'کد (مثلا SUMMER50)'),

('lbl_amount', 'en', 'Amount'),
('lbl_amount', 'fa', 'مبلغ'),

('lbl_expires_at', 'en', 'Expires At (Optional)'),
('lbl_expires_at', 'fa', 'تاریخ انقضا (اختیاری)'),

('lbl_unique_use', 'en', 'Unique Use (Single time total)'),
('lbl_unique_use', 'fa', 'استفاده یکبار (در کل یکبار)'),

('lbl_multi_use', 'en', 'Multi User Use (Once per user)'),
('lbl_multi_use', 'fa', 'استفاده چند کاربره (هر کاربر یکبار)'),

('btn_create_code', 'en', 'Create Code'),
('btn_create_code', 'fa', 'ایجاد کد'),

('lbl_code_uses', 'en', 'Code Usages'),
('lbl_code_uses', 'fa', 'استفاده‌های کد'),

('lbl_redeem_code', 'en', 'Redeem Code'),
('lbl_redeem_code', 'fa', 'ثبت کد هدیه'),

('msg_redeem_code', 'en', 'Enter a promotional code to charge your wallet.'),
('msg_redeem_code', 'fa', 'برای شارژ کیف پول خود کد تبلیغاتی را وارد کنید.'),

('lbl_code', 'en', 'Code'),
('lbl_code', 'fa', 'کد'),

('btn_redeem', 'en', 'Redeem Code'),
('btn_redeem', 'fa', 'ثبت کد'),

('msg_code_redeemed', 'en', 'Code successfully redeemed!'),
('msg_code_redeemed', 'fa', 'کد با موفقیت ثبت شد!')

ON CONFLICT(lang_code, message_key) DO UPDATE SET message_value=excluded.message_value;
