import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../i18n';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function Basket({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [basket, setBasket] = useState<any[]>([]);
  

  const fetchBasket = () => {
    fetch('/api/basket', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.basket) setBasket(data.basket);
      })
      .catch(console.error);
  };

    useEffect(() => {
    if (initData) fetchBasket();
  }, [initData]);

    const handleDecrement = async (basketId: number) => {
    await fetch('/api/basket/decrement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ basket_id: basketId })
    });
    fetchBasket();
  };

  const handleAdd = async (productId: number, variantId: number | null) => {
    await fetch('/api/basket/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ product_id: productId, variant_id: variantId })
    });
    fetchBasket();
  };

  const handleCheckout = async () => {
    try {
      const totalValue = basket.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ 
          action: 'CHECKOUT_START', 
          details: { 
            total_items: basket.length,
            total_value: totalValue,
            items: basket.map(b => ({ id: b.product_id, qty: b.quantity, price: b.final_price })),
            user_agent: navigator.userAgent
          } 
        })
      }).catch(console.error);
      const res = await fetch('/api/invoice/create', { method: 'POST', headers: { 'x-telegram-init-data': initData } });
      const data = await res.json();
      if (data.success) {
        navigate('/invoice/' + data.invoice_id);
      } else {
        alert(data.error || t('msg_checkout_failed', 'Checkout failed'));
      }
    } catch { console.error('error'); }
  };

  

  return (
    <div className="container dir-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="secondary" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold" style={{ margin: 0 }}>{t('title_basket', 'Your Basket')}</h1>
      </div>
      
      {basket.length === 0 ? (
        <div className="card text-center py-10 text-hint flex flex-col items-center gap-4 mt-8">
          <ShoppingCart size={64} opacity={0.3} />
          <p className="text-lg" style={{ margin: 0 }}>{t('msg_basket_empty', 'Your basket is empty.')}</p>
          <button onClick={() => navigate('/')} className="mt-4 secondary">
            {t('catalog', 'Browse Catalog')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {basket.map(item => (
            <div key={item.basket_id} className="card flex justify-between items-center">
              {item.image_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 mr-3 border border-[var(--border-color)]">
                  <img src={item.image_url} alt={item.display_name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1" style={{ margin: 0 }}>{item.display_name}</h4>
                <div className="text-hint font-medium">
                  <span>{formatNumber(item.final_price)} {t(item.currency.toLowerCase(), item.currency) as string}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--bg-color)] rounded-xl p-1 border border-[var(--border-color)]">
                <button className="secondary p-2 rounded-lg border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--danger-color)] hover:text-white" onClick={() => handleDecrement(item.basket_id)}>-</button>
                <span className="font-bold min-w-[20px] text-center">{formatNumber(item.quantity)}</span>
                <button className="secondary p-2 rounded-lg border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--success-color)] hover:text-white" onClick={() => handleAdd(item.product_id, item.variant_id)} disabled={item.stock !== -1 && item.quantity >= item.stock} style={{ opacity: (item.stock !== -1 && item.quantity >= item.stock) ? 0.5 : 1 }}>+</button>
              </div>
            </div>
          ))}
          
          <div className="card mt-4 bg-[var(--secondary-bg-color)] border-none">
            <div className="flex justify-between items-center mb-6">
              <span className="text-hint font-semibold uppercase">{t('lbl_total', 'Total')}</span>
              <span className="font-bold text-2xl text-[var(--button-color)]">{formatNumber(basket.reduce((a, b) => a + b.final_price * b.quantity, 0))} {t(basket[0]?.currency?.toLowerCase() || '', basket[0]?.currency) as string}
              </span>
            </div>
            <button className="w-full justify-center" style={{ padding: '16px', fontSize: '18px' }} onClick={handleCheckout}>
              {t('btn_checkout', 'Checkout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
