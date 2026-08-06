const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Wallet.tsx', 'utf8');
if (!code.includes('CHARGE_WALLET')) {
  code = code.replace(
    "const res = await fetch('/api/wallet/charge',",
    "fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData }, body: JSON.stringify({ action: 'CHARGE_WALLET', details: { amount: parseInt(chargeAmount) } }) }).catch(()=>{});\n      const res = await fetch('/api/wallet/charge',"
  );
  fs.writeFileSync('frontend/src/pages/Wallet.tsx', code);
  console.log('Patched Wallet logs');
}
