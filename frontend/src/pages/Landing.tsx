import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../i18n';
import { ShoppingCart, Plus, Calendar, PackageOpen, Search, ArrowUpDown } from 'lucide-react';

export default function Landing({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [basketItems, setBasketItems] = useState<any[]>([]);
  const [basketCount, setBasketCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // none, price_asc, price_desc
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);

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
      if (data.variants) setVariants(data.variants);
      
      // Log visit
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ 
          action: 'VIEW_CATALOG', 
          details: { 
            products_count: data.products?.length || 0,
            categories_count: data.categories?.length || 0,
            user_agent: navigator.userAgent,
            language: navigator.language,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight
          } 
        })
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

  const addToBasket = async (productId: number, variantId?: number) => {
    try {
      const product = products.find(p => p.id === productId);
      const productVariants = variants.filter(v => v.product_id === productId);

      if (!variantId && productVariants.length > 0) {
        setSelectedProductForVariant(product);
        return; // Open modal instead of adding immediately
      }

      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ 
          action: 'ADD_TO_BASKET', 
          details: { 
            product_id: productId,
            variant_id: variantId,
            product_name: product?.name,
            product_price: product?.price,
            user_agent: navigator.userAgent
          } 
        })
      }).catch(console.error);
      const res = await fetch('/api/basket/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ product_id: productId, variant_id: variantId })
      });
      if (res.ok) {
        setSelectedProductForVariant(null);
        fetchBasketCount();
      }
    } catch {
      console.error('error');
    }
  };

  const filteredProducts = products.filter(p => !p.is_hidden && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price_asc') return a.base_price - b.base_price;
    if (sortOrder === 'price_desc') return b.base_price - a.base_price;
    return 0;
  });

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

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder={t('search_placeholder', 'Search...') as string} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] m-0"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-hint" />
        </div>
        <button 
          className="secondary px-4 py-3 rounded-full border-none m-0 bg-[var(--card-bg-color)] shadow-sm"
          onClick={() => {
            if (sortOrder === 'none') setSortOrder('price_asc');
            else if (sortOrder === 'price_asc') setSortOrder('price_desc');
            else setSortOrder('none');
          }}
        >
          <ArrowUpDown size={18} />
          {sortOrder === 'price_asc' && <span className="ml-1 text-xs font-bold">↑</span>}
          {sortOrder === 'price_desc' && <span className="ml-1 text-xs font-bold">↓</span>}
        </button>
      </div>
      
      <div className="flex flex-col gap-4 mt-2">
        {sortedProducts.length === 0 ? (
          <div className="card text-center py-8 text-hint flex flex-col items-center gap-3">
            <PackageOpen size={48} opacity={0.5} />
            <p>{searchQuery ? t('no_results', 'No results found.') : t('no_products')}</p>
          </div>
        ) : (
          sortedProducts.map(p => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold m-0">{p.name}</h3>
                <span className="font-bold text-lg text-[var(--link-color)]">{formatNumber(p.base_price)} {t(p.currency.toLowerCase(), p.currency) as string}</span>
              </div>
              
              {p.image_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4 border border-[var(--border-color)]">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}

              {p.description && <p className="text-hint text-sm mb-6 leading-relaxed">{p.description}</p>}
              
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 text-hint text-sm">
                  <Calendar size={16} />
                  <span>{p.duration_days > 0 ? `${formatNumber(p.duration_days)} ${t('lbl_days', 'days')}` : t('lbl_lifetime', 'Lifetime') as string}</span>
                </div>
                
                {p.stock === 0 ? (
                  <span className="text-danger font-bold text-sm px-4 py-2" style={{ background: 'rgba(255,59,48,0.1)', borderRadius: 'var(--radius-full)' }}>
                    {t('lbl_out_of_stock', 'Out of Stock')}
                  </span>
                ) : (
                  (() => {
                    const pVariants = variants.filter(v => v.product_id === p.id);
                    const productBasketItems = basketItems.filter(i => i.product_id === p.id);
                    const totalQuantity = productBasketItems.reduce((sum, i) => sum + i.quantity, 0);

                    if (totalQuantity > 0) {
                      return (
                        <div className="flex items-center gap-3 bg-[var(--bg-color)] rounded-full p-1 border border-[var(--border-color)]">
                          <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--danger-color)] hover:text-white" onClick={() => {
                            if (productBasketItems.length === 1) {
                              handleDecrement(productBasketItems[0].basket_id);
                            } else {
                              // If multiple variants, just go to basket or decrement the last added
                              handleDecrement(productBasketItems[productBasketItems.length - 1].basket_id);
                            }
                          }}>-</button>
                          <span className="font-bold min-w-[20px] text-center">{formatNumber(totalQuantity)}</span>
                          <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--success-color)] hover:text-white" onClick={() => addToBasket(p.id)} disabled={p.stock !== -1 && totalQuantity >= p.stock} style={{ opacity: (p.stock !== -1 && totalQuantity >= p.stock) ? 0.5 : 1 }}>+</button>
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

      {selectedProductForVariant && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="card w-full max-w-sm flex flex-col" style={{ maxHeight: "90vh", overflow: "hidden" }}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold m-0">{selectedProductForVariant.name} - Select Variant</h3>
              <button onClick={() => setSelectedProductForVariant(null)} className="secondary p-2 rounded-full border-none"><span style={{fontSize: '18px', lineHeight: 1}}>×</span></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-3">
                {variants.filter(v => v.product_id === selectedProductForVariant.id).map(v => (
                  <div key={v.id} className="card bg-[var(--secondary-bg-color)] border border-[var(--border-color)] m-0 p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <strong className="font-bold">{v.name}</strong>
                      <span className="font-bold text-[var(--link-color)]">{v.price_modifier > 0 ? '+' : ''}{formatNumber(v.price_modifier)} {selectedProductForVariant.currency}</span>
                    </div>
                    {v.details && <p className="text-xs text-hint m-0">{v.details}</p>}
                    {v.image_url && (
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-[var(--border-color)]">
                        <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <button className="mt-2 text-sm" onClick={() => addToBasket(selectedProductForVariant.id, v.id)}>
                      {t('btn_add_to_basket', 'Add to Basket')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
