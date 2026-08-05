const fs = require('fs');

function replaceFile(path, oldText, newText) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content);
    console.log('Fixed ' + path);
  } else {
    console.log('Could not find text in ' + path);
  }
}

// 1. InvoiceView.tsx
let invoicePath = 'frontend/src/pages/InvoiceView.tsx';
let invoiceContent = fs.readFileSync(invoicePath, 'utf8');
// walletPaying is declared but never read because my replace missed the JSX part!
const invoiceRegex = /<input \s*type="file"/;
if (invoiceContent.match(invoiceRegex)) {
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
            <input type="file"`;
  invoiceContent = invoiceContent.replace(invoiceRegex, walletPayButton);
  fs.writeFileSync(invoicePath, invoiceContent);
  console.log('Fixed InvoiceView.tsx');
}

// 2. Profile.tsx
let profilePath = 'frontend/src/pages/Profile.tsx';
let profileContent = fs.readFileSync(profilePath, 'utf8');

// Also fix: src/pages/Profile.tsx(245,17): error TS2322: Type 'string | ...' is not assignable to type 'ReactI18NextChildren...'
// t('wallet_status_' + ...) as string
const badT = `{t('wallet_status_' + (userProfile.wallet_status || 'UNVERIFIED').toLowerCase(), userProfile.wallet_status || 'UNVERIFIED')}`;
const goodT = `{t('wallet_status_' + (userProfile.wallet_status || 'UNVERIFIED').toLowerCase(), userProfile.wallet_status || 'UNVERIFIED') as string}`;
profileContent = profileContent.replace(badT, goodT);

fs.writeFileSync(profilePath, profileContent);
console.log('Fixed Profile.tsx');

// 3. Admin.tsx
let adminPath = 'frontend/src/pages/Admin.tsx';
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
console.log('Fixed Admin.tsx');
