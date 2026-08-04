import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslations } from '../i18n';

export default function Admin({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'catalog' | 'settings' | 'payments' | 'messages' | 'users'>('catalog');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // User Logs State
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [viewLogsUserId, setViewLogsUserId] = useState<number | null>(null);
  
  // Catalog States
  const [showCatModal, setShowCatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);

  const [newCatName, setNewCatName] = useState('');
  
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCurrency, setNewProdCurrency] = useState('USD');
  const [newProdDuration, setNewProdDuration] = useState('0');
  const [newProdStock, setNewProdStock] = useState('-1');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  
  // Settings States
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  // Redeem Codes States
  const [manageCodesProductId, setManageCodesProductId] = useState<number | null>(null);
  const [productCodes, setProductCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');

  // Messages States
  const [languages, setLanguages] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any>({});
  const [newMsgKey, setNewMsgKey] = useState('');
  const [newMsgEn, setNewMsgEn] = useState('');
  const [newMsgFa, setNewMsgFa] = useState('');
  
  const [editingTranslation, setEditingTranslation] = useState<string | null>(null);
  const [editEnVal, setEditEnVal] = useState('');
  const [editFaVal, setEditFaVal] = useState('');

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

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => showToast("Failed to fetch users", "error"));
  };

  const fetchTranslations = () => {
    fetch('/api/translations')
      .then(r => r.json())
      .then(data => {
        if (data.languages) setLanguages(data.languages);
        if (data.translations) setTranslations(data.translations);
      })
      .catch(() => showToast("Failed to fetch translations", "error"));
  };

  useEffect(() => {
    if (!initData || !isAdmin) return;
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'messages') fetchTranslations();
    if (activeTab === 'users') fetchUsers();
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
        showToast(t('toast_category_added', 'Category added successfully!'), "success");
        setNewCatName('');
        setShowCatModal(false);
        fetchCatalog();
      } else {
        showToast("Failed to add category", "error");
      }
    } catch {
      showToast("Error adding category", "error");
    }
  };

  const openEditProduct = (p: any) => {
    setEditProdId(p.id);
    setNewProdName(p.name);
    setNewProdPrice(p.base_price.toString());
    setNewProdCurrency(p.currency);
    setNewProdDuration(p.duration_days.toString());
    setNewProdStock(p.stock.toString());
    setNewProdCat(p.category_id ? p.category_id.toString() : '');
    setNewProdDesc(p.description || '');
    setShowProdModal(true);
  };

  const openAddProduct = () => {
    setEditProdId(null);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCurrency('USD');
    setNewProdDuration('0');
    setNewProdStock('-1');
    setNewProdCat('');
    setNewProdDesc('');
    setShowProdModal(true);
  };

  const saveProduct = async () => {
    if (!newProdName || !newProdPrice) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ 
          id: editProdId,
          name: newProdName, 
          base_price: parseInt(newProdPrice), 
          currency: newProdCurrency,
          duration_days: parseInt(newProdDuration) || 0,
          stock: parseInt(newProdStock),
          description: newProdDesc,
          category_id: newProdCat ? parseInt(newProdCat) : null,
          is_selling: true,
          is_hidden: false
        })
      });
      if (res.ok) {
        showToast(t('toast_product_added', 'Product saved successfully!'), "success");
        setShowProdModal(false);
        fetchCatalog();
      } else {
        showToast("Failed to save product", "error");
      }
    } catch {
      showToast("Error saving product", "error");
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
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(action === 'approve' ? t('toast_payment_approved', 'Payment approved successfully!') : t('toast_payment_rejected', 'Payment rejected successfully!'), "success");
        fetchPayments();
      } else {
        showToast(`Failed: ${data.error || 'Unknown error'}`, "error");
      }
    } catch {
      showToast("Error processing payment", "error");
    }
  };

  // --- Manage Codes ---
  const fetchCodes = async (productId: number) => {
    const res = await fetch(`/api/admin/products/${productId}/codes`, {
      headers: { 'x-telegram-init-data': initData }
    });
    const data = await res.json();
    if (data.codes) setProductCodes(data.codes);
  };

  const openManageCodes = (productId: number) => {
    setManageCodesProductId(productId);
    fetchCodes(productId);
  };

  const addCode = async () => {
    if (!newCode || manageCodesProductId === null) return;
    const res = await fetch(`/api/admin/products/${manageCodesProductId}/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ code: newCode })
    });
    if (res.ok) {
      setNewCode('');
      fetchCodes(manageCodesProductId);
      fetchCatalog(); // Refresh stock
      showToast("Code added", "success");
    }
  };

  const deleteCode = async (codeId: number) => {
    if (manageCodesProductId === null) return;
    const res = await fetch(`/api/admin/products/${manageCodesProductId}/codes/${codeId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) {
      fetchCodes(manageCodesProductId);
      fetchCatalog(); // Refresh stock
      showToast("Code deleted", "success");
    }
  };

  // --- Manage Messages ---
  const saveTranslation = async (lang_code: string, key: string, value: string) => {
    const res = await fetch('/api/admin/translations', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
       body: JSON.stringify({ lang_code, message_key: key, message_value: value })
    });
    if (res.ok) {
       showToast("Saved!", "success");
       fetchTranslations();
       loadTranslations(); // reload in app
    }
  };

  const addNewTranslation = async () => {
    if (!newMsgKey) return;
    if (newMsgEn) await saveTranslation('en', newMsgKey, newMsgEn);
    if (newMsgFa) await saveTranslation('fa', newMsgKey, newMsgFa);
    setNewMsgKey(''); setNewMsgEn(''); setNewMsgFa('');
  };

  const toggleLanguage = async (code: string, is_active: boolean) => {
    await fetch('/api/admin/languages', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
       body: JSON.stringify({ code, is_active })
    });
    fetchTranslations();
  };

  const changeUserRole = async (userId: number, roleId: number) => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ role_id: roleId })
    });
    if (res.ok) {
      showToast("Role updated", "success");
      fetchUsers();
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to update role", "error");
    }
  };

  const fetchUserLogs = async (userId: number) => {
    setViewLogsUserId(userId);
    const res = await fetch(`/api/admin/users/${userId}/logs`, { headers: { 'x-telegram-init-data': initData }});
    const data = await res.json();
    if (data.logs) setUserLogs(data.logs);
  };

  if (!isAdmin) {
    return <div><h1 style={{color: 'red'}}>Access Denied</h1></div>;
  }

  // Helper function for styling tabs
  const tabStyle = (tabId: string) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    background: activeTab === tabId ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
    color: activeTab === tabId ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap' as const,
    fontSize: '14px',
    fontWeight: 'bold'
  });

  return (
    <div style={{ position: 'relative', paddingBottom: 60 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#4CAF50' : '#f44336',
          color: 'white', padding: '10px 20px', borderRadius: 8, zIndex: 3000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)', fontWeight: 'bold'
        }}>
          {toast.msg}
        </div>
      )}

      <h1>{t('admin')}</h1>
      
      {/* Scrollable / Wrap Tab Navigation */}
      <div style={{ 
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap'
      }}>
        <button style={tabStyle('catalog')} onClick={() => setActiveTab('catalog')}>Catalog</button>
        <button style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>Settings</button>
        <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>Payments</button>
        <button style={tabStyle('messages')} onClick={() => setActiveTab('messages')}>Messages</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      {activeTab === 'catalog' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={() => setShowCatModal(true)} style={{ flex: 1, padding: 10 }}>+ {t('add_category')}</button>
            <button onClick={openAddProduct} style={{ flex: 1, padding: 10 }}>+ {t('add_product')}</button>
          </div>

          <div className="mt-4">
            <h3>Products</h3>
            {products.length === 0 && <p style={{opacity: 0.6}}>No products available.</p>}
            {products.map(p => (
              <div key={p.id} className="card flex items-center justify-between mt-2" style={{ padding: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{p.name}</h4>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{p.base_price.toLocaleString()} {p.currency}</p>
                  <p style={{ fontSize: 12, opacity: 0.7, margin: '5px 0' }}>Stock: {p.stock === -1 ? 'Unlimited' : p.stock} | Days: {p.duration_days}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={() => openEditProduct(p)} style={{ padding: '6px 12px', fontSize: 12, background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}>Edit</button>
                    <button onClick={() => openManageCodes(p.id)} style={{ padding: '6px 12px', fontSize: 12 }}>Manage Codes</button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2" style={{ marginLeft: 10 }}>
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

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3>{t('add_category')}</h3>
              <button onClick={() => setShowCatModal(false)} className="close-btn">X</button>
            </div>
            <input placeholder={t('name')} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
            <button style={{ width: '100%' }} onClick={addCategory}>{t('save')}</button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProdModal && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3>{editProdId ? 'Edit Product' : t('add_product')}</h3>
              <button onClick={() => setShowProdModal(false)} className="close-btn">X</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder={t('name')} value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
              <input placeholder={t('description')} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" placeholder={t('base_price')} value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} style={{ flex: 1 }} />
                <input placeholder="Currency (USD)" value={newProdCurrency} onChange={(e) => setNewProdCurrency(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="number" placeholder={t('placeholder_duration', 'Duration (Days, 0=Lifetime)')} value={newProdDuration} onChange={(e) => setNewProdDuration(e.target.value)} style={{ flex: 1 }} />
                <input type="number" placeholder={t('placeholder_stock', 'Stock (-1=Unlimited)')} value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} style={{ flex: 1 }} />
              </div>
              <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} style={{ padding: 8, width: '100%', borderRadius: 8, border: '1px solid var(--tg-theme-hint-color)', background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}>
                <option value="">No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button style={{ marginTop: 10 }} onClick={saveProduct}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {manageCodesProductId !== null && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-2">
              <h3>Manage Redeem Codes</h3>
              <button onClick={() => setManageCodesProductId(null)} className="close-btn">X</button>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 10 }}>
              <input style={{flex: 1}} placeholder="Enter code" value={newCode} onChange={e => setNewCode(e.target.value)} />
              <button onClick={addCode}>Add</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {productCodes.length === 0 && <p style={{opacity: 0.6}}>No codes added yet.</p>}
              {productCodes.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--tg-theme-secondary-bg-color)' }}>
                  <div>
                    <strong style={{ fontFamily: 'monospace', fontSize: 16 }}>{c.code}</strong>
                    <span style={{ fontSize: 12, marginLeft: 10, color: c.is_sold ? '#f44336' : '#4CAF50', fontWeight: 'bold' }}>
                      {c.is_sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                  {!c.is_sold && (
                    <button onClick={() => deleteCode(c.id)} style={{ background: '#f44336', padding: '4px 10px', fontSize: 12, borderRadius: 15 }}>Delete</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card mt-4">
          <h3>Payment Settings</h3>
          <p style={{fontSize: 12, opacity: 0.7, marginBottom: 15}}>This information is shown to users for manual card transfers.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Card Holder Name" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
            <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
            <button className="mt-2" onClick={saveSettings}>{t('save')}</button>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="mt-4">
          <div className="card">
             <h3>Active Languages</h3>
             {languages.map(l => (
               <div key={l.code} className="flex justify-between items-center py-2">
                 <span style={{ fontWeight: 'bold' }}>{l.code.toUpperCase()}</span>
                 <label className="switch">
                    <input type="checkbox" checked={l.is_active === 1} onChange={() => toggleLanguage(l.code, l.is_active === 1 ? false : true)} />
                    <span className="slider"></span>
                 </label>
               </div>
             ))}
          </div>

          <div className="card mt-4">
            <h3>Add/Edit Message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <input placeholder="Message Key (e.g. welcome_text)" value={newMsgKey} onChange={e => setNewMsgKey(e.target.value)} />
              <input placeholder="English Translation" value={newMsgEn} onChange={e => setNewMsgEn(e.target.value)} />
              <input placeholder="Farsi Translation" value={newMsgFa} onChange={e => setNewMsgFa(e.target.value)} />
              <button className="mt-2" onClick={addNewTranslation}>Save Translation</button>
            </div>
          </div>

          <div className="card mt-4" style={{ overflowX: 'auto' }}>
            <h3>Existing Messages</h3>
            <table style={{ width: '100%', textAlign: 'left', marginTop: 10, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--tg-theme-secondary-bg-color)' }}>
                  <th style={{ padding: '8px 4px' }}>Key</th>
                  <th style={{ padding: '8px 4px' }}>EN</th>
                  <th style={{ padding: '8px 4px' }}>FA</th>
                  <th style={{ padding: '8px 4px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(translations.en || {}).map(key => {
                   const isEditing = editingTranslation === key;
                   return (
                     <tr key={key} style={{ borderBottom: '1px solid var(--tg-theme-secondary-bg-color)' }}>
                       <td style={{ padding: '8px 4px', fontSize: 12, fontFamily: 'monospace' }}>{key}</td>
                       <td style={{ padding: '8px 4px', fontSize: 14 }}>
                         {isEditing ? <input value={editEnVal} onChange={e => setEditEnVal(e.target.value)} style={{width: '100%', padding: 4, boxSizing: 'border-box'}} /> : (translations.en?.[key] || '-')}
                       </td>
                       <td style={{ padding: '8px 4px', fontSize: 14 }}>
                         {isEditing ? <input value={editFaVal} onChange={e => setEditFaVal(e.target.value)} style={{width: '100%', padding: 4, boxSizing: 'border-box'}} /> : (translations.fa?.[key] || '-')}
                       </td>
                       <td style={{ padding: '8px 4px' }}>
                         {isEditing ? (
                           <button onClick={async () => {
                             await saveTranslation('en', key, editEnVal);
                             await saveTranslation('fa', key, editFaVal);
                             setEditingTranslation(null);
                           }} style={{ padding: '4px 8px', fontSize: 12 }}>Save</button>
                         ) : (
                           <button onClick={() => {
                             setEditingTranslation(key);
                             setEditEnVal(translations.en?.[key] || '');
                             setEditFaVal(translations.fa?.[key] || '');
                           }} style={{ padding: '4px 8px', fontSize: 12, background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}>Edit</button>
                         )}
                       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="mt-4">
          <h3>Pending Receipts</h3>
          {payments.length === 0 && <p style={{opacity: 0.6}}>No pending payments.</p>}
          {payments.map(p => {
            let receiptKey = '';
            try {
              receiptKey = JSON.parse(p.payment_data).receipt_key;
            } catch {}

            return (
              <div key={p.id} className="card mt-2">
                <h4>Invoice #{p.invoice_id}</h4>
                <p>User: {p.first_name} (@{p.username})</p>
                <p>Amount: <strong>{p.total_price.toLocaleString()} {p.currency}</strong></p>
                {receiptKey && (
                  <div style={{ marginTop: 15, marginBottom: 15, textAlign: 'center', background: 'var(--tg-theme-secondary-bg-color)', padding: 10, borderRadius: 8 }}>
                    <img 
                      src={`/api/receipt-image/${receiptKey.split('/').pop()}`} 
                      alt="Receipt" 
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'contain' }} 
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ backgroundColor: '#4CAF50', flex: 1 }} onClick={() => handlePayment(p.id, 'approve')}>Approve</button>
                  <button style={{ backgroundColor: '#f44336', flex: 1 }} onClick={() => handlePayment(p.id, 'reject')}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-4">
          <h3>Users Management</h3>
          <div className="card mt-4" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', marginTop: 10, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--tg-theme-secondary-bg-color)' }}>
                  <th style={{ padding: '8px 4px' }}>ID</th>
                  <th style={{ padding: '8px 4px' }}>User</th>
                  <th style={{ padding: '8px 4px' }}>Role</th>
                  <th style={{ padding: '8px 4px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.telegram_id} style={{ borderBottom: '1px solid var(--tg-theme-secondary-bg-color)' }}>
                    <td style={{ padding: '8px 4px', fontSize: 12 }}>{u.telegram_id}</td>
                    <td style={{ padding: '8px 4px', fontSize: 14 }}>{u.first_name} (@{u.username || '?'})</td>
                    <td style={{ padding: '8px 4px' }}>
                      <select 
                        value={u.role_id} 
                        onChange={(e) => changeUserRole(u.telegram_id, parseInt(e.target.value))}
                        disabled={userProfile?.role !== 'SUPER_ADMIN'}
                        style={{ padding: 4, borderRadius: 4, border: '1px solid var(--tg-theme-hint-color)', background: 'var(--tg-theme-bg-color)', color: 'var(--tg-theme-text-color)' }}
                      >
                        <option value={1}>USER</option>
                        <option value={2}>ADMIN</option>
                        <option value={3}>SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <button onClick={() => fetchUserLogs(u.telegram_id)} style={{ padding: '4px 8px', fontSize: 12 }}>View Logs</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewLogsUserId !== null && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-2">
              <h3>User Logs ({viewLogsUserId})</h3>
              <button onClick={() => setViewLogsUserId(null)} className="close-btn">X</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, marginTop: 10 }}>
              {userLogs.length === 0 && <p style={{opacity: 0.6}}>No logs found.</p>}
              {userLogs.map(l => (
                <div key={l.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--tg-theme-secondary-bg-color)' }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(l.created_at).toLocaleString()}</div>
                  <div style={{ fontWeight: 'bold' }}>{l.action}</div>
                  {l.metadata && <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 4 }}>{l.metadata}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
