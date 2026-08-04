import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Admin({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [newCatName, setNewCatName] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!initData || !isAdmin) return;
    
    fetch('/api/admin/catalog', {
      headers: { 'x-telegram-init-data': initData }
    })
    .then(r => r.json())
    .then(data => {
      if (data.products) setProducts(data.products);
      if (data.categories) setCategories(data.categories);
    })
    .catch(console.error);
  }, [initData, isAdmin]);

  const addCategory = async () => {
    if (!newCatName) return;
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ name: newCatName, is_active: true })
    });
    setNewCatName('');
    window.location.reload(); // Quick refresh for now
  };

  const addProduct = async () => {
    if (!newProdName || !newProdPrice) return;
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ 
        name: newProdName, 
        base_price: parseInt(newProdPrice), 
        description: newProdDesc,
        category_id: newProdCat ? parseInt(newProdCat) : null,
        is_selling: true,
        is_hidden: false
      })
    });
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    window.location.reload();
  };

  const toggleVisibility = async (p: any) => {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ 
        ...p,
        is_hidden: !p.is_hidden
      })
    });
    window.location.reload();
  };

  if (!isAdmin) {
    return <div><h1 style={{color: 'red'}}>Access Denied</h1><p>You are not an administrator.</p></div>;
  }

  return (
    <div>
      <h1>{t('admin')}</h1>
      
      <div className="card mt-4">
        <h3>{t('add_category')}</h3>
        <input 
          placeholder={t('name')} 
          value={newCatName} 
          onChange={(e) => setNewCatName(e.target.value)} 
        />
        <button className="mt-2" onClick={addCategory}>{t('save')}</button>
      </div>

      <div className="card mt-4">
        <h3>{t('add_product')}</h3>
        <input 
          placeholder={t('name')} 
          value={newProdName} 
          onChange={(e) => setNewProdName(e.target.value)} 
        />
        <input 
          placeholder={t('description')} 
          value={newProdDesc} 
          onChange={(e) => setNewProdDesc(e.target.value)} 
        />
        <input 
          type="number"
          placeholder={t('base_price')} 
          value={newProdPrice} 
          onChange={(e) => setNewProdPrice(e.target.value)} 
        />
        <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)}>
          <option value="">No Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="mt-2" onClick={addProduct}>{t('save')}</button>
      </div>

      <div className="mt-4">
        <h3>Products</h3>
        {products.map(p => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <h4>{p.name}</h4>
              <p>${p.base_price}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span style={{fontSize: 12}}>{t('visible')}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={!p.is_hidden} 
                  onChange={() => toggleVisibility(p)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
