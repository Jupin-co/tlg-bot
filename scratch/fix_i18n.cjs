const fs = require('fs');
let code = fs.readFileSync('frontend/src/i18n.ts', 'utf8');

// Add en
code = code.replace(
  'tab_settings: "Settings",',
  'tab_settings: "Settings",\n      tab_inventory: "Inventory",\n      lbl_support: "Support",'
);

// Add fa
code = code.replace(
  'tab_settings: "تنظیمات",',
  'tab_settings: "تنظیمات",\n      tab_inventory: "موجودی",\n      lbl_support: "پشتیبانی",'
);

fs.writeFileSync('frontend/src/i18n.ts', code);
console.log('Fixed i18n');
