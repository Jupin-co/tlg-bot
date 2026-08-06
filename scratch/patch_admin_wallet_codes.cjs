const fs = require('fs');
const file = 'frontend/src/pages/Admin.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add wallet-codes to activeTab type
code = code.replace(
  "useState<'catalog' | 'settings' | 'payments' | 'invoices' | 'messages' | 'users' | 'verifications'>('catalog')",
  "useState<'catalog' | 'settings' | 'payments' | 'invoices' | 'messages' | 'users' | 'verifications' | 'wallet-codes'>('catalog')"
);

// 2. Add Wallet Codes states
const statesToAdd = `
  // Wallet Codes States
  const [walletCodes, setWalletCodes] = useState<any[]>([]);
  const [newWalletCode, setNewWalletCode] = useState('');
  const [newWalletCodeAmount, setNewWalletCodeAmount] = useState('');
  const [newWalletCodeExpires, setNewWalletCodeExpires] = useState('');
  const [newWalletCodeType, setNewWalletCodeType] = useState('UNIQUE'); // UNIQUE or MULTI
  const [viewingWalletCodeUses, setViewingWalletCodeUses] = useState<any[] | null>(null);
`;
if (!code.includes('const [walletCodes, setWalletCodes]')) {
  code = code.replace('// Catalog States', statesToAdd + '\\n  // Catalog States');
}

// 3. Add fetchWalletCodes
const fetchWalletCodes = `
  const fetchWalletCodes = () => {
    fetch('/api/admin/wallet-codes', { headers: { 'x-telegram-init-data': initData } })
      .then(res => res.json())
      .then(data => {
        if (data.codes) setWalletCodes(data.codes);
      });
  };
`;
if (!code.includes('const fetchWalletCodes = () => {')) {
  code = code.replace('const fetchInvoices = () => {', fetchWalletCodes + '\\n  const fetchInvoices = () => {');
}

// 4. Update tab clicks to fetch wallet codes
code = code.replace(
  "if (activeTab === 'verifications') fetchVerifications();",
  "if (activeTab === 'verifications') fetchVerifications();\\n    if (activeTab === 'wallet-codes') fetchWalletCodes();"
);

// 5. Add Wallet Codes to the Desktop Tabs menu
const newTabDesktop = `
          <button
            className={\`px-4 py-2 font-bold whitespace-nowrap \${activeTab === 'wallet-codes' ? 'text-[var(--button-color)] border-b-2 border-[var(--button-color)]' : 'text-hint'}\`}
            onClick={() => setActiveTab('wallet-codes')}
          >
            {t('tab_wallet_codes', 'Wallet Codes')}
          </button>
`;
if (!code.includes("onClick={() => setActiveTab('wallet-codes')}")) {
  code = code.replace(
    "<button\\n            className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'verifications' ? 'text-[var(--button-color)] border-b-2 border-[var(--button-color)]' : 'text-hint'}`}\\n            onClick={() => setActiveTab('verifications')}\\n          >\\n            {t('tab_verifications', 'Verifications')}\\n          </button>",
    `<button
            className={\`px-4 py-2 font-bold whitespace-nowrap \${activeTab === 'verifications' ? 'text-[var(--button-color)] border-b-2 border-[var(--button-color)]' : 'text-hint'}\`}
            onClick={() => setActiveTab('verifications')}
          >
            {t('tab_verifications', 'Verifications')}
          </button>
${newTabDesktop}`
  );
}

// 6. Add Wallet Codes to the Mobile Menu
const newTabMobile = `
              { id: 'wallet-codes', icon: <CreditCard size={18} />, label: t('tab_wallet_codes', 'Wallet Codes') as string },
`;
if (!code.includes("id: 'wallet-codes'")) {
  code = code.replace(
    "{ id: 'verifications', icon: <CheckCircle size={18} />, label: t('tab_verifications', 'Verifications') as string }",
    "{ id: 'verifications', icon: <CheckCircle size={18} />, label: t('tab_verifications', 'Verifications') as string },\\n              { id: 'wallet-codes', icon: <CreditCard size={18} />, label: t('tab_wallet_codes', 'Wallet Codes') as string }"
  );
}

