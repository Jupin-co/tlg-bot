const fs = require('fs');
const path = 'frontend/src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

const stateVars = `
  const [nationalCode, setNationalCode] = useState('');
  const [dob, setDob] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  const handleWalletVerify = async () => {
    if (!nationalCode || !dob) {
      alert(t('msg_fill_fields', 'Please fill all fields'));
      return;
    }
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ national_code: nationalCode, date_of_birth: dob })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    setWalletLoading(false);
  };

  const handleWalletCharge = async () => {
    if (!chargeAmount || parseInt(chargeAmount) <= 0) return;
    setWalletLoading(true);
    try {
      const res = await fetch('/api/wallet/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ amount: parseInt(chargeAmount), currency: 'IRT' })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        navigate(\`/invoice/\${data.invoice_id}\`);
      }
    } catch (e) {
      console.error(e);
    }
    setWalletLoading(false);
  };
`;

content = content.replace('const [payments, setPayments] = useState<any[]>([]);', 'const [payments, setPayments] = useState<any[]>([]);\n' + stateVars);

const walletSection = `
          <div className="card mt-4">
            <h3 className="font-bold mb-4">{t('lbl_wallet', 'My Wallet')}</h3>
            
            <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
              <span className="text-hint text-sm">{t('lbl_wallet_balance', 'Balance')}</span>
              <span className="font-bold text-lg num-fix">{formatNumber(userProfile.wallet_balance || 0)} {t('irt', 'IRT')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
              <span className="text-hint text-sm">{t('lbl_wallet_status', 'Status')}</span>
              <span className={\`text-sm font-bold \${
                userProfile.wallet_status === 'VERIFIED' ? 'text-success' :
                userProfile.wallet_status === 'PENDING' ? 'text-[var(--hint-color)]' : 'text-danger'
              }\`}>
                {t('wallet_status_' + (userProfile.wallet_status || 'UNVERIFIED').toLowerCase(), userProfile.wallet_status || 'UNVERIFIED')}
              </span>
            </div>

            {(!userProfile.wallet_status || userProfile.wallet_status === 'UNVERIFIED' || userProfile.wallet_status === 'REJECTED') && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-xs text-hint mb-2">{t('msg_wallet_kyc_info', 'To use the wallet, you must verify your identity.')}</p>
                <input 
                  type="text" 
                  placeholder={t('lbl_national_code', 'National Code (10 digits)')} 
                  className="w-full bg-[var(--secondary-bg-color)] num-fix"
                  value={nationalCode}
                  onChange={e => setNationalCode(e.target.value)}
                />
                <input 
                  type="date" 
                  className="w-full bg-[var(--secondary-bg-color)] num-fix"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
                <button 
                  className="w-full mt-2"
                  onClick={handleWalletVerify}
                  disabled={walletLoading}
                >
                  {walletLoading ? '...' : t('btn_submit_verification', 'Submit Verification')}
                </button>
              </div>
            )}

            {userProfile.wallet_status === 'PENDING' && (
              <div className="mt-4 p-3 bg-[rgba(255,149,0,0.1)] rounded-xl text-center text-sm text-[var(--hint-color)]">
                {t('msg_wallet_pending', 'Your verification is pending admin approval.')}
              </div>
            )}

            {userProfile.wallet_status === 'VERIFIED' && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-xs text-hint mb-2">{t('msg_charge_wallet', 'Enter amount to charge your wallet.')}</p>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={t('lbl_amount', 'Amount (IRT)')}
                    className="flex-1 bg-[var(--secondary-bg-color)] num-fix"
                    value={chargeAmount}
                    onChange={e => setChargeAmount(e.target.value)}
                  />
                  <button 
                    onClick={handleWalletCharge}
                    disabled={walletLoading || !chargeAmount}
                  >
                    {walletLoading ? '...' : t('btn_charge', 'Charge')}
                  </button>
                </div>
              </div>
            )}
          </div>
`;

content = content.replace('</div>\n      )}\n\n      {activeTab === \'payments\'', walletSection + '\n        </div>\n      )}\n\n      {activeTab === \'payments\'');

fs.writeFileSync(path, content);
console.log('Profile Wallet section added');
