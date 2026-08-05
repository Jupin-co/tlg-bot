import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import { loadTranslations } from './i18n';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Wallet from './pages/Wallet';
import Basket from './pages/Basket';
import InvoiceView from './pages/InvoiceView';
import Inventory from './pages/Inventory';
import { User, Store, Settings, Package } from 'lucide-react';

function Navigation({ userProfile }: { userProfile: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  return (
    <div className="nav-bar">
      <div 
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <Store size={24} />
        <span>{t('catalog')}</span>
      </div>
      <div 
        className={`nav-item ${location.pathname === '/inventory' ? 'active' : ''}`}
        onClick={() => navigate('/inventory')}
      >
        <Package size={24} />
        <span>{t('tab_inventory', 'Inventory') as string}</span>
      </div>
      <div 
        className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={24} />
        <span>{t('profile')}</span>
      </div>
      {isAdmin && (
        <div 
          className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <Settings size={24} />
          <span>{t('admin')}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [initData, setInitData] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      
      let data = tg.initData;
      if (!data) {
        // Fallback to sessionStorage in case of page reload which strips the hash
        data = sessionStorage.getItem('tg_init_data') || '';
      } else {
        sessionStorage.setItem('tg_init_data', data);
      }
      
      setInitData(data);
      
      // Setup theme based on telegram if not overridden
      document.body.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');
    }
    loadTranslations();
  }, []);

  useEffect(() => {
    if (initData) {
      // Fetch user profile to get overrides
      fetch('/api/user', {
        headers: {
          'x-telegram-init-data': initData
        }
      })
      .then(async r => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`HTTP ${r.status}: ${text}`);
        }
        return r.json();
      })
      .then(data => {
        if (data.user) {
          setUserProfile(data.user);
          if (data.user.language_preference) {
            i18n.changeLanguage(data.user.language_preference);
            document.body.dir = data.user.language_preference === 'fa' ? 'rtl' : 'ltr';
          }
          if (data.user.theme_preference) {
             document.body.setAttribute('data-theme', data.user.theme_preference);
          }
        } else {
          setFetchError(`No user in data: ${JSON.stringify(data)}`);
        }
      })
      .catch(e => {
        console.error(e);
        setFetchError(e.message || String(e));
      });
    }
  }, [initData, i18n]);

  return (
    <BrowserRouter>
      <div className="container" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
        <Routes>
          <Route path="/" element={<Landing initData={initData} />} />
          <Route path="/basket" element={<Basket initData={initData} />} />
          <Route path="/invoice/:id" element={<InvoiceView initData={initData} />} />
          <Route path="/inventory" element={<Inventory initData={initData} />} />
          <Route path="/wallet" element={<Wallet initData={initData} userProfile={userProfile} />} />
          <Route path="/profile" element={<Profile initData={initData} userProfile={userProfile} error={fetchError} />} />
          <Route path="/admin" element={<Admin initData={initData} userProfile={userProfile} />} />
        </Routes>
      </div>
      <Navigation userProfile={userProfile} />
    </BrowserRouter>
  );
}

export default App;
