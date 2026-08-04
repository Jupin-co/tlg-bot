import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Calendar, PackageOpen } from 'lucide-react';

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
    <div className="container dir-auto">
      <h1 className="text-xl font-bold mb-4">{t('catalog')}</h1>
      
      {basketCount > 0 && (
        <button 
          className="fab flex items-center justify-center"
          onClick={() => navigate('/basket')} 
        >
          <ShoppingCart size={24} />
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ff3b30', color: 'white', 
            borderRadius: '12px', padding: '2px 6px', fontSize: 12, fontWeight: 'bold',
            border: '2px solid var(--bg-color)', lineHeight: 1
          }}>
            <span className="num-fix">{basketCount}</span>
          </span>
        </button>
      )}
      
      <div className="flex flex-col gap-4 mt-6">
        {products.length === 0 ? (
          <div className="card text-center py-8 text-hint flex flex-col items-center gap-3">
            <PackageOpen size={48} opacity={0.5} />
            <p>{t('no_products')}</p>
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className="card" style={{ display: p.is_hidden ? 'none' : 'block' }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold" style={{ margin: 0 }}>{p.name}</h3>
                <span className="font-bold text-lg num-fix" style={{ color: 'var(--link-color)' }}>
                  {p.base_price.toLocaleString()} {p.currency}
                </span>
              </div>
              
              {p.description && <p className="text-hint text-sm mb-4" style={{ marginTop: 4 }}>{p.description}</p>}
              
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 text-hint text-sm">
                  <Calendar size={16} />
                  <span className="num-fix">
                    {p.duration_days > 0 ? `${p.duration_days} ${t('lbl_days', 'days')}` : t('lbl_lifetime', 'Lifetime')}
                  </span>
                </div>
                
                {p.stock === 0 ? (
                  <span className="text-danger font-bold text-sm px-4 py-2" style={{ background: 'rgba(255,59,48,0.1)', borderRadius: 'var(--radius-full)' }}>
                    {t('lbl_out_of_stock', 'Out of Stock')}
                  </span>
                ) : (
                  <button onClick={() => addToBasket(p.id)} style={{ borderRadius: 'var(--radius-full)' }}>
                    <Plus size={18} /> {t('btn_add_to_basket', 'Add to Basket')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
