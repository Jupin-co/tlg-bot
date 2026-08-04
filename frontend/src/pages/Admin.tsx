import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Admin({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'catalog' | 'settings' | 'payments'>('catalog');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [newCatName, setNewCatName] = useState('');
  
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCurrency, setNewProdCurrency] = useState('USD');
  const [newProdDuration, setNewProdDuration] = useState('0');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCatalog = () => {
    fetch('/api/admin/catalog', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => showToast("Failed to fetch catalog", "error"));
  };

  const fetchSettings = () => {
    fetch('/api/admin/settings', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setCardHolder(data.settings.card_holder || '');
          setCardNumber(data.settings.card_number || '');
        }
      })
      .catch(() => showToast("Failed to fetch settings", "error"));
  };

  const fetchPayments = () => {
    fetch('/api/admin/payments', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(() => showToast("Failed to fetch payments", "error"));
  };

  useEffect(() => {
    if (!initData || !isAdmin) return;
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'payments') fetchPayments();
  }, [initData, isAdmin, activeTab]);

  const addCategory = async () => {
    if (!newCatName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ name: newCatName, is_active: true })
      });
      if (res.ok) {
        showToast("Category added successfully!", "success");
        setNewCatName('');
        fetchCatalog();
      } else {
        showToast("Failed to add category", "error");
      }
    } catch {
      showToast("Error adding category", "error");
    }
  };

  const addProduct = async () => {
    if (!newProdName || !newProdPrice) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ 
          name: newProdName, 
          base_price: parseInt(newProdPrice), 
          currency: newProdCurrency,
          duration_days: parseInt(newProdDuration) || 0,
          description: newProdDesc,
          category_id: newProdCat ? parseInt(newProdCat) : null,
          is_selling: true,
          is_hidden: false
        })
      });
      if (res.ok) {
        showToast("Product added successfully!", "success");
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        fetchCatalog();
      } else {
        showToast("Failed to add product", "error");
      }
    } catch {
      showToast("Error adding product", "error");
    }
  };

  const toggleVisibility = async (p: any) => {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ ...p, is_hidden: !p.is_hidden })
    });
    fetchCatalog();
  };

  const saveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ card_holder: cardHolder, card_number: cardNumber })
      });
      if (res.ok) showToast("Settings saved!", "success");
      else showToast("Failed to save settings", "error");
    } catch {
      showToast("Error saving settings", "error");
    }
  };

  const handlePayment = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/payments/${id}/${action}`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      if (res.ok) {
        showToast(`Payment ${action}d successfully!`, "success");
        fetchPayments();
      } else {
        showToast(`Failed to ${action} payment`, "error");
      }
    } catch {
      showToast("Error processing payment", "error");
    }
  };

  if (!isAdmin) {
    return <div><h1 style={{color: 'red'}}>Access Denied</h1></div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#4CAF50' : '#f44336',
          color: 'white', padding: '10px 20px', borderRadius: 8, zIndex: 1000
        }}>
          {toast.msg}
        </div>
      )}

      <h1>{t('admin')}</h1>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('catalog')} style={{ opacity: activeTab === 'catalog' ? 1 : 0.6 }}>Catalog</button>
        <button onClick={() => setActiveTab('settings')} style={{ opacity: activeTab === 'settings' ? 1 : 0.6 }}>Settings</button>
        <button onClick={() => setActiveTab('payments')} style={{ opacity: activeTab === 'payments' ? 1 : 0.6 }}>Payments</button>
      </div>

      {activeTab === 'catalog' && (
        <>
          <div className="card mt-4">
            <h3>{t('add_category')}</h3>
            <input placeholder={t('name')} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <button className="mt-2" onClick={addCategory}>{t('save')}</button>
          </div>

          <div className="card mt-4">
            <h3>{t('add_product')}</h3>
            <input placeholder={t('name')} value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
            <input placeholder={t('description')} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} />
            <input type="number" placeholder={t('base_price')} value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} />
            <input placeholder="Currency (e.g. USD)" value={newProdCurrency} onChange={(e) => setNewProdCurrency(e.target.value)} />
            <input type="number" placeholder="Duration (Days)" value={newProdDuration} onChange={(e) => setNewProdDuration(e.target.value)} />
            <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)}>
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="mt-2" onClick={addProduct}>{t('save')}</button>
          </div>

          <div className="mt-4">
            <h3>Products</h3>
            {products.map(p => (
              <div key={p.id} className="card flex items-center justify-between">
                <div>
                  <h4>{p.name}</h4>
                  <p>{new Intl.NumberFormat().format(p.base_price)} {p.currency}</p>
                  <p style={{fontSize: 12, opacity: 0.7}}>Stock: {p.stock === -1 ? 'Unlimited' : p.stock} | Days: {p.duration_days}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span style={{fontSize: 12}}>{t('visible')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={!p.is_hidden} onChange={() => toggleVisibility(p)} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="card mt-4">
          <h3>Payment Settings</h3>
          <p style={{fontSize: 12, opacity: 0.7}}>This information is shown to users for manual card transfers.</p>
          <input placeholder="Card Holder Name" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
          <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
          <button className="mt-2" onClick={saveSettings}>{t('save')}</button>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="mt-4">
          <h3>Pending Receipts</h3>
          {payments.length === 0 && <p>No pending payments.</p>}
          {payments.map(p => {
            let receiptKey = '';
            try {
              receiptKey = JSON.parse(p.payment_data).receipt_key;
            } catch {}

            return (
              <div key={p.id} className="card mt-2">
                <h4>Invoice #{p.invoice_id}</h4>
                <p>User: {p.first_name} (@{p.username})</p>
                <p>Amount: {new Intl.NumberFormat().format(p.total_price)} {p.currency}</p>
                {receiptKey && (
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <a href={`/api/receipt-image/${receiptKey.split('/').pop()}`} target="_blank" rel="noreferrer" style={{ color: 'var(--tg-theme-link-color)' }}>
                      View Receipt Image
                    </a>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ backgroundColor: '#4CAF50' }} onClick={() => handlePayment(p.id, 'approve')}>Approve</button>
                  <button style={{ backgroundColor: '#f44336' }} onClick={() => handlePayment(p.id, 'reject')}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
