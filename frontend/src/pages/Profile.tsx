import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Wallet, CreditCard, Share2, Languages, Moon, Sun, Clock, FileText, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';

export default function Profile({ initData, userProfile, error }: { initData: string, userProfile: any, error?: string | null }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'payments'>('profile');
  const [inventory, setInventory] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  useEffect(() => {
    if (!initData) return;
    if (activeTab === 'inventory') {
      fetch('/api/inventory', { headers: { 'x-telegram-init-data': initData } })
        .then(r => r.json())
        .then(data => { if (data.inventory) setInventory(data.inventory); })
        .catch(console.error);
    }
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

  const calculateTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${d} ${t('lbl_days', 'days')} ${h} ${t('lbl_hours', 'hours')}`;
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
        <h3 className="font-bold text-lg">Error Loading Profile</h3>
        <p className="text-danger text-sm">{error}</p>
      </div>
    );
  }
  if (!userProfile) {
    return (
      <div className="container dir-auto flex items-center justify-center h-full">
        <p className="text-hint font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container dir-auto">
      <h1 className="text-xl font-bold mb-4">{t('profile')}</h1>

      <div className="flex gap-2 bg-[var(--secondary-bg-color)] p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar" style={{ flexWrap: "nowrap" }}>
        <button 
          className={`whitespace-nowrap py-2 px-3 text-sm flex-1 text-center flex justify-center font-medium rounded-lg transition-all ${activeTab === 'profile' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('profile')}
        >
          <div className="flex items-center justify-center gap-2"><Settings size={16} />{t('tab_settings', 'Settings')}</div>
        </button>
        <button 
          className={`whitespace-nowrap py-2 px-3 text-sm flex-1 text-center flex justify-center font-medium rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <div className="flex items-center justify-center gap-2"><Wallet size={16} />{t('tab_wallet', 'Wallet')}</div>
        </button>
        <button 
          className={`whitespace-nowrap py-2 px-3 text-sm flex-1 text-center flex justify-center font-medium rounded-lg transition-all ${activeTab === 'payments' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('payments')}
        >
          <div className="flex items-center justify-center gap-2"><CreditCard size={16} />{t('tab_payments', 'Payments')}</div>
        </button>
      </div>
      
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--secondary-bg-color)] flex items-center justify-center text-hint border border-[var(--border-color)]">
              <User size={32} />
            </div>
            <div>
              <h3 className="font-bold text-lg m-0">{userProfile.first_name} {userProfile.last_name}</h3>
              <p className="text-hint text-sm num-fix mt-1">@{userProfile.username}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-4">{t('lbl_account_details', 'Account Details')}</h3>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
              <span className="text-hint text-sm">{t('phone_number')}</span>
              <span className="font-medium num-fix tracking-wider">{userProfile.phone_number || 'Not provided'}</span>
            </div>
            {!userProfile.phone_number && (
              <button className="secondary w-full mt-4 flex items-center justify-center gap-2" onClick={shareContact}>
                <Share2 size={18} /> {t('share_contact')}
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <div className="card flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Languages size={18} className="text-hint" />
                <h3 className="font-bold m-0">{t('language')}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 py-2 text-sm ${i18n.language === 'en' ? 'bg-[var(--button-color)] text-[var(--button-text-color)]' : 'secondary'}`} 
                  onClick={() => handleLanguageChange('en')}
                >
                  EN
                </button>
                <button 
                  className={`flex-1 py-2 text-sm ${i18n.language === 'fa' ? 'bg-[var(--button-color)] text-[var(--button-text-color)]' : 'secondary'}`} 
                  onClick={() => handleLanguageChange('fa')}
                >
                  فا
                </button>
              </div>
            </div>

            <div className="card flex-1">
              <div className="flex items-center gap-2 mb-3">
                {document.body.getAttribute('data-theme') === 'dark' ? <Moon size={18} className="text-hint" /> : <Sun size={18} className="text-hint" />}
                <h3 className="font-bold m-0">{t('theme')}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 py-2 text-sm ${document.body.getAttribute('data-theme') === 'light' ? 'bg-[var(--button-color)] text-[var(--button-text-color)]' : 'secondary'}`} 
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun size={16} className="mx-auto" />
                </button>
                <button 
                  className={`flex-1 py-2 text-sm ${document.body.getAttribute('data-theme') === 'dark' ? 'bg-[var(--button-color)] text-[var(--button-text-color)]' : 'secondary'}`} 
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="flex flex-col gap-4">
          {inventory.length === 0 ? (
            <div className="card text-center py-10 text-hint flex flex-col items-center gap-3">
              <Wallet size={48} opacity={0.3} />
              <p>{t('msg_no_products', 'You have no active products.')}</p>
            </div>
          ) : (
            inventory.map(item => (
              <div key={item.id} className="card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--button-color)]"></div>
                <h4 className="font-bold text-lg m-0">{item.snapshot_name}</h4>
                <p className="text-sm text-hint mt-1 mb-4">{item.snapshot_description}</p>
                
                {item.redeem_code && (
                  <div className="bg-[var(--secondary-bg-color)] p-3 rounded-lg border border-[var(--border-color)] mb-4 flex flex-col gap-2">
                    <span className="text-xs text-hint uppercase font-semibold">{t('lbl_code', 'Code')}</span>
                    <div className="flex items-center gap-2 bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)]">
                      <div className="flex-1 overflow-x-auto hide-scrollbar whitespace-nowrap text-sm font-mono num-fix">
                        {item.redeem_code}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(item.redeem_code, item.id)}
                        className="p-2 bg-[var(--button-color)] text-[var(--button-text-color)] rounded-md shrink-0 hover:opacity-90 transition-opacity"
                        title="Copy Code"
                      >
                        {copiedCodeId === item.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                
                {item.access_ends_at && (
                  <div className="flex items-center gap-2 text-sm font-medium border-t border-[var(--border-color)] pt-3">
                    <Clock size={16} className="text-[var(--button-color)]" />
                    <span>{t('lbl_time_left', 'Time left:')}</span>
                    <span className="text-[var(--button-color)] num-fix">{calculateTimeLeft(item.access_ends_at)}</span>
                  </div>
                )}
              </div>
            ))
          )}
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
                    navigate(`/basket`);
                  } else if (p.status === 'APPROVED') {
                    setActiveTab('inventory');
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold m-0">{t('lbl_invoice', 'Invoice')} <span className="num-fix text-sm">#{p.invoice_id}</span></h4>
                    <p className="text-xs text-hint mt-1 num-fix">{new Date(p.created_at).toLocaleString()}</p>
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
                    {p.status}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-3">
                  <span className="text-sm text-hint font-medium">{t('lbl_amount', 'Amount')}</span>
                  <span className="font-bold num-fix text-lg">{p.total_price.toLocaleString()} {p.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
