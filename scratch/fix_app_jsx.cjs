const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

if (!code.includes('MessageSquare')) {
  code = code.replace("Settings, Package } from 'lucide-react';", "Settings, Package, MessageSquare } from 'lucide-react';");
}

if (!code.includes('/support-admin')) {
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
}

fs.writeFileSync('frontend/src/App.tsx', code);
console.log('App.tsx JSX patched');
