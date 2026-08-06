const fs = require('fs');

// Fix Admin.tsx
let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(
  '<option value={3}>SUPER_ADMIN</option>',
  '<option value={3}>SUPER_ADMIN</option>\n                            <option value={4}>SUPPORT_ADMIN</option>'
);
fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);
console.log('Fixed Admin.tsx');
