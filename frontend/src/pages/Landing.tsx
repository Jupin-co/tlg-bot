import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../i18n';
import { ShoppingCart, Plus, Calendar, PackageOpen } from 'lucide-react';

export default function Landing({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [basketItems, setBasketItems] = useState<any[]>([]);
  const [basketCount, setBasketCount] = useState(0);

  const fetchBasketCount = () => {
    fetch('/api/basket', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.basket) {
          setBasketItems(data.basket);
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

  
  const handleDecrement = async (basketId: number) => {
    try {
      const res = await fetch('/api/basket/decrement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ basket_id: basketId })
      });
      if (res.ok) fetchBasketCount();
    } catch { console.error('error'); }
  };

  const addToBasket = async (productId: number) => {
    try {
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ action: 'ADD_TO_BASKET', details: { product_id: productId } })
      }).catch(console.error);
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
            <span>{formatNumber(basketCount)}</span>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ margin: 0 }}>{p.name}</h3>
                <span className="font-bold text-lg" style={{ color: 'var(--link-color)' }}>{formatNumber(p.base_price)} {t(p.currency.toLowerCase(), p.currency)}
                </span>
              </div>
              
              {p.description && <p className="text-hint text-sm mb-6 leading-relaxed">{p.description}</p>}
              
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 text-hint text-sm">
                  <Calendar size={16} />
                  <span>{p.duration_days > 0 ? `${formatNumber(p.duration_days)} ${t('lbl_days', 'days')}` : t('lbl_lifetime', 'Lifetime')}</span>
                </div>
                
                {p.stock === 0 ? (
                  <span className="text-danger font-bold text-sm px-4 py-2" style={{ background: 'rgba(255,59,48,0.1)', borderRadius: 'var(--radius-full)' }}>
                    {t('lbl_out_of_stock', 'Out of Stock')}
                  </span>
                ) : (
                  (() => {
                    const inBasket = basketItems.find(i => i.product_id === p.id);
                    if (inBasket) {
                      return (
                        <div className="flex items-center gap-3 bg-[var(--bg-color)] rounded-full p-1 border border-[var(--border-color)]">
                          <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--danger-color)] hover:text-white" onClick={() => handleDecrement(inBasket.basket_id)}>-</button>
                          <span className="font-bold min-w-[20px] text-center">{formatNumber(inBasket.quantity)}</span>
                          <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--success-color)] hover:text-white" onClick={() => addToBasket(p.id)} disabled={p.stock !== -1 && inBasket.quantity >= p.stock} style={{ opacity: (p.stock !== -1 && inBasket.quantity >= p.stock) ? 0.5 : 1 }}>+</button>
                        </div>
                      );
                    } else {
                      return (
                        <button onClick={() => addToBasket(p.id)} style={{ borderRadius: 'var(--radius-full)' }}>
                          <Plus size={18} /> {t('btn_add_to_basket', 'Add to Basket')}
                        </button>
                      );
                    }
                  })()
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
