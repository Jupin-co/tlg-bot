const fs = require('fs');
const path = 'frontend/src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

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

content = content.replace('            {!userProfile.phone_number && (\r\n              <button className="secondary w-full mt-4 flex items-center justify-center gap-2" onClick={shareContact}>\r\n                <Share2 size={18} /> {t(\'share_contact\')}\r\n              </button>\r\n            )}\r\n          </div>', '            {!userProfile.phone_number && (\n              <button className="secondary w-full mt-4 flex items-center justify-center gap-2" onClick={shareContact}>\n                <Share2 size={18} /> {t(\'share_contact\')}\n              </button>\n            )}\n          </div>\n' + walletSection);

// Fix for InvoiceView as well
const invoicePath = 'frontend/src/pages/InvoiceView.tsx';
let invoiceContent = fs.readFileSync(invoicePath, 'utf8');
const walletPayButton = `
            {invoice.type !== 'WALLET_CHARGE' && (
              <button 
                className="secondary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-3 bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
                onClick={handleWalletPay}
                disabled={walletPaying}
              >
                <CreditCard size={20} />
                {walletPaying ? '...' : t('btn_pay_wallet', 'Pay with Wallet')}
              </button>
            )}
`;
if (!invoiceContent.includes('Pay with Wallet')) {
  invoiceContent = invoiceContent.replace(/<input \s*type="file"/g, walletPayButton + '\n              <input type="file"');
  fs.writeFileSync(invoicePath, invoiceContent);
}

// Fix Admin.tsx
const adminPath = 'frontend/src/pages/Admin.tsx';
let adminContent = fs.readFileSync(adminPath, 'utf8');

adminContent = adminContent.replace(
  "const [activeTab, setActiveTab] = useState<'catalog' | 'payments' | 'settings' | 'invoices' | 'messages' | 'users'>('catalog');",
  "const [activeTab, setActiveTab] = useState<'catalog' | 'payments' | 'settings' | 'invoices' | 'messages' | 'users' | 'verifications'>('catalog');"
);
adminContent = adminContent.replace(
  "import { Search, Plus, Edit2, Trash2, Settings as SettingsIcon, Package, CreditCard, Users, CheckCircle2, XCircle, Moon, Sun, ArrowLeft, RefreshCw as RefreshIcon, FileText, Image as ImageIcon } from 'lucide-react';",
  "import { Search, Plus, Edit2, Trash2, Settings as SettingsIcon, Package, CreditCard, Users, CheckCircle2, XCircle, CheckCircle, Moon, Sun, ArrowLeft, RefreshCw as RefreshIcon, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';"
);

fs.writeFileSync(adminPath, adminContent);

fs.writeFileSync(path, content);
console.log('Fixed TS errors in UI');
