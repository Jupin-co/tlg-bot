const fs = require('fs');

// --- 1. Fix Admin.tsx ---
let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The messed up area right now:
/*
          </div>
        </div>
      )}
          
          {verifications.length === 0 ? (
            <div className="card text-center py-10 text-hint">
*/

// Let's replace the broken verifications block with the correct one
const brokenVerificationsBlock = `      )}
          
          {verifications.length === 0 ? (`;

const correctVerificationsBlock = `      )}

      {activeTab === 'verifications' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-xl">{t('lbl_kyc_verifications', 'KYC Verifications')}</h2>
            <button className="secondary py-1 px-3" onClick={fetchVerifications}><RefreshCw size={16} /></button>
          </div>
          
          {verifications.length === 0 ? (`;

if (adminCode.includes(brokenVerificationsBlock)) {
    adminCode = adminCode.replace(brokenVerificationsBlock, correctVerificationsBlock);
} else {
    // Maybe the literal \n\n is still there? Let's check
    adminCode = adminCode.replace(/\\n\\n\s*\{activeTab === 'verifications'/g, "\n\n      {activeTab === 'verifications'");
}

// Ensure wallet-codes is in adminTabs
if (!adminCode.includes("id: 'wallet-codes'")) {
    const adminTabsPush = `  if (isSuperAdmin) {
    adminTabs.push(
      { id: 'settings', icon: <Settings size={18} />, label: t('tab_settings', 'Settings') as string },
      { id: 'users', icon: <Users size={18} />, label: t('tab_users', 'Users') as string },
      { id: 'messages', icon: <MessageSquare size={18} />, label: t('tab_messages', 'Messages') as string },
      { id: 'wallet-codes', icon: <CreditCard size={18} />, label: t('tab_wallet_codes', 'Wallet Codes') as string }
    );
  }`;
  
  const searchTarget = `  if (isSuperAdmin) {
    adminTabs.push(
      { id: 'settings', icon: <Settings size={18} />, label: t('tab_settings', 'Settings') as string },
      { id: 'users', icon: <Users size={18} />, label: t('tab_users', 'Users') as string },
      { id: 'messages', icon: <MessageSquare size={18} />, label: t('tab_messages', 'Messages') as string }
    );
  }`;
  
  adminCode = adminCode.replace(searchTarget, adminTabsPush);
}

fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);
console.log('Fixed Admin.tsx');


// --- 2. Patch Backend API ---
let apiCode = fs.readFileSync('src/api/index.ts', 'utf8');
const walletCodePayload = fs.readFileSync('scratch/wallet_api_code.ts', 'utf8');

// Insert it right before "export default api;"
const targetStr = "export default api;";
if (apiCode.includes(targetStr) && !apiCode.includes('/admin/wallet-codes')) {
    apiCode = apiCode.replace(targetStr, walletCodePayload + "\n\n" + targetStr);
    fs.writeFileSync('src/api/index.ts', apiCode);
    console.log('Patched API index.ts');
} else {
    console.log('API already patched or target string missing!');
}
