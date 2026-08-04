import { useTranslation } from 'react-i18next';

export default function Profile({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t, i18n } = useTranslation();

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
      // NOTE: requestContact is supported on some clients. 
      // If not, the bot keyboard button is the fallback.
      if (tg.requestContact) {
        tg.requestContact((success: boolean) => {
          if (success) {
            alert("Contact shared successfully!");
          }
        });
      } else {
        alert("Please use the 'Share Phone Number' button in the bot chat.");
      }
    }
  };

  if (!userProfile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{t('profile')}</h1>
      
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
          <button 
            style={{ opacity: i18n.language === 'en' ? 1 : 0.5 }} 
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button 
            style={{ opacity: i18n.language === 'fa' ? 1 : 0.5 }} 
            onClick={() => handleLanguageChange('fa')}
          >
            فارسی
          </button>
        </div>
      </div>

      <div className="card mt-4">
        <h3>{t('theme')}</h3>
        <div className="flex gap-4 mt-2">
          <button 
            style={{ opacity: document.body.getAttribute('data-theme') === 'light' ? 1 : 0.5 }} 
            onClick={() => handleThemeChange('light')}
          >
            {t('light_mode')}
          </button>
          <button 
            style={{ opacity: document.body.getAttribute('data-theme') === 'dark' ? 1 : 0.5 }} 
            onClick={() => handleThemeChange('dark')}
          >
            {t('dark_mode')}
          </button>
        </div>
      </div>
    </div>
  );
}
