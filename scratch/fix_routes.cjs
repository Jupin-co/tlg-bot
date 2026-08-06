const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

code = code.replace(/api\.get\('\/api\/tickets/g, "api.get('/tickets");
code = code.replace(/api\.post\('\/api\/tickets/g, "api.post('/tickets");

fs.writeFileSync('src/api/index.ts', code);
console.log('Fixed API routes');
