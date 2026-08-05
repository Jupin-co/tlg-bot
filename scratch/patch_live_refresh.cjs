const fs = require('fs');

function patchFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  if (!code.includes('const [localProfile, setLocalProfile]')) {
    // Add useEffect import if not there
    if (!code.includes('useEffect')) {
      code = code.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
    }
    
    // Add local profile state
    code = code.replace(
      'const [walletLoading, setWalletLoading] = useState(false);',
      'const [walletLoading, setWalletLoading] = useState(false);\n  const [localProfile, setLocalProfile] = useState(userProfile);\n\n  useEffect(() => {\n    fetch(\'/api/user\', {\n      headers: {\n        \'x-telegram-init-data\': initData\n      }\n    }).then(r => r.json()).then(d => { if (d.user) setLocalProfile(d.user); });\n  }, [initData]);\n'
    );
    
    // Replace userProfile usage with localProfile
    code = code.replace(/userProfile\./g, 'localProfile.');
    
    fs.writeFileSync(path, code);
    console.log('Patched ' + path);
  }
}

patchFile('frontend/src/pages/Wallet.tsx');
// For Profile.tsx, we can do the same, but it doesn't have walletLoading.
// Let's do a custom patch for Profile.tsx
let profile = fs.readFileSync('frontend/src/pages/Profile.tsx', 'utf8');
if (!profile.includes('const [localProfile, setLocalProfile]')) {
  if (!profile.includes('useEffect')) {
    profile = profile.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
  }
  
  profile = profile.replace(
    'const [isMenuOpen, setIsMenuOpen] = useState(false);',
    'const [isMenuOpen, setIsMenuOpen] = useState(false);\n  const [localProfile, setLocalProfile] = useState(userProfile);\n\n  useEffect(() => {\n    fetch(\'/api/user\', {\n      headers: {\n        \'x-telegram-init-data\': initData\n      }\n    }).then(r => r.json()).then(d => { if (d.user) setLocalProfile(d.user); });\n  }, [initData]);\n'
  );
  
  profile = profile.replace(/userProfile\./g, 'localProfile.');
  
  fs.writeFileSync('frontend/src/pages/Profile.tsx', profile);
  console.log('Patched Profile.tsx');
}
