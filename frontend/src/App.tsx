import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { User, Store, Settings } from 'lucide-react';

function Navigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
        className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={24} />
        <span>{t('profile')}</span>
      </div>
      {/* Optionally only show Admin if user is admin, but we can rely on route protection too */}
      <div 
        className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
        onClick={() => navigate('/admin')}
      >
        <Settings size={24} />
        <span>{t('admin')}</span>
      </div>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [initData, setInitData] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      setInitData(tg.initData);
      
      // Setup theme based on telegram if not overridden
      document.body.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (initData) {
      // Fetch user profile to get overrides
      fetch('/api/user', {
        headers: {
          'x-telegram-init-data': initData
        }
      })
      .then(r => r.json())
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
        }
      });
    }
  }, [initData, i18n]);

  return (
    <BrowserRouter>
      <div className="container" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
        <Routes>
          <Route path="/" element={<Landing initData={initData} />} />
          <Route path="/profile" element={<Profile initData={initData} userProfile={userProfile} />} />
          <Route path="/admin" element={<Admin initData={initData} userProfile={userProfile} />} />
        </Routes>
      </div>
      <Navigation />
    </BrowserRouter>
  );
}

export default App;
