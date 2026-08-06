const fs = require('fs');

let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The new lines to add
const toAdd = `    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'wallet-codes') fetchWalletCodes();`;

// If they are not there, inject them before the closing bracket of useEffect
if (!adminCode.includes("fetchWalletCodes()")) {
    adminCode = adminCode.replace(
      "    if (activeTab === 'users') fetchUsers();\r\n  }, [initData, isAdmin, activeTab]);",
      "    if (activeTab === 'users') fetchUsers();\r\n" + toAdd + "\r\n  }, [initData, isAdmin, activeTab]);"
    );
    // Try without \r just in case
    adminCode = adminCode.replace(
      "    if (activeTab === 'users') fetchUsers();\n  }, [initData, isAdmin, activeTab]);",
      "    if (activeTab === 'users') fetchUsers();\n" + toAdd + "\n  }, [initData, isAdmin, activeTab]);"
    );
    fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);
    console.log('Fixed Admin.tsx');
} else {
    console.log('Already fixed Admin.tsx');
}
