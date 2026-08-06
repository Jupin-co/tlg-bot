const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The line is: <div style={{ flex: 1, overflowY: 'auto', marginTop: '8px', paddingRight: '8px' }}>
code = code.replace(
  "<div style={{ flex: 1, overflowY: 'auto', marginTop: '8px', paddingRight: '8px' }}>",
  "<div style={{ flex: 1, overflowY: 'auto', marginTop: '8px', paddingRight: '8px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', minHeight: '0' }}>"
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', code);
console.log('Patched Admin logs scroll');
