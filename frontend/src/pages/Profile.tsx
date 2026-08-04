import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Profile({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'payments'>('profile');
  const [inventory, setInventory] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

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
          if (success) alert("Contact shared successfully!");
        });
      } else {
        alert("Please use the 'Share Phone Number' button in the bot chat.");
      }
    }
  };

  const calculateTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${d} days ${h} hours`;
  };

  if (!initData) return <div style={{ padding: 20 }}>{t('msg_open_in_telegram', 'Please open this app from inside Telegram.')}</div>;
  if (!userProfile) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ paddingBottom: 60 }}>
      <h1>{t('profile')}</h1>

      <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('profile')} style={{ opacity: activeTab === 'profile' ? 1 : 0.6 }}>{t('tab_settings', 'Settings')}</button>
        <button onClick={() => setActiveTab('inventory')} style={{ opacity: activeTab === 'inventory' ? 1 : 0.6 }}>{t('tab_wallet', 'Wallet')}</button>
        <button onClick={() => setActiveTab('payments')} style={{ opacity: activeTab === 'payments' ? 1 : 0.6 }}>{t('tab_payments', 'Payments')}</button>
      </div>
      
      {activeTab === 'profile' && (
        <>
          <div className="card mt-4">
            <h3>{userProfile.first_name} {userProfile.last_name}</h3>
            <p style={{ color: 'var(--hint-color)' }}>@{userProfile.username}</p>
            
            <div className="mt-4">
              <p><strong>{t('phone_number')}:</strong> {userProfile.phone_number || 'Not provided'}</p>
              {!userProfile.phone_number && (
                <button className="mt-2" onClick={shareContact}>{t('share_contact')}</button>
              )}
            </div>
          </div>

          <div className="card mt-4">
            <h3>{t('language')}</h3>
            <div className="flex gap-4 mt-2">
              <button style={{ opacity: i18n.language === 'en' ? 1 : 0.5 }} onClick={() => handleLanguageChange('en')}>English</button>
              <button style={{ opacity: i18n.language === 'fa' ? 1 : 0.5 }} onClick={() => handleLanguageChange('fa')}>فارسی</button>
            </div>
          </div>

          <div className="card mt-4">
            <h3>{t('theme')}</h3>
            <div className="flex gap-4 mt-2">
              <button style={{ opacity: document.body.getAttribute('data-theme') === 'light' ? 1 : 0.5 }} onClick={() => handleThemeChange('light')}>{t('light_mode')}</button>
              <button style={{ opacity: document.body.getAttribute('data-theme') === 'dark' ? 1 : 0.5 }} onClick={() => handleThemeChange('dark')}>{t('dark_mode')}</button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="mt-4">
          <h3>{t('lbl_your_products', 'Your Products (Wallet)')}</h3>
          {inventory.length === 0 && <p>{t('msg_no_products', 'You have no active products.')}</p>}
          {inventory.map(item => (
            <div key={item.id} className="card mt-2">
              <h4>{item.snapshot_name}</h4>
              <p style={{ fontSize: 12, opacity: 0.8 }}>{item.snapshot_description}</p>
              {item.redeem_code && (
                <div style={{ marginTop: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5 }}>
                  <span style={{ fontSize: 12 }}>Redeem Code:</span>
                  <p style={{ fontWeight: 'bold', fontSize: 16, letterSpacing: 2 }}>{item.redeem_code}</p>
                </div>
              )}
              {item.access_ends_at && (
                <p style={{ marginTop: 10, fontWeight: 'bold' }}>
                  Time left: <span style={{ color: 'var(--tg-theme-button-color)' }}>{calculateTimeLeft(item.access_ends_at)}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="mt-4">
          <h3>{t('lbl_payment_history', 'Payment History')}</h3>
          {payments.length === 0 && <p>{t('msg_no_payments', 'No payment history.')}</p>}
          {payments.map(p => (
            <div 
              key={p.id} 
              className="card mt-2" 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (p.status === 'PENDING_APPROVAL' || p.status === 'PENDING_PAYMENT') {
                  navigate(`/basket`);
                  // ideally navigate to /invoice/:id but we'll let user go to basket for now
                  // A better UX is to have a dedicated Invoice view route
                } else if (p.status === 'APPROVED') {
                  setActiveTab('inventory');
                }
              }}
            >
              <h4>{t('lbl_invoice', 'Invoice')} #{p.invoice_id}</h4>
              <p>{t('lbl_amount', 'Amount:')} {p.total_price.toLocaleString()} {p.currency}</p>
              <p>{t('lbl_status', 'Status:')} 
                <span style={{ 
                  color: p.status === 'APPROVED' ? 'green' : p.status === 'REJECTED' ? 'red' : 'orange',
                  marginLeft: 5 
                }}>
                  {p.status}
                </span>
              </p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>{new Date(p.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
