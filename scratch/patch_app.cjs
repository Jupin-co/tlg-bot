const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

// imports
if (!code.includes('import Support ')) {
  code = code.replace(
    "import Inventory from './pages/Inventory';",
    "import Inventory from './pages/Inventory';\nimport Support from './pages/Support';\nimport SupportAdmin from './pages/SupportAdmin';"
  );
}

// routes
if (!code.includes('<Route path="/support"')) {
  code = code.replace(
    '<Route path="/admin" element={<Admin initData={initData} userProfile={userProfile} />} />',
    '<Route path="/admin" element={<Admin initData={initData} userProfile={userProfile} />} />\n          <Route path="/support" element={<Support initData={initData} />} />\n          <Route path="/support-admin" element={<SupportAdmin initData={initData} />} />'
  );
}

// navigation
if (!code.includes('isSupportAdmin')) {
  code = code.replace(
    "const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';",
    "const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';\n  const isSupportAdmin = isAdmin || userProfile?.role === 'SUPPORT_ADMIN';"
  );
}

if (!code.includes("/support-admin")) {
  code = code.replace(
    "{isAdmin && (",
    `{isSupportAdmin && (
        <div 
          className={\`nav-item \${location.pathname === '/support-admin' ? 'active' : ''}\`}
          onClick={() => navigate('/support-admin')}
        >
          <MessageSquare size={24} />
          <span>{t('lbl_support', 'Support')}</span>
        </div>
      )}
      {isAdmin && (`
  );
  
  // Need to import MessageSquare for Navigation
  if (!code.includes('MessageSquare')) {
    code = code.replace("Settings, Package } from 'lucide-react';", "Settings, Package, MessageSquare } from 'lucide-react';");
  }
}

fs.writeFileSync('frontend/src/App.tsx', code);
console.log('App.tsx patched');
