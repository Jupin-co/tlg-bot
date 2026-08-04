import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslations } from '../i18n';
import { Settings, ShoppingBag, CreditCard, MessageSquare, Users, Plus, Edit, X, Eye, Key } from 'lucide-react';

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


  return (
    <div className="container dir-auto relative">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-bold shadow-lg z-50 text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`} style={{ zIndex: 3000 }}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-xl font-bold mb-4">{t('admin')}</h1>
      
      {/* Scrollable / Wrap Tab Navigation */}
      <div className="flex bg-[var(--secondary-bg-color)] p-1 rounded-xl mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'catalog' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('catalog')}
        >
          <div className="flex items-center justify-center gap-2"><ShoppingBag size={16} />Catalog</div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="flex items-center justify-center gap-2"><Settings size={16} />Settings</div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'payments' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('payments')}
        >
          <div className="flex items-center justify-center gap-2"><CreditCard size={16} />Payments</div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'messages' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('messages')}
        >
          <div className="flex items-center justify-center gap-2"><MessageSquare size={16} />Messages</div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'users' ? 'bg-[var(--bg-color)] shadow-sm text-text-color' : 'bg-transparent text-hint border-transparent'}`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center justify-center gap-2"><Users size={16} />Users</div>
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2" onClick={() => setShowCatModal(true)}>
              <Plus size={16} /> {t('add_category')}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2" onClick={openAddProduct}>
              <Plus size={16} /> {t('add_product')}
            </button>
          </div>

          <div>
            <h3 className="font-bold mb-3">Products</h3>
            {products.length === 0 && <p className="text-hint">No products available.</p>}
            <div className="flex flex-col gap-3">
              {products.map(p => (
                <div key={p.id} className="card flex items-center justify-between" style={{ marginBottom: 0 }}>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg m-0">{p.name}</h4>
                    <p className="font-bold text-[var(--link-color)] mt-1 num-fix">{p.base_price.toLocaleString()} {p.currency}</p>
                    <p className="text-xs text-hint mt-1 num-fix">Stock: {p.stock === -1 ? 'Unlimited' : p.stock} | Days: {p.duration_days}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEditProduct(p)} className="secondary flex items-center gap-1 text-xs py-1 px-2 rounded-lg">
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => openManageCodes(p.id)} className="secondary flex items-center gap-1 text-xs py-1 px-2 rounded-lg">
                        <Key size={12} /> Codes
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 ml-3">
                    <span className="text-xs text-hint">{t('visible')}</span>
                    <label className="switch">
                      <input type="checkbox" checked={!p.is_hidden} onChange={() => toggleVisibility(p)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay">
          <div className="card modal-content w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold m-0">{t('add_category')}</h3>
              <button onClick={() => setShowCatModal(false)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <input className="w-full mb-4" placeholder={t('name')} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <button className="w-full" onClick={addCategory}>{t('save')}</button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProdModal && (
        <div className="modal-overlay">
          <div className="card modal-content w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold m-0">{editProdId ? 'Edit Product' : t('add_product')}</h3>
              <button onClick={() => setShowProdModal(false)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder={t('name')} value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
              <input placeholder={t('description')} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} />
              <div className="flex gap-3">
                <input type="number" placeholder={t('base_price')} value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="flex-1" />
                <input placeholder="Currency (USD)" value={newProdCurrency} onChange={(e) => setNewProdCurrency(e.target.value)} className="flex-1" />
              </div>
              <div className="flex gap-3">
                <input type="number" placeholder={t('placeholder_duration', 'Duration (Days, 0=Lifetime)')} value={newProdDuration} onChange={(e) => setNewProdDuration(e.target.value)} className="flex-1" />
                <input type="number" placeholder={t('placeholder_stock', 'Stock (-1=Unlimited)')} value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="flex-1" />
              </div>
              <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)]">
                <option value="">No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button className="mt-2" onClick={saveProduct}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {manageCodesProductId !== null && (
        <div className="modal-overlay">
          <div className="card modal-content w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold m-0">Manage Codes</h3>
              <button onClick={() => setManageCodesProductId(null)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            
            <div className="flex gap-2 my-3">
              <input className="flex-1" placeholder="Enter code" value={newCode} onChange={e => setNewCode(e.target.value)} />
              <button onClick={addCode}>Add</button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2">
              {productCodes.length === 0 && <p className="text-hint">No codes added yet.</p>}
              <div className="flex flex-col gap-2">
                {productCodes.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-[var(--secondary-bg-color)] rounded-lg">
                    <div>
                      <strong className="font-mono text-base tracking-wider num-fix">{c.code}</strong>
                      <span className={`text-xs ml-3 font-bold ${c.is_sold ? 'text-danger' : 'text-success'}`}>
                        {c.is_sold ? 'Sold' : 'Available'}
                      </span>
                    </div>
                    {!c.is_sold && (
                      <button onClick={() => deleteCode(c.id)} className="danger py-1 px-3 text-xs rounded-full">Delete</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card mt-4">
          <h3 className="font-bold mb-2">Payment Settings</h3>
          <p className="text-xs text-hint mb-4">This information is shown to users for manual card transfers.</p>
          <div className="flex flex-col gap-3">
            <input placeholder="Card Holder Name" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
            <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="num-fix tracking-widest" />
            <button className="mt-2" onClick={saveSettings}>{t('save')}</button>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="card">
             <h3 className="font-bold mb-3">Active Languages</h3>
             <div className="flex flex-col gap-2">
               {languages.map(l => (
                 <div key={l.code} className="flex justify-between items-center py-2 border-b border-[var(--border-color)] last:border-0">
                   <span className="font-bold uppercase">{l.code}</span>
                   <label className="switch">
                      <input type="checkbox" checked={l.is_active === 1} onChange={() => toggleLanguage(l.code, l.is_active === 1 ? false : true)} />
                      <span className="slider"></span>
                   </label>
                 </div>
               ))}
             </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-3">Add/Edit Message</h3>
            <div className="flex flex-col gap-3">
              <input placeholder="Message Key (e.g. welcome_text)" value={newMsgKey} onChange={e => setNewMsgKey(e.target.value)} />
              <input placeholder="English Translation" value={newMsgEn} onChange={e => setNewMsgEn(e.target.value)} />
              <input placeholder="Farsi Translation" value={newMsgFa} onChange={e => setNewMsgFa(e.target.value)} />
              <button className="mt-1" onClick={addNewTranslation}>Save Translation</button>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h3 className="font-bold mb-3">Existing Messages</h3>
            <table className="w-full text-left border-collapse" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="border-b-2 border-[var(--border-color)]">
                  <th className="p-2 text-hint font-medium">Key</th>
                  <th className="p-2 text-hint font-medium">EN</th>
                  <th className="p-2 text-hint font-medium">FA</th>
                  <th className="p-2 text-hint font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(translations.en || {}).map(key => {
                   const isEditing = editingTranslation === key;
                   return (
                     <tr key={key} className="border-b border-[var(--border-color)] last:border-0">
                       <td className="p-2 text-xs font-mono">{key}</td>
                       <td className="p-2 text-sm">
                         {isEditing ? <input value={editEnVal} onChange={e => setEditEnVal(e.target.value)} className="w-full p-1" /> : (translations.en?.[key] || '-')}
                       </td>
                       <td className="p-2 text-sm">
                         {isEditing ? <input value={editFaVal} onChange={e => setEditFaVal(e.target.value)} className="w-full p-1" /> : (translations.fa?.[key] || '-')}
                       </td>
                       <td className="p-2 text-right">
                         {isEditing ? (
                           <button onClick={async () => {
                             await saveTranslation('en', key, editEnVal);
                             await saveTranslation('fa', key, editFaVal);
                             setEditingTranslation(null);
                           }} className="py-1 px-3 text-xs rounded-lg">Save</button>
                         ) : (
                           <button onClick={() => {
                             setEditingTranslation(key);
                             setEditEnVal(translations.en?.[key] || '');
                             setEditFaVal(translations.fa?.[key] || '');
                           }} className="secondary py-1 px-3 text-xs rounded-lg">Edit</button>
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
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="font-bold m-0">Pending Receipts</h3>
          {payments.length === 0 && <p className="text-hint">No pending payments.</p>}
          {payments.map(p => {
            let receiptKey = '';
            try {
              receiptKey = JSON.parse(p.payment_data).receipt_key;
            } catch {}

            return (
              <div key={p.id} className="card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--hint-color)]"></div>
                <h4 className="font-bold m-0">Invoice <span className="num-fix text-sm">#{p.invoice_id}</span></h4>
                <p className="text-sm text-hint mt-1">User: {p.first_name} (@{p.username})</p>
                <div className="flex justify-between items-center my-3 border-y border-[var(--border-color)] py-2">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="font-bold text-lg num-fix">{p.total_price.toLocaleString()} {p.currency}</span>
                </div>
                {receiptKey && (
                  <div className="bg-[var(--secondary-bg-color)] p-2 rounded-xl text-center mb-4">
                    <img 
                      src={`/api/receipt-image/${receiptKey.split('/').pop()}`} 
                      alt="Receipt" 
                      className="max-w-full max-h-[300px] object-contain rounded-lg mx-auto"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button className="flex-1 bg-[rgba(52,199,89,0.1)] text-success border border-transparent font-bold" onClick={() => handlePayment(p.id, 'approve')}>Approve</button>
                  <button className="flex-1 bg-[rgba(255,59,48,0.1)] text-danger border border-transparent font-bold" onClick={() => handlePayment(p.id, 'reject')}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-4">
          <h3 className="font-bold mb-3">Users Management</h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="border-b-2 border-[var(--border-color)]">
                  <th className="p-2 text-hint font-medium">ID</th>
                  <th className="p-2 text-hint font-medium">User</th>
                  <th className="p-2 text-hint font-medium">Role</th>
                  <th className="p-2 text-hint font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.telegram_id} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="p-2 text-xs font-mono num-fix">{u.telegram_id}</td>
                    <td className="p-2 text-sm">
                      <div className="font-bold">{u.first_name}</div>
                      <div className="text-xs text-hint">@{u.username || '?'}</div>
                    </td>
                    <td className="p-2">
                      <select 
                        value={u.role_id} 
                        onChange={(e) => changeUserRole(u.telegram_id, parseInt(e.target.value))}
                        disabled={userProfile?.role !== 'SUPER_ADMIN'}
                        className="p-1 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)]"
                      >
                        <option value={1}>USER</option>
                        <option value={2}>ADMIN</option>
                        <option value={3}>SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => fetchUserLogs(u.telegram_id)} className="secondary py-1 px-3 text-xs rounded-lg flex items-center gap-1 inline-flex">
                        <Eye size={12} /> Logs
                      </button>
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
          <div className="card modal-content w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold m-0">User Logs <span className="text-sm font-normal text-hint">({viewLogsUserId})</span></h3>
              <button onClick={() => setViewLogsUserId(null)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 pr-2">
              {userLogs.length === 0 && <p className="text-hint">No logs found.</p>}
              <div className="flex flex-col gap-2">
                {userLogs.map(l => (
                  <div key={l.id} className="p-3 bg-[var(--secondary-bg-color)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm">{l.action}</div>
                      <div className="text-xs text-hint num-fix">{new Date(l.created_at).toLocaleString()}</div>
                    </div>
                    {l.metadata && <div className="text-xs font-mono text-[var(--text-color)] opacity-80 break-all p-2 bg-[rgba(0,0,0,0.1)] rounded mt-2">{l.metadata}</div>}
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

