const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// 1. Fix the \n\n bug
code = code.replace(/\\n\\n\s*\{activeTab === 'verifications'/g, "\n\n      {activeTab === 'verifications'");

// 2. Add wallet-codes to the adminTabs if not already there
if (!code.includes("id: 'wallet-codes'")) {
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
  
  code = code.replace(searchTarget, adminTabsPush);
}

fs.writeFileSync('frontend/src/pages/Admin.tsx', code);
console.log('Fixed Admin.tsx');
