const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

code = code.replace(
  /JOIN users u ON m\.sender_id = u\.id/g, 
  "JOIN users u ON m.sender_id = u.telegram_id"
);

code = code.replace(
  /JOIN users u ON t\.user_id = u\.id/g,
  "JOIN users u ON t.user_id = u.telegram_id"
);

fs.writeFileSync('src/api/index.ts', code);
console.log('Fixed JOINs');
