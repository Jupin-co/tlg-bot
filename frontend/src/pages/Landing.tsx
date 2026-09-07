import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../i18n';
import { ShoppingCart, Plus, Calendar, PackageOpen, Search, ArrowUpDown } from 'lucide-react';

function ProductCard({ 
  p, variants, basketItems, addToBasket, handleDecrement, t, setFullScreenImg 
}: { 
  p: any, variants: any[], basketItems: any[], addToBasket: any, handleDecrement: any, t: any, setFullScreenImg: any 
}) {
  const pVariants = variants.filter(v => v.product_id === p.id);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  
  const selectedVariant = selectedVariantId ? pVariants.find(v => v.id === selectedVariantId) : null;
  const currentPrice = selectedVariant ? p.base_price + selectedVariant.price_modifier : p.base_price;
  const currentDetails = selectedVariant?.details || p.description;
  const currentStock = selectedVariant ? selectedVariant.stock : p.stock;

  const productBasketItems = basketItems.filter(i => 
    i.product_id === p.id && (selectedVariantId ? i.variant_id === selectedVariantId : !i.variant_id)
  );
  const totalQuantity = productBasketItems.reduce((sum, i) => sum + i.quantity, 0);

  const pImages: string[] = [];
  if (p.image_url) pImages.push(p.image_url);
  pVariants.forEach(v => {
    if (v.image_url && !pImages.includes(v.image_url)) pImages.push(v.image_url);
  });
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-lg font-bold m-0 flex-1">{p.name}</h3>
        <span className="font-bold text-lg text-[var(--link-color)] shrink-0">{formatNumber(currentPrice)} {t(p.currency.toLowerCase(), p.currency) as string}</span>
      </div>
      
      {pImages.length > 0 && (
        <div className="w-full relative mb-4">
          <div className="w-full h-48 border border-[var(--border-color)] overflow-hidden bg-[var(--secondary-bg-color)] rounded-lg relative">
            <img 
              src={pImages[currentImgIndex]} 
              alt={`${p.name} image`} 
              className="w-full h-full object-cover cursor-pointer" 
              onClick={() => setFullScreenImg(pImages[currentImgIndex])} 
            />
            {pImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none">
                {currentImgIndex + 1} / {pImages.length}
              </div>
            )}
          </div>
          {pImages.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImgIndex(i => (i === 0 ? pImages.length - 1 : i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <span className="font-bold text-lg" style={{lineHeight: 1, marginTop: '-2px'}}>‹</span>
              </button>
              <button 
                onClick={() => setCurrentImgIndex(i => (i === pImages.length - 1 ? 0 : i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <span className="font-bold text-lg" style={{lineHeight: 1, marginTop: '-2px'}}>›</span>
              </button>
            </>
          )}
        </div>
      )}

      {pVariants.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-xs font-bold text-hint">{t('lbl_options', 'Options')}:</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setSelectedVariantId(null);
                if (p.image_url) {
                  setCurrentImgIndex(pImages.indexOf(p.image_url) !== -1 ? pImages.indexOf(p.image_url) : 0);
                } else {
                  setCurrentImgIndex(0);
                }
              }}
              className={`py-1 px-3 rounded-full text-xs font-bold border transition-colors ${selectedVariantId === null ? 'bg-[var(--link-color)] text-white border-[var(--link-color)]' : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)]'}`}
            >
              {t('lbl_base_option', 'Standard')}
            </button>
            {pVariants.map(v => (
              <button 
                key={v.id} 
                onClick={() => {
                  setSelectedVariantId(v.id);
                  if (v.image_url) {
                    const idx = pImages.indexOf(v.image_url);
                    if (idx !== -1) setCurrentImgIndex(idx);
                  }
                }}
                className={`py-1 px-3 rounded-full text-xs font-bold border transition-colors ${selectedVariantId === v.id ? 'bg-[var(--link-color)] text-white border-[var(--link-color)]' : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)]'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentDetails && <p className="text-hint text-sm mb-6 leading-relaxed whitespace-pre-wrap">{currentDetails}</p>}
      
      <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2 text-hint text-sm">
          <Calendar size={16} />
          <span>{p.duration_days > 0 ? `${formatNumber(p.duration_days)} ${t('lbl_days', 'days')}` : t('lbl_lifetime', 'Lifetime') as string}</span>
        </div>
        
        {currentStock === 0 ? (
          <span className="text-danger font-bold text-sm px-4 py-2" style={{ background: 'rgba(255,59,48,0.1)', borderRadius: 'var(--radius-full)' }}>
            {t('lbl_out_of_stock', 'Out of Stock')}
          </span>
        ) : (
          totalQuantity > 0 ? (
            <div className="flex items-center gap-3 bg-[var(--bg-color)] rounded-full p-1 border border-[var(--border-color)]">
              <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--danger-color)] hover:text-white" onClick={() => {
                handleDecrement(productBasketItems[productBasketItems.length - 1].basket_id);
              }}>-</button>
              <span className="font-bold min-w-[20px] text-center">{formatNumber(totalQuantity)}</span>
              <button className="secondary p-2 rounded-full border-none w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--success-color)] hover:text-white" onClick={() => addToBasket(p.id, selectedVariantId || undefined)} disabled={currentStock !== -1 && totalQuantity >= currentStock} style={{ opacity: (currentStock !== -1 && totalQuantity >= currentStock) ? 0.5 : 1 }}>+</button>
            </div>
          ) : (
            <button onClick={() => addToBasket(p.id, selectedVariantId || undefined)} style={{ borderRadius: 'var(--radius-full)' }}>
              <Plus size={18} /> {t('btn_add_to_basket', 'Add to Basket')}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function Landing({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [basketItems, setBasketItems] = useState<any[]>([]);
  const [basketCount, setBasketCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // none, price_asc, price_desc
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

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
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--danger-color)',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {basketCount}
          </span>
        </button>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-hint" size={18} />
          <input 
            type="text" 
            placeholder={t('search', 'Search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-[var(--secondary-bg-color)] border border-[var(--border-color)] rounded-full text-sm"
          />
        </div>
        <button 
          onClick={() => setSortOrder(prev => prev === 'none' ? 'price_asc' : prev === 'price_asc' ? 'price_desc' : 'none')}
          className="secondary p-2 rounded-full flex items-center justify-center border border-[var(--border-color)] shrink-0"
        >
          <ArrowUpDown size={18} className={sortOrder !== 'none' ? 'text-[var(--link-color)]' : 'text-hint'} />
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
            <ProductCard 
              key={p.id}
              p={p} 
              variants={variants} 
              basketItems={basketItems} 
              addToBasket={addToBasket} 
              handleDecrement={handleDecrement} 
              t={t} 
              setFullScreenImg={setFullScreenImg}
            />
          ))
        )}
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImg && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setFullScreenImg(null)}>
          <div className="relative w-full max-w-2xl h-full flex items-center justify-center pointer-events-none">
            <button className="absolute top-4 left-4 z-50 bg-[rgba(0,0,0,0.5)] text-white border-none py-2 px-4 rounded-full flex items-center gap-2 pointer-events-auto" onClick={() => setFullScreenImg(null)}>
              <span style={{fontSize: '18px', lineHeight: 1}}>×</span> {t('btn_close', 'Close')}
            </button>
            <img src={fullScreenImg} alt="Full Screen" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} className="pointer-events-auto" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
