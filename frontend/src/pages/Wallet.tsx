import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../i18n';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';

export default function Wallet({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      else if (data.invoice_id || data.invoiceId) {
        navigate('/invoice/' + (data.invoice_id || data.invoiceId));
      }
    } catch (e) {
      console.error(e);
    }
    setWalletLoading(false);
  };

  return (
    <div className={`pb-20 max-w-md mx-auto w-full relative min-h-screen ${document.body.dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="header sticky top-0 z-10 px-4 pt-4 pb-2 bg-gradient-to-b from-[var(--bg-color)] to-transparent">
        <div className="flex justify-between items-center bg-[var(--secondary-bg-color)] p-2 rounded-2xl shadow-sm border border-[var(--border-color)]">
          <button 
            className="p-2 rounded-full flex items-center justify-center hover:bg-[var(--border-color)] transition-colors"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft size={20} className={document.body.dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-lg font-black tracking-tight text-center flex-1 m-0">
            {t('lbl_wallet', 'My Wallet')}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-2 flex flex-col gap-4">
        
        {/* Balance Card */}
        <div className="card bg-gradient-to-br from-[var(--primary-color)] to-[#4338CA] text-white border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-8 -translate-x-8 blur-lg"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1">{t('lbl_wallet_balance', 'Balance')}</p>
              <h2 className="text-3xl font-black m-0 num-fix tracking-wider">
                {formatNumber(userProfile.wallet_balance || 0)} <span className="text-sm font-medium opacity-80">{t('irt', 'IRT')}</span>
              </h2>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <WalletIcon size={24} className="text-white" />
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 relative z-10">
            <span className="text-xs uppercase tracking-widest font-semibold opacity-70">{t('lbl_wallet_status', 'Status')}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 bg-white/20 backdrop-blur-sm \${
              userProfile.wallet_status === 'VERIFIED' ? 'text-[#34C759]' :
              userProfile.wallet_status === 'PENDING' ? 'text-[#FF9500]' : 'text-[#FF3B30]'
            }`}>
              {userProfile.wallet_status === 'VERIFIED' && <CheckCircle2 size={12} />}
              {userProfile.wallet_status === 'PENDING' && <Clock size={12} />}
              {(!userProfile.wallet_status || userProfile.wallet_status === 'UNVERIFIED' || userProfile.wallet_status === 'REJECTED') && <XCircle size={12} />}
              {t('wallet_status_' + (userProfile.wallet_status || 'UNVERIFIED').toLowerCase(), userProfile.wallet_status || 'UNVERIFIED') as string}
            </span>
          </div>
        </div>

        {/* Action Area */}
        {(!userProfile.wallet_status || userProfile.wallet_status === 'UNVERIFIED' || userProfile.wallet_status === 'REJECTED') && (
          <div className="card">
            <h3 className="font-bold mb-3">{t('lbl_wallet_status', 'Status')}</h3>
            <p className="text-sm text-hint mb-4 leading-relaxed">{t('msg_wallet_kyc_info', 'To use the wallet, you must verify your identity.')}</p>
            
            <div className="flex flex-col gap-3">
              <div className="bg-[var(--secondary-bg-color)] p-1 rounded-xl border border-[var(--border-color)]">
                <input 
                  type="text" 
                  placeholder={t('lbl_national_code', 'National Code (10 digits)')} 
                  className="w-full bg-transparent border-none p-3 num-fix focus:outline-none"
                  value={nationalCode}
                  onChange={e => setNationalCode(e.target.value)}
                />
              </div>
              <div className="bg-[var(--secondary-bg-color)] p-1 rounded-xl border border-[var(--border-color)] flex items-center px-3">
                <span className="text-sm text-hint mr-2">{t('lbl_date_of_birth', 'Date of Birth')}</span>
                <input 
                  type="date" 
                  className="w-full bg-transparent border-none p-2 num-fix focus:outline-none"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
              </div>
              
              <button 
                className="w-full mt-2 py-3 rounded-xl font-bold bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg transition-all border-none cursor-pointer"
                onClick={handleWalletVerify}
                disabled={walletLoading}
              >
                {walletLoading ? '...' : t('btn_submit_verification', 'Submit Verification')}
              </button>
            </div>
          </div>
        )}

        {userProfile.wallet_status === 'PENDING' && (
          <div className="card flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-16 h-16 bg-[#FF9500]/10 text-[#FF9500] rounded-full flex items-center justify-center mb-2">
              <Clock size={32} />
            </div>
            <h3 className="font-bold m-0">{t('wallet_status_pending', 'Pending')}</h3>
            <p className="text-sm text-hint px-4">{t('msg_wallet_pending', 'Your verification is pending admin approval.')}</p>
          </div>
        )}

        {userProfile.wallet_status === 'VERIFIED' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-[var(--primary-color)]" />
              <h3 className="font-bold m-0">{t('btn_charge', 'Charge Wallet')}</h3>
            </div>
            <p className="text-sm text-hint mb-4">{t('msg_charge_wallet', 'Enter amount to charge your wallet.')}</p>
            
            <div className="flex flex-col gap-3">
              <div className="bg-[var(--secondary-bg-color)] p-1 rounded-xl border border-[var(--border-color)] flex items-center">
                <input 
                  type="number" 
                  placeholder={t('lbl_amount', 'Amount (IRT)')}
                  className="flex-1 bg-transparent border-none p-3 num-fix focus:outline-none"
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                />
                <span className="text-xs font-bold text-hint pr-3">{t('irt', 'IRT')}</span>
              </div>
              
              <button 
                className="w-full py-3 rounded-xl font-bold bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg transition-all border-none cursor-pointer mt-1"
                onClick={handleWalletCharge}
                disabled={walletLoading || !chargeAmount}
              >
                {walletLoading ? '...' : t('btn_charge', 'Charge Wallet')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