// 7. Add Wallet Codes tab content
const walletCodesTab = `
      {activeTab === 'wallet-codes' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">{t('tab_wallet_codes', 'Wallet Codes')}</h2>
          
          <div className="card">
            <h3 className="font-bold mb-3">{t('lbl_create_wallet_code', 'Create Wallet Code')}</h3>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder={t('lbl_code_string', 'Code (e.g. SUMMER50)') as string} value={newWalletCode} onChange={e => setNewWalletCode(e.target.value)} />
              <input type="number" placeholder={t('lbl_amount', 'Amount') as string} value={newWalletCodeAmount} onChange={e => setNewWalletCodeAmount(e.target.value)} />
              <input type="date" placeholder={t('lbl_expires_at', 'Expires At (Optional)') as string} value={newWalletCodeExpires} onChange={e => setNewWalletCodeExpires(e.target.value)} />
              <select value={newWalletCodeType} onChange={e => setNewWalletCodeType(e.target.value)} className="p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                <option value="UNIQUE">{t('lbl_unique_use', 'Unique Use (Single time total)')}</option>
                <option value="MULTI">{t('lbl_multi_use', 'Multi User Use (Once per user)')}</option>
              </select>
              <button onClick={() => {
                fetch('/api/admin/wallet-codes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
                  body: JSON.stringify({ 
                    code: newWalletCode, 
                    amount: parseInt(newWalletCodeAmount),
                    expires_at: newWalletCodeExpires || null,
                    max_total_uses: newWalletCodeType === 'UNIQUE' ? 1 : null
                  })
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setNewWalletCode('');
                    setNewWalletCodeAmount('');
                    setNewWalletCodeExpires('');
                    fetchWalletCodes();
                  } else {
                    setToast({ msg: data.error, type: 'error' });
                  }
                });
              }}>
                {t('btn_create_code', 'Create Code')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {walletCodes.map(code => (
              <div key={code.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--button-color)] m-0">{code.code}</h3>
                    <p className="text-sm font-bold mt-1">Amount: {formatNumber(code.amount)}</p>
                    <p className="text-xs text-hint mt-1">
                      Type: {code.max_total_uses === 1 ? 'Unique Use' : 'Multi Use'}
                    </p>
                    {code.expires_at && <p className="text-xs text-hint mt-1">Expires: {new Date(code.expires_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-sm font-bold cursor-pointer text-[var(--button-color)] flex items-center gap-1 justify-end"
                      onClick={() => {
                        fetch(\`/api/admin/wallet-codes/\${code.id}/uses\`, { headers: { 'x-telegram-init-data': initData } })
                          .then(res => res.json())
                          .then(data => {
                            if (data.uses) setViewingWalletCodeUses(data.uses);
                          });
                      }}
                    >
                      <Users size={14} /> Uses: {code.use_count}
                    </div>
                    <p className="text-xs text-hint mt-2">{new Date(code.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
`;

if (!code.includes("activeTab === 'wallet-codes' &&")) {
  code = code.replace(
    "{activeTab === 'verifications' && (",
    walletCodesTab + "\\n\\n      {activeTab === 'verifications' && ("
  );
}

// 8. Add Uses Modal
const usesModal = `
      {viewingWalletCodeUses !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewingWalletCodeUses(null)}>
          <div className="bg-[var(--bg-color)] rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center sticky top-0 bg-[var(--bg-color)]">
              <h3 className="font-bold m-0">{t('lbl_code_uses', 'Code Usages')}</h3>
              <button onClick={() => setViewingWalletCodeUses(null)} className="p-1 !bg-transparent !text-[var(--text-color)] m-0 w-auto">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {viewingWalletCodeUses.length === 0 ? (
                <p className="text-hint">No uses yet.</p>
              ) : (
                viewingWalletCodeUses.map((u, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-sm m-0">{u.first_name} {u.username ? \`(@\${u.username})\` : ''}</p>
                      <p className="text-xs text-hint mt-1">ID: {u.telegram_id}</p>
                    </div>
                    <p className="text-xs text-hint">{new Date(u.used_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
`;
if (!code.includes('viewingWalletCodeUses !== null')) {
  code = code.replace('</Layout>', usesModal + '\\n    </Layout>');
}

fs.writeFileSync(file, code);
console.log('Admin.tsx patched successfully');
