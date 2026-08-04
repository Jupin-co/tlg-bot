import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Landing({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [basketCount, setBasketCount] = useState(0);

  const fetchBasketCount = () => {
    fetch('/api/basket', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.basket) {
          const count = data.basket.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setBasketCount(count);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!initData) return;
    
    fetch('/api/catalog', {
      headers: { 'x-telegram-init-data': initData }
    })
    .then(r => r.json())
    .then(data => {
      if (data.products) setProducts(data.products);
      
      // Log visit
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ action: 'VIEW_CATALOG', metadata: {} })
      }).catch(console.error);
    })
    .catch(console.error);

    fetchBasketCount();
  }, [initData]);

  const addToBasket = async (productId: number) => {
    try {
      const res = await fetch('/api/basket/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ product_id: productId })
      });
      if (res.ok) {
        fetchBasketCount();
      }
    } catch {
      console.error('error');
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ background: 'var(--tg-theme-secondary-bg-color)', padding: 10, marginBottom: 10, borderRadius: 8, fontSize: 10, wordBreak: 'break-all' }}>
        <strong>Debug Info:</strong><br/>
        URL: {typeof window !== 'undefined' ? window.location.href : ''}<br/>
        Hash: {typeof window !== 'undefined' ? window.location.hash : ''}<br/>
        InitData Length: {initData?.length || 0}<br/>
        TG Object: {typeof window !== 'undefined' && (window as any).Telegram?.WebApp ? 'Yes' : 'No'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('catalog')}</h1>
        <button 
          onClick={() => navigate('/basket')} 
          style={{ position: 'relative', background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
        >
          🛒 Basket
          {basketCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', 
              borderRadius: '50%', width: 20, height: 20, fontSize: 12, display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              {basketCount}
            </span>
          )}
        </button>
      </div>
      
      <div className="mt-4">
        {products.length === 0 ? (
          <p>{t('no_products')}</p>
        ) : (
          products.map(p => (
            <div key={p.id} className="card mt-2">
              <h3>{p.name}</h3>
              {p.description && <p className="mb-2" style={{ color: 'var(--hint-color)' }}>{p.description}</p>}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{p.base_price.toLocaleString()} {p.currency}</p>
                  <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
                    {p.duration_days > 0 ? `${t('lbl_duration', 'Duration:')} ${p.duration_days} ${t('lbl_days', 'days')}` : t('lbl_lifetime', 'Lifetime')}
                  </p>
                </div>
                
                {p.stock === 0 ? (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>{t('lbl_out_of_stock', 'Out of Stock')}</span>
                ) : (
                  <button onClick={() => addToBasket(p.id)}>{t('btn_add_to_basket', 'Add to Basket')}</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
