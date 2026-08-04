import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Landing({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);

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
  }, [initData]);

  return (
    <div>
      <h1>{t('catalog')}</h1>
      
      <div className="mt-4">
        {products.length === 0 ? (
          <p>{t('no_products')}</p>
        ) : (
          products.map(p => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              {p.description && <p className="mb-2" style={{ color: 'var(--hint-color)' }}>{p.description}</p>}
              <p><strong>{t('price')}:</strong> ${p.base_price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
