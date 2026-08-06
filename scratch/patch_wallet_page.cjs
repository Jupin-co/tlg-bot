const fs = require('fs');

// Patch App.tsx
let appPath = 'frontend/src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('import Wallet')) {
  app = app.replace("import Admin from './pages/Admin';", "import Admin from './pages/Admin';\nimport Wallet from './pages/Wallet';");
  app = app.replace('<Route path="/profile"', '<Route path="/wallet" element={<Wallet initData={initData} userProfile={userProfile} />} />\n          <Route path="/profile"');
  fs.writeFileSync(appPath, app);
  console.log('Patched App.tsx');
}

// Patch Profile.tsx
let profilePath = 'frontend/src/pages/Profile.tsx';
let profile = fs.readFileSync(profilePath, 'utf8');

// Add Wallet to hamburger menu
if (!profile.includes("id: 'wallet'")) {
  profile = profile.replace(
    "{ id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string }",
    "{ id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string },\n                { id: 'wallet', icon: <CreditCard size={18} />, label: t('lbl_wallet', 'My Wallet') as string }"
  );
}

// Intercept wallet click and navigate to /wallet
profile = profile.replace(
  "setActiveTab(tab.id as any);",
  "if (tab.id === 'wallet') { navigate('/wallet'); } else { setActiveTab(tab.id as any); }"
);

// Remove inline wallet section
profile = profile.replace(/<div className="card mt-4">\s*<h3 className="font-bold mb-4">{t\('lbl_wallet'[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// If the regex is too complex, let's just do a simpler search and slice.
let startIndex = profile.indexOf('<div className="card mt-4">');
if (startIndex !== -1 && profile.indexOf('lbl_wallet', startIndex) !== -1) {
    let before = profile.substring(0, startIndex);
    let afterStart = profile.substring(startIndex);
    // Find the end of this activeTab==='profile' block
    let endIndex = afterStart.indexOf(')}');
    if (endIndex !== -1) {
        let after = afterStart.substring(endIndex);
        profile = before + after;
    }
}

fs.writeFileSync(profilePath, profile);
console.log('Patched Profile.tsx');
