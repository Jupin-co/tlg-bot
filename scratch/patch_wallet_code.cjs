const fs = require('fs');
const fileAPI = 'src/api/index.ts';
let codeAPI = fs.readFileSync(fileAPI, 'utf8');

codeAPI = codeAPI.replace(
  "profile.wallet_status !== 'ACTIVE'",
  "profile.wallet_status !== 'VERIFIED'"
);

fs.writeFileSync(fileAPI, codeAPI);
console.log('API patched: ACTIVE to VERIFIED');

const fileWallet = 'frontend/src/pages/Wallet.tsx';
let codeWallet = fs.readFileSync(fileWallet, 'utf8');

if (!codeWallet.includes('const [redeemCode, setRedeemCode]')) {
  codeWallet = codeWallet.replace(
    'const [chargeAmount, setChargeAmount] = useState(\\'\\');',
    'const [chargeAmount, setChargeAmount] = useState(\\'\\');\\n  const [redeemCode, setRedeemCode] = useState(\\'\\');'
  );
}

const redeemFunc = \`
  const handleWalletRedeem = async () => {
    if (!redeemCode) return;
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ code: redeemCode })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert(t('msg_code_redeemed', 'Code successfully redeemed!'));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    setWalletLoading(false);
  };
\`;
if (!codeWallet.includes('const handleWalletRedeem = async () => {')) {
  codeWallet = codeWallet.replace(
    'const handleWalletCharge = async () => {',
    redeemFunc + '\\n  const handleWalletCharge = async () => {'
  );
}

const redeemUI = \`
          <div className="card mt-4">
            <h3 className="font-bold mb-3">{t('lbl_redeem_code', 'Redeem Code')}</h3>
            <p className="text-sm text-hint mb-4">{t('msg_redeem_code', 'Enter a promotional code to charge your wallet.')}</p>
            <div className="flex flex-col gap-3">
              <div className="bg-[var(--secondary-bg-color)] p-1 rounded-xl border border-[var(--border-color)]">
                <input 
                  type="text" 
                  placeholder={t('lbl_code', 'Code')} 
                  className="w-full bg-transparent border-none p-3 focus:outline-none uppercase"
                  value={redeemCode}
                  onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                />
              </div>
              <button 
                className="w-full py-3 rounded-xl font-bold bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg transition-all border-none cursor-pointer"
                onClick={handleWalletRedeem}
                disabled={walletLoading}
              >
                {walletLoading ? '...' : t('btn_redeem', 'Redeem Code')}
              </button>
            </div>
          </div>
\`;

if (!codeWallet.includes("lbl_redeem_code")) {
  codeWallet = codeWallet.replace(
    "{localProfile.wallet_status === 'VERIFIED' && (\\n          <div className=\\"card\\">",
    "{localProfile.wallet_status === 'VERIFIED' && (\\n        <>\\n          <div className=\\"card\\">"
  );
  
  codeWallet = codeWallet.replace(
    \`            </div>
          </div>
        )}\`,
    \`            </div>
          </div>
\${redeemUI}
        </>
        )}\`
  );
}

fs.writeFileSync(fileWallet, codeWallet);
console.log('Wallet.tsx patched successfully');
