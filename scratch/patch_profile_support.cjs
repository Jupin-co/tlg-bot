const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Profile.tsx', 'utf8');

if (!code.includes("id: 'support'")) {
  code = code.replace(
    "{ id: 'wallet', icon: <CreditCard size={18} />, label: t('lbl_wallet', 'My Wallet') as string }",
    "{ id: 'wallet', icon: <CreditCard size={18} />, label: t('lbl_wallet', 'My Wallet') as string },\n                { id: 'support', icon: <MessageSquare size={18} />, label: t('lbl_support', 'Support') as string }"
  );
  
  if (!code.includes('MessageSquare')) {
    code = code.replace("LogOut } from 'lucide-react';", "LogOut, MessageSquare } from 'lucide-react';");
  }
  
  code = code.replace(
    "if (tab.id === 'wallet') { navigate('/wallet'); } else { setActiveTab(tab.id as any); }",
    "if (tab.id === 'wallet') { navigate('/wallet'); } else if (tab.id === 'support') { navigate('/support'); } else { setActiveTab(tab.id as any); }"
  );
  
  fs.writeFileSync('frontend/src/pages/Profile.tsx', code);
  console.log('Profile.tsx patched for Support');
}
