const fs = require('fs');

// 1. Fix Wallet.tsx (remove literal backslashes from template literal string in className)
let walletPath = 'frontend/src/pages/Wallet.tsx';
let wallet = fs.readFileSync(walletPath, 'utf8');
wallet = wallet.replace(/className=\{\\\`/g, 'className={`').replace(/\\`\}/g, '`}');
fs.writeFileSync(walletPath, wallet);
console.log('Fixed Wallet.tsx');

// 2. Patch Profile.tsx
let profilePath = 'frontend/src/pages/Profile.tsx';
let profile = fs.readFileSync(profilePath, 'utf8');

// A. Add wallet menu item
if (!profile.includes("id: 'wallet'")) {
  profile = profile.replace(
    "{ id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string }",
    "{ id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string },\n                { id: 'wallet', icon: <CreditCard size={18} />, label: t('lbl_wallet', 'My Wallet') as string }"
  );
}

// B. Intercept navigation for 'wallet'
if (!profile.includes("if (tab.id === 'wallet') { navigate('/wallet'); }")) {
  profile = profile.replace(
    "setActiveTab(tab.id as any);",
    "if (tab.id === 'wallet') { navigate('/wallet'); } else { setActiveTab(tab.id as any); }"
  );
}

// C. Remove Wallet Card from JSX.
// Look for `{/* Wallet Section */}` or `<div className="card mt-4">`
let walletStart = profile.indexOf('<div className="card mt-4">');
if (walletStart !== -1 && profile.indexOf('lbl_wallet', walletStart) !== -1) {
    let walletEnd = profile.indexOf('</div>\n          </div>\n        </div>', walletStart);
    if (walletEnd !== -1) {
        walletEnd += '</div>\n          </div>\n        </div>'.length;
        // Wait, the structure is:
        // <div className="card mt-4">
        //   <h3 className="font-bold mb-4">{t('lbl_wallet', 'My Wallet')}</h3>
        //   ...
        // </div>
        // Let's just find the exact string.
    }
}
fs.writeFileSync(profilePath, profile);
console.log('Patched Profile.tsx partly');
