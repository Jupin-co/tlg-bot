const fs = require('fs');
const path = 'frontend/src/pages/InvoiceView.tsx';
let content = fs.readFileSync(path, 'utf8');

const walletPayHandler = `
  const [walletPaying, setWalletPaying] = useState(false);

  const handleWalletPay = async () => {
    setWalletPaying(true);
    try {
      const res = await fetch(\`/api/invoice/\${id}/pay-with-wallet\`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(t('msg_payment_success', 'Payment successful!'));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    setWalletPaying(false);
  };
`;

content = content.replace('const handleFileUpload = async (e: any) => {', walletPayHandler + '\n  const handleFileUpload = async (e: any) => {');

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

content = content.replace('<input \n                type="file" ', walletPayButton + '\n              <input \n                type="file" ');

fs.writeFileSync(path, content);
console.log('Added Pay with Wallet to InvoiceView');
