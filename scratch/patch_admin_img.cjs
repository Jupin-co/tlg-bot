const fs = require('fs');
let admin = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The thumbnail is currently: 
// <div style={{ width: '30%', maxWidth: '120px', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
admin = admin.replace(
  "style={{ width: '30%', maxWidth: '120px', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}",
  "style={{ width: '25%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}"
);

// The fullscreen is currently:
// <img src={fullScreenImg} alt="Receipt Fullscreen" style={{ width: '90%', maxWidth: '500px', maxHeight: '85%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()} />
admin = admin.replace(
  "style={{ width: '90%', maxWidth: '500px', maxHeight: '85%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}",
  "style={{ width: '95%', maxHeight: '90%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}"
);

fs.writeFileSync('frontend/src/pages/Admin.tsx', admin);
console.log('Patched Admin.tsx');
