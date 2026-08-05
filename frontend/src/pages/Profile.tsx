import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../i18n';
import { useNavigate } from 'react-router-dom';
import { User, Settings, CreditCard, Share2, Moon, Sun, Clock, FileText, CheckCircle2, XCircle, Menu, X } from 'lucide-react';

export default function Profile({ initData, userProfile, error }: { initData: string, userProfile: any, error?: string | null }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localProfile, setLocalProfile] = useState(userProfile);

  useEffect(() => {
    fetch('/api/user', {
      headers: {
        'x-telegram-init-data': initData
      }
    }).then(r => r.json()).then(d => { if (d.user) setLocalProfile(d.user); });
  }, [initData]);

  const [activeTab, setActiveTab] = useState<'profile' | 'payments'>('profile');
  const [payments, setPayments] = useState<any[]>([]);





  useEffect(() => {
    if (!initData) return;
    if (activeTab === 'payments') {
      fetch('/api/payments', { headers: { 'x-telegram-init-data': initData } })
        .then(r => r.json())
        .then(data => { if (data.payments) setPayments(data.payments); })
        .catch(console.error);
    }
  }, [initData, activeTab]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';
    savePreferences(lang, document.body.getAttribute('data-theme') || 'light');
  };

  const handleThemeChange = (theme: string) => {
    document.body.setAttribute('data-theme', theme);
    savePreferences(i18n.language, theme);
  };

  const savePreferences = (lang: string, theme: string) => {
    fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData
      },
      body: JSON.stringify({ language: lang, theme: theme })
    }).catch(console.error);
  };

  const shareContact = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      if (tg.requestContact) {
        tg.requestContact((success: boolean) => {
          if (success) alert(t('msg_contact_shared', 'Contact shared successfully!'));
        });
      } else {
        alert(t('msg_use_share_button', 'Please use the Share Phone Number button in the bot chat.'));
      }
    }
  };

  if (!initData) {
    return (
      <div className="container dir-auto flex flex-col items-center justify-center h-full gap-4 text-center">
        <User size={48} opacity={0.3} />
        <p className="text-hint">{t('msg_open_in_telegram', 'Please open this app from inside Telegram.')}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container dir-auto flex flex-col items-center justify-center h-full gap-4 text-center">
        <XCircle size={48} className="text-danger" />
        <h3 className="font-bold text-lg">{t('lbl_error_loading_profile', 'Error Loading Profile')}</h3>
        <p className="text-danger text-sm">{error}</p>
      </div>
    );
  }
  if (!userProfile) {
    return (
      <div className="container dir-auto flex items-center justify-center h-full">
        <p className="text-hint font-medium">{t('lbl_loading_profile', 'Loading profile...')}</p>
      </div>
    );
  }

  return (
    <div className="container dir-auto">
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-xl font-bold m-0">{t('profile')}</h1>
        <div className="flex items-center gap-2">
          {/* Theme Toggle Inline */}
          <button 
            className="secondary p-2 rounded-full flex items-center justify-center transition-colors bg-[var(--secondary-bg-color)] hover:bg-[var(--border-color)]"
            onClick={() => handleThemeChange(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')}
            title={t('theme') as string}
          >
            {document.body.getAttribute('data-theme') === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {/* Language Toggle Inline */}
          <button 
            className="secondary p-2 rounded-full flex items-center justify-center font-bold text-sm transition-colors bg-[var(--secondary-bg-color)] hover:bg-[var(--border-color)] w-10 h-10"
            onClick={() => handleLanguageChange(i18n.language === 'en' ? 'fa' : 'en')}
            title={t('language') as string}
          >
            {i18n.language === 'en' ? 'FA' : 'EN'}
          </button>

          {/* Sleek Hamburger Menu */}
          <div className="relative">
            <button 
              className="p-2 rounded-full flex items-center justify-center bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Sliding Drawer Navigation */}
      {isMenuOpen && (
        <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className={`drawer-content ${document.body.dir === 'rtl' ? 'rtl' : 'ltr'}`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="m-0">{t('profile')}</h2>
              <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body">
              {[
                { id: 'profile', icon: <Settings size={18} />, label: t('tab_settings', 'Settings') as string },
                { id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string },
                { id: 'wallet', icon: <CreditCard size={18} />, label: t('lbl_wallet', 'My Wallet') as string }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`drawer-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    if (tab.id === 'wallet') { navigate('/wallet'); } else { setActiveTab(tab.id as any); }
                    setIsMenuOpen(false);
                  }}
                >
                  <span className={`${activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-70'} transition-transform`}>{tab.icon}</span>
                  <span className="text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--secondary-bg-color)] flex items-center justify-center text-hint border border-[var(--border-color)]">
              <User size={32} />
            </div>
            <div>
              <h3 className="font-bold text-lg m-0">{localProfile.first_name} {localProfile.last_name}</h3>
              <p className="text-hint text-sm num-fix mt-1">@{localProfile.username}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-4">{t('lbl_account_details', 'Account Details')}</h3>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
              <span className="text-hint text-sm">{t('phone_number')}</span>
              <span className="font-medium num-fix tracking-wider">{localProfile.phone_number || t('lbl_not_provided', 'Not provided')}</span>
            </div>
            {!localProfile.phone_number && (
              <button className="secondary w-full mt-4 flex items-center justify-center gap-2" onClick={shareContact}>
                <Share2 size={18} /> {t('share_contact')}
              </button>
            )}
          </div>




        </div>
      )}

      {activeTab === 'payments' && (
        <div className="flex flex-col gap-4">
          {payments.length === 0 ? (
            <div className="card text-center py-10 text-hint flex flex-col items-center gap-3">
              <FileText size={48} opacity={0.3} />
              <p>{t('msg_no_payments', 'No payment history.')}</p>
            </div>
          ) : (
            payments.map(p => (
              <div 
                key={p.id} 
                className="card flex flex-col gap-3 cursor-pointer hover:border-[var(--button-color)] transition-colors" 
                onClick={() => {
                  if (p.status === 'PENDING_APPROVAL' || p.status === 'PENDING_PAYMENT') {
                    navigate(`/invoice/${p.invoice_id}`);
                  } else if (p.status === 'APPROVED') {
                    navigate('/inventory');
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold m-0">{t('lbl_invoice', 'Invoice')} <span className="text-sm">#{formatNumber(p.invoice_id)}</span></h4>
                    <p className="text-xs text-hint mt-1">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1
                    ${p.status === 'APPROVED' ? 'bg-[rgba(52,199,89,0.1)] text-success' : 
                      p.status === 'REJECTED' ? 'bg-[rgba(255,59,48,0.1)] text-danger' : 
                      'bg-[rgba(255,149,0,0.1)] text-[var(--hint-color)]'}`}
                  >
                    {p.status === 'APPROVED' && <CheckCircle2 size={12} />}
                    {p.status === 'REJECTED' && <XCircle size={12} />}
                    {p.status === 'PENDING_PAYMENT' && <Clock size={12} />}
                    {p.status === 'PENDING_APPROVAL' && <Clock size={12} />}
                    {t('status_' + p.status.toLowerCase(), p.status) as string}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-3">
                  <span className="text-sm text-hint font-medium">{t('lbl_amount', 'Amount')}</span>
                  <span className="font-bold text-lg">{formatNumber(p.total_price)} {t(p.currency.toLowerCase(), p.currency) as string}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
