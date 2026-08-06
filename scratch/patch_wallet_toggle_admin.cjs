const fs = require('fs');

let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// 1. Add handleToggleWalletCode
const toggleFunc = `  const handleToggleWalletCode = async (id: number) => {
    try {
      const res = await fetch(\`/api/admin/wallet-codes/\${id}/toggle\`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      if (res.ok) {
        fetchWalletCodes();
        showToast(t("toast_success", "Success"), "success");
      } else {
        showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
      }
    } catch (e) {
      showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
    }
  };`;

if (!adminCode.includes('handleToggleWalletCode')) {
  // insert before addWalletCode
  adminCode = adminCode.replace(
    "  const addWalletCode = async () => {",
    toggleFunc + "\n\n  const addWalletCode = async () => {"
  );
  console.log("Added handleToggleWalletCode");
}

// 2. Add the toggle UI in the list
const oldListHTML = `                  <div className="text-right">
                    <div 
                      className="text-sm font-bold cursor-pointer text-[var(--button-color)] flex items-center gap-1 justify-end"`;

const newListHTML = `                  <div className="text-right flex flex-col items-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-hint">{code.is_active ? 'Active' : 'Disabled'}</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={code.is_active === 1} onChange={() => handleToggleWalletCode(code.id)} />
                        <div className={\`block w-10 h-6 rounded-full \${code.is_active ? 'bg-[var(--button-color)]' : 'bg-[var(--secondary-bg-color)] border border-[var(--hint-color)]'}\`}></div>
                        <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform \${code.is_active ? 'translate-x-4' : ''}\`}></div>
                      </div>
                    </label>
                    <div 
                      className="text-sm font-bold cursor-pointer text-[var(--button-color)] flex items-center gap-1 justify-end"`;

if (adminCode.includes(oldListHTML) && !adminCode.includes('handleToggleWalletCode(code.id)')) {
  adminCode = adminCode.replace(oldListHTML, newListHTML);
  console.log("Added toggle switch to UI");
}

fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);
console.log("Updated Admin.tsx");
