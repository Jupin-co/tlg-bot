import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../i18n';
import { loadTranslations } from '../i18n';
import { Settings, ShoppingBag, CreditCard, MessageSquare, Users, Plus, Edit, X, Eye, Key, Save, ArrowLeft, Menu, Clock, User, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function Admin({ initData, userProfile }: { initData: string, userProfile: any }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'settings' | 'payments' | 'invoices' | 'messages' | 'users' | 'verifications' | 'wallet-codes' | 'roles'>('catalog');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // User Logs State
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [viewLogsUserId, setViewLogsUserId] = useState<number | null>(null);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  
  
  // Wallet Codes States
  const [walletCodes, setWalletCodes] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newWalletCode, setNewWalletCode] = useState('');
  const [newWalletCodeAmount, setNewWalletCodeAmount] = useState('');
  const [newWalletCodeExpires, setNewWalletCodeExpires] = useState('');
  const [newWalletCodeType, setNewWalletCodeType] = useState('UNIQUE'); // UNIQUE or MULTI
  const [viewingWalletCodeUses, setViewingWalletCodeUses] = useState<any[] | null>(null);
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
  const [newProdImage, setNewProdImage] = useState('');
  
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
  const isSuperAdmin = userProfile?.role === 'SUPER_ADMIN';

  const allTabs = [
    { id: 'catalog', icon: <ShoppingBag size={18} />, label: t('tab_catalog', 'Catalog') as string },
    { id: 'payments', icon: <CreditCard size={18} />, label: t('tab_payments', 'Payments') as string },
    { id: 'invoices', icon: <CreditCard size={18} />, label: t('tab_invoices', 'Invoices') as string },
    { id: 'settings', icon: <Settings size={18} />, label: t('tab_settings', 'Settings') as string },
    { id: 'users', icon: <Users size={18} />, label: t('tab_users', 'Users') as string },
    { id: 'messages', icon: <MessageSquare size={18} />, label: t('tab_messages', 'Messages') as string },
    { id: 'wallet-codes', icon: <CreditCard size={18} />, label: t('tab_wallet_codes', 'Wallet Codes') as string },
    { id: 'roles', icon: <Key size={18} />, label: t('tab_roles', 'Roles') as string }
  ];

  const adminTabs = isSuperAdmin ? allTabs : allTabs.filter(tab => userProfile?.permissions?.includes(tab.id));

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
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
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
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  const handleToggleWalletCode = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/wallet-codes/${id}/toggle`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      if (res.ok) {
        fetchWalletCodes();
        showToast(t("toast_success", "Success"), "success");
      } else {
        showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
      }
    } catch (e) {
      showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
    }
  };
  const fetchRoles = () => {
    fetch('/api/admin/roles', { headers: { 'x-telegram-init-data': initData } })
      .then(res => res.json())
      .then(data => {
        if (data.roles) setRoles(data.roles);
      })
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return;
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ name: newRoleName.toUpperCase(), permissions: [] })
      });
      if (res.ok) {
        showToast(t("toast_success", "Success"), "success");
        setNewRoleName('');
        fetchRoles();
      } else showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
    } catch { showToast(t("toast_fetch_failed", "Failed to perform action"), "error"); }
  };

  const handleToggleRolePermission = async (roleId: number, permission: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const currentPerms = role.permissions || [];
    const newPerms = currentPerms.includes(permission) ? currentPerms.filter((p: string) => p !== permission) : [...currentPerms, permission];
    
    setRoles(roles.map(r => r.id === roleId ? { ...r, permissions: newPerms } : r));
    
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ permissions: newPerms })
      });
      if (!res.ok) {
        showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
        fetchRoles(); // rollback
      }
    } catch {
      showToast(t("toast_fetch_failed", "Failed to perform action"), "error");
      fetchRoles(); // rollback
    }
  };

  const fetchWalletCodes = () => {
    fetch('/api/admin/wallet-codes', { headers: { 'x-telegram-init-data': initData } })
      .then(res => res.json())
      .then(data => {
        if (data.codes) setWalletCodes(data.codes);
      });
  };
  const fetchInvoices = () => {
    fetch('/api/admin/invoices', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.invoices) setInvoices(data.invoices);
      })
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  const fetchPayments = () => {
    fetch('/api/admin/payments', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  const fetchTranslations = () => {
    fetch('/api/translations')
      .then(r => r.json())
      .then(data => {
        if (data.languages) setLanguages(data.languages);
        if (data.translations) setTranslations(data.translations);
      })
      .catch(() => showToast(t("toast_fetch_failed", "Failed to fetch data"), "error"));
  };

  useEffect(() => {
    if (!initData || !isAdmin) return;
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'invoices') fetchInvoices();
    if (activeTab === 'messages') fetchTranslations();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'wallet-codes') fetchWalletCodes();
    if (activeTab === 'roles') fetchRoles();
    if (activeTab === 'users') fetchRoles();
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
    setNewProdImage(p.image_url || '');
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
    setNewProdImage('');
    setShowProdModal(true);
  };

  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewProdImage(data.url);
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
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
          is_hidden: false,
          image_url: newProdImage
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
      if (res.ok) showToast(t("toast_save_success", "Saved successfully"), "success");
      else showToast(t("toast_save_failed", "Failed to save"), "error");
    } catch {
      showToast(t("toast_save_failed", "Failed to save"), "error");
    }
  };

  
  const [verifications, setVerifications] = useState<any[]>([]);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verifications', { headers: { 'x-telegram-init-data': initData } });
      const data = await res.json();
      if (data.verifications) setVerifications(data.verifications);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerification = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/verifications/${id}/${action}`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      if (res.ok) {
        showToast(action === 'approve' ? 'Approved' : 'Rejected', 'success');
        fetchVerifications();
      } else {
        showToast('Failed to process verification', 'error');
      }
    } catch {
      showToast('Error processing verification', 'error');
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

      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-xl font-bold m-0">{t('admin')}</h1>
        <div className="flex items-center gap-2">
          {/* Sleek Hamburger Menu */}
          <div className="relative">
            <button 
              className="p-2 rounded-full flex items-center justify-center bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Drawer Navigation */}
      {isMenuOpen && (
        <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className={`drawer-content ${document.body.dir === 'rtl' ? 'rtl' : 'ltr'}`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="m-0">{t('admin')}</h2>
              <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body">
              {adminTabs.map(tab => (
                <div 
                  key={tab.id}
                  className={`drawer-item cursor-pointer flex items-center gap-3 w-full p-4 rounded-[var(--radius-md)] transition-all ${activeTab === tab.id ? 'active bg-[var(--link-color)] text-white font-bold shadow-sm' : 'hover:bg-[var(--secondary-bg-color)]'}`}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className={`${activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-70'} transition-transform`}>{tab.icon}</span>
                  <span className="text-base">{tab.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            <h3 className="font-bold mb-3">{t('catalog')}</h3>
            {products.length === 0 && <p className="text-hint">{t('no_products')}</p>}
            <div className="flex flex-col gap-3">
              {products.map(p => (
                <div key={p.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ marginBottom: 0 }}>
                  <div className="flex-1 flex gap-3">
                    {p.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)] hidden sm:block">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg m-0">{p.name}</h4>
                      <p className="font-bold text-[var(--link-color)] mt-1">{formatNumber(p.base_price)} {p.currency}</p>
                      <p className="text-xs text-hint mt-1 num-fix">{t('lbl_stock', 'Stock')}: {p.stock === -1 ? t('lbl_unlimited', 'Unlimited') as string : formatNumber(p.stock)} | {t('lbl_days', 'Days') as string}: {formatNumber(p.duration_days)}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => openEditProduct(p)} className="secondary flex items-center gap-1 text-xs py-1 px-2 rounded-lg">
                          <Edit size={12} /> {t("btn_edit", "Edit")}
                        </button>
                        <button onClick={() => openManageCodes(p.id)} className="secondary flex items-center gap-1 text-xs py-1 px-2 rounded-lg">
                          <Key size={12} /> {t("btn_codes", "Codes")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
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
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="card w-full max-w-sm" style={{ maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
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
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="card modal-content w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold m-0">{editProdId ? t("title_edit_product", "Edit Product") : t("add_product")}</h3>
              <button onClick={() => setShowProdModal(false)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder={t('name')} value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
              <input placeholder={t('description')} value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} />
              
              <div className="flex flex-col gap-2 p-3 bg-[var(--secondary-bg-color)] rounded-lg border border-[var(--border-color)]">
                <span className="text-sm font-bold">{t('lbl_product_image', 'Product Image')}</span>
                {newProdImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2 border border-[var(--border-color)]">
                    <img src={newProdImage} alt="Product Preview" className="w-full h-full object-cover" />
                    <button 
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
                      onClick={() => setNewProdImage('')}
                    ><X size={14} /></button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-sm flex-1" />
                  {isUploading && <span className="text-xs text-hint">Uploading...</span>}
                </div>
              </div>
              <div className="flex gap-3">
                <input type="number" placeholder={t('base_price')} value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="flex-1" />
                <input placeholder="Currency (USD)" value={newProdCurrency} onChange={(e) => setNewProdCurrency(e.target.value)} className="flex-1" />
              </div>
              <div className="flex gap-3 items-center">
                <input type="number" placeholder={t('placeholder_duration', 'Duration (Days, 0=Lifetime)')} value={newProdDuration} onChange={(e) => setNewProdDuration(e.target.value)} className="flex-1" />
                {parseInt(newProdDuration || '0') > 0 ? (
                  <div className="flex-1 text-xs text-hint bg-[var(--secondary-bg-color)] p-2 rounded-lg border border-[var(--border-color)]">
                    {t("msg_stock_auto", "Stock is automatically managed by added Codes.")}
                  </div>
                ) : (
                  <input type="number" placeholder={t('placeholder_stock', 'Stock (-1=Unlimited)')} value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="flex-1" />
                )}
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
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="card modal-content w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold m-0">{t("title_manage_codes", "Manage Codes")}</h3>
              <button onClick={() => setManageCodesProductId(null)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            
            <div className="flex gap-2 my-3">
              <input className="flex-1" placeholder="Enter code" value={newCode} onChange={e => setNewCode(e.target.value)} />
              <button onClick={addCode}>{t("add", "Add")}</button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2">
              {productCodes.length === 0 && <p className="text-hint">No codes added yet.</p>}
              <div className="flex flex-col gap-2">
                {productCodes.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-[var(--secondary-bg-color)] rounded-lg">
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                      <div className="flex items-center gap-3">
                        <strong className="font-mono text-base tracking-wider num-fix truncate">{c.code}</strong>
                        <span className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${c.is_sold ? 'bg-[rgba(255,59,48,0.1)] text-danger' : 'bg-[rgba(52,199,89,0.1)] text-success'}`}>
                          {c.is_sold ? t("lbl_sold", "Sold") : t("lbl_available", "Available")}
                        </span>
                      </div>
                      {c.is_sold && c.buyer_name && (
                        <div className="text-xs text-hint flex gap-2 items-center">
                          <span>{t("lbl_bought_by", "Bought by:")} <strong>{c.buyer_name}</strong></span>
                          <span>•</span>
                          <span>Invoice #{formatNumber(c.invoice_id)}</span>
                        </div>
                      )}
                    </div>
                    {!c.is_sold && (
                      <button onClick={() => deleteCode(c.id)} className="danger py-1 px-3 text-xs rounded-full">{t("btn_delete", "Delete")}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      
      {activeTab === 'wallet-codes' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">{t('tab_wallet_codes', 'Wallet Codes')}</h2>
          
          <div className="card">
            <h3 className="font-bold mb-3">{t('lbl_create_wallet_code', 'Create Wallet Code')}</h3>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder={t('lbl_code_string', 'Code (e.g. SUMMER50)') as string} value={newWalletCode} onChange={e => setNewWalletCode(e.target.value)} />
              <input type="number" placeholder={t('lbl_amount', 'Amount') as string} value={newWalletCodeAmount} onChange={e => setNewWalletCodeAmount(e.target.value)} />
              <input type="date" placeholder={t('lbl_expires_at', 'Expires At (Optional)') as string} value={newWalletCodeExpires} onChange={e => setNewWalletCodeExpires(e.target.value)} />
              <select value={newWalletCodeType} onChange={e => setNewWalletCodeType(e.target.value)} className="p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)]">
                <option value="UNIQUE">{t('lbl_unique_use', 'Unique Use (Single time total)')}</option>
                <option value="MULTI">{t('lbl_multi_use', 'Multi User Use (Once per user)')}</option>
              </select>
              <button onClick={() => {
                fetch('/api/admin/wallet-codes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
                  body: JSON.stringify({ 
                    code: newWalletCode, 
                    amount: parseInt(newWalletCodeAmount),
                    expires_at: newWalletCodeExpires || null,
                    max_total_uses: newWalletCodeType === 'UNIQUE' ? 1 : null
                  })
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setNewWalletCode('');
                    setNewWalletCodeAmount('');
                    setNewWalletCodeExpires('');
                    fetchWalletCodes();
                  } else {
                    setToast({ msg: data.error, type: 'error' });
                  }
                });
              }}>
                {t('btn_create_code', 'Create Code')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {walletCodes.map(code => (
              <div key={code.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[var(--button-color)] m-0">{code.code}</h3>
                    <p className="text-sm font-bold mt-1">Amount: {formatNumber(code.amount)}</p>
                    <p className="text-xs text-hint mt-1">
                      Type: {code.max_total_uses === 1 ? 'Unique Use' : 'Multi Use'}
                    </p>
                    {code.expires_at && <p className="text-xs text-hint mt-1">Expires: {new Date(code.expires_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => {
                      e.preventDefault();
                      handleToggleWalletCode(code.id);
                    }}>
                      <span className="text-xs text-hint">{code.is_active ? 'Active' : 'Disabled'}</span>
                      <div className="relative pointer-events-none">
                        <input type="checkbox" className="sr-only" checked={!!code.is_active} readOnly />
                        <div className={`block w-10 h-6 rounded-full ${code.is_active ? 'bg-[var(--button-color)]' : 'bg-[var(--secondary-bg-color)] border border-[var(--hint-color)]'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${code.is_active ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    <div 
                      className="text-sm font-bold cursor-pointer text-[var(--button-color)] flex items-center gap-1 justify-end"
                      onClick={() => {
                        fetch(`/api/admin/wallet-codes/${code.id}/uses`, { headers: { 'x-telegram-init-data': initData } })
                          .then(res => res.json())
                          .then(data => {
                            if (data.uses) setViewingWalletCodeUses(data.uses);
                          });
                      }}
                    >
                      <Users size={14} /> Uses: {code.use_count}
                    </div>
                    <p className="text-xs text-hint mt-2">{new Date(code.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {activeTab === 'verifications' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-xl">{t('lbl_kyc_verifications', 'KYC Verifications')}</h2>
            <button className="secondary py-1 px-3" onClick={fetchVerifications}><RefreshCw size={16} /></button>
          </div>
          
          {verifications.length === 0 ? (
            <div className="card text-center py-10 text-hint">
              <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p>{t('msg_no_pending_verifications', 'No pending verifications.')}</p>
            </div>
          ) : (
            verifications.map(v => (
              <div key={v.user_id} className="card flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{v.first_name} {v.last_name}</h3>
                    <p className="text-sm text-hint num-fix">@{v.username}</p>
                  </div>
                  <span className="bg-[rgba(255,149,0,0.1)] text-[var(--hint-color)] px-3 py-1 rounded-full font-bold text-xs">
                    PENDING
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2 bg-[var(--secondary-bg-color)] p-3 rounded-lg border border-[var(--border-color)]">
                  <div>
                    <span className="text-xs text-hint block mb-1">National Code</span>
                    <span className="font-medium num-fix">{v.national_code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-hint block mb-1">Date of Birth</span>
                    <span className="font-medium num-fix">{v.date_of_birth}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    className="flex-1 bg-[rgba(52,199,89,0.1)] text-success border border-[rgba(52,199,89,0.2)] hover:bg-[rgba(52,199,89,0.2)] py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    onClick={() => handleVerification(v.user_id, 'approve')}
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button 
                    className="flex-1 bg-[rgba(255,59,48,0.1)] text-danger border border-[rgba(255,59,48,0.2)] hover:bg-[rgba(255,59,48,0.2)] py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    onClick={() => handleVerification(v.user_id, 'reject')}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card mt-4">
          <h3 className="font-bold mb-2">{t("title_payment_settings", "Payment Settings")}</h3>
          <p className="text-xs text-hint mb-4">{t('msg_card_transfer_info', 'This information is shown to users for manual card transfers.')}</p>
          <div className="flex flex-col gap-3">
            <input placeholder="Card Holder Name" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
            <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="num-fix tracking-widest" />
            <button className="mt-2" onClick={saveSettings}>{t('save')}</button>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">{t('tab_invoices', 'Invoices')}</h2>
          {invoices.length === 0 ? (
            <p className="text-hint">No invoices found.</p>
          ) : (
            invoices.map(inv => {
              let receiptKey = null;
              if (inv.payment_data) {
                try {
                  const data = JSON.parse(inv.payment_data);
                  receiptKey = data.receipt_key;
                } catch (e) {}
              }
              
              return (
              <div 
                key={inv.id} 
                className={`card ${receiptKey ? 'cursor-pointer hover:border-[var(--button-color)] transition-colors' : ''}`}
                onClick={() => {
                  if (receiptKey) {
                    const k = receiptKey.startsWith('receipts/') ? receiptKey.replace('receipts/', '') : receiptKey;
                    setFullScreenImg(`/api/receipt-image/${k}`);
                  }
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold m-0 truncate">{t('invoice_hash', 'Invoice #') as string}{inv.id}</h3>
                    <p className="text-sm font-medium mt-1">
                      {inv.first_name} {inv.username ? `(@${inv.username})` : ''}
                    </p>
                    <p className="text-xs text-hint mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(inv.created_at).toLocaleString()}
                    </p>
                    {receiptKey && (
                      <p className="text-xs text-[var(--button-color)] mt-2 flex items-center gap-1">
                        <Eye size={14} /> {t('lbl_view_receipt', 'View Receipt')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                      inv.status === 'APPROVED' ? 'bg-[rgba(52,199,89,0.1)] text-success' :
                      inv.status === 'REJECTED' || inv.status === 'EXPIRED' ? 'bg-[rgba(255,59,48,0.1)] text-danger' :
                      'bg-[rgba(255,149,0,0.1)] text-[var(--hint-color)]'
                    }`}>
                      {t('status_' + inv.status.toLowerCase(), inv.status) as string}
                    </span>
                    <p className="font-bold mt-2">{formatNumber(inv.total_price)} {t(inv.currency.toLowerCase(), inv.currency) as string}</p>
                  </div>
                </div>
                {inv.reviewed_at && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-hint">
                    <div className="flex items-center gap-1">
                      <User size={12} /> 
                      {t('lbl_reviewed_by', 'Reviewed by')}: {inv.reviewer_name || inv.reviewer_username || t('admin', 'Admin')}
                    </div>
                    <div>{new Date(inv.reviewed_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="card">
             <h3 className="font-bold mb-3">{t('title_active_languages', 'Active Languages') as string}</h3>
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
            <h3 className="font-bold mb-3">{t("title_add_edit_message", "Add/Edit Message")}</h3>
            <div className="flex flex-col gap-3">
              <input placeholder="Message Key (e.g. welcome_text)" value={newMsgKey} onChange={e => setNewMsgKey(e.target.value)} />
              <input placeholder="English Translation" value={newMsgEn} onChange={e => setNewMsgEn(e.target.value)} />
              <input placeholder="Farsi Translation" value={newMsgFa} onChange={e => setNewMsgFa(e.target.value)} />
              <button className="mt-1" onClick={addNewTranslation}>{t("btn_save_translation", "Save Translation")}</button>
            </div>
          </div>

          <div className="mt-4">
              <h3 className="font-bold mb-3">{t('title_existing_messages', 'Existing Messages') as string}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {Object.keys(translations.en || {}).map(key => {
                     const isEditing = editingTranslation === key;
                     return (
                       <div key={key} className="card flex flex-col gap-3">
                         <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 mb-2 gap-2">
                           <span className="text-sm font-mono font-bold text-[var(--link-color)] truncate flex-1" title={key} dir="ltr">{key}</span>
                           <div>
                             {isEditing ? (
                               <button onClick={async () => {
                                 await saveTranslation('en', key, editEnVal);
                                 await saveTranslation('fa', key, editFaVal);
                                 setEditingTranslation(null);
                               }} className="secondary text-xs py-1 px-3 rounded-lg flex items-center gap-1"><Save size={14}/> {t('btn_save', 'Save')}</button>
                             ) : (
                               <button onClick={() => {
                                 setEditingTranslation(key);
                                 setEditEnVal(translations.en?.[key] || '');
                                 setEditFaVal(translations.fa?.[key] || '');
                               }} className="secondary text-xs py-1 px-3 rounded-lg flex items-center gap-1"><Edit size={14}/> {t('btn_edit', 'Edit')}</button>
                             )}
                           </div>
                         </div>
                         <div className="flex flex-col gap-1">
                           <span className="text-xs text-hint">{t('lbl_en', 'EN')}</span>
                           {isEditing ? <input value={editEnVal} onChange={e => setEditEnVal(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)]" /> : <span className="text-sm">{translations.en?.[key] || '-'}</span>}
                         </div>
                         <div className="flex flex-col gap-1">
                           <span className="text-xs text-hint">{t('lbl_fa', 'FA')}</span>
                           {isEditing ? <input value={editFaVal} onChange={e => setEditFaVal(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)]" /> : <span className="text-sm" dir="rtl">{translations.fa?.[key] || '-'}</span>}
                         </div>
                       </div>
                     );
                  })}
              </div>
            </div>
          </div>
        )}

      {activeTab === 'payments' && (
        <div className="flex flex-col gap-4 mt-4">
          <h3 className="font-bold m-0">{t("title_pending_receipts", "Pending Receipts")}</h3>
          {payments.length === 0 && <p className="text-hint">{t('msg_no_pending_payments', 'No pending payments.') as string}</p>}
          {payments.map(p => {
            let receiptKey = '';
            try {
              receiptKey = JSON.parse(p.payment_data).receipt_key;
            } catch {}

            return (
              <div key={p.id} className="card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--hint-color)]"></div>
                <h4 className="font-bold m-0">{t('lbl_invoice_id', 'Invoice ID')} <span className="num-fix text-sm">#{formatNumber(p.invoice_id)}</span></h4>
                <p className="text-sm text-hint mt-1">{t('lbl_user', 'User')}: {p.first_name} (@{p.username})</p>
                <div className="flex justify-between items-center my-3 border-y border-[var(--border-color)] py-2">
                  <span className="text-sm font-medium">{t('lbl_amount', 'Amount')}</span>
                  <span className="font-bold text-lg">{formatNumber(p.total_price)} {p.currency}</span>
                </div>
                {receiptKey && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">{t('lbl_receipt', 'Receipt')}</p>
                    <div style={{ width: '25%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                      <img 
                        src={`/api/receipt-image/${receiptKey.split('/').pop()}`} 
                        alt="Receipt Thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setFullScreenImg(`/api/receipt-image/${receiptKey.split('/').pop()}`)}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button className="flex-1 bg-[rgba(52,199,89,0.1)] text-success border border-transparent font-bold" onClick={() => handlePayment(p.id, 'approve')}>{t("btn_approve", "Approve")}</button>
                  <button className="flex-1 bg-[rgba(255,59,48,0.1)] text-danger border border-transparent font-bold" onClick={() => handlePayment(p.id, 'reject')}>{t("btn_reject", "Reject")}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="section-card glass-panel fade-in">
          <h2 className="text-lg font-bold mb-4">{t('tab_roles', 'Roles & Permissions')}</h2>
          
          <div className="card">
            <h3 className="font-bold mb-3">Create New Role</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="input-field flex-1" 
                placeholder="e.g. SUPPORT_ADMIN"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
              />
              <button onClick={handleCreateRole} disabled={!newRoleName}>
                <Plus size={18} /> Create
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {roles.map(role => (
              <div key={role.id} className="card">
                <h3 className="font-bold text-lg mb-4 text-[var(--link-color)]">{t('role_' + role.name.toLowerCase(), role.name) as string}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allTabs.map(tab => (
                    <label 
                      key={tab.id} 
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[var(--secondary-bg-color)] transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        if (role.name !== 'SUPER_ADMIN') {
                          handleToggleRolePermission(role.id, tab.id);
                        } else {
                          showToast('Super Admin permissions cannot be modified here', 'error');
                        }
                      }}
                    >
                      <div className="relative pointer-events-none">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={role.permissions?.includes(tab.id) || false} 
                          readOnly 
                        />
                        <div className={`block w-10 h-6 rounded-full ${role.permissions?.includes(tab.id) ? 'bg-[var(--button-color)]' : 'bg-[var(--secondary-bg-color)] border border-[var(--hint-color)]'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${role.permissions?.includes(tab.id) ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm font-semibold">{tab.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
          <div className="mt-4">
            <h3 className="font-bold mb-3">{t("tab_users", "Users Management")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {users.map(u => (
                    <div key={formatNumber(u.telegram_id)} className="card flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary-color)]"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{u.first_name}</div>
                          <div className="text-xs text-hint mt-1">@{u.username || '?'}</div>
                        </div>
                        <span className="text-xs font-mono text-hint num-fix">{t('lbl_id', 'ID')}: {formatNumber(u.telegram_id)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 border-t border-[var(--border-color)] pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-hint">{t('lbl_role', 'Role')}</span>
                          <select 
                            value={u.role_id} 
                            onChange={(e) => changeUserRole(u.telegram_id, parseInt(e.target.value))}
                            disabled={userProfile?.role !== 'SUPER_ADMIN'}
                            className="p-1 px-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--secondary-bg-color)] text-[var(--text-color)]"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{t('role_' + r.name.toLowerCase(), r.name) as string}</option>
                            ))}
                          </select>
                        </div>
                        <button onClick={() => fetchUserLogs(u.telegram_id)} className="secondary py-1 px-3 text-xs rounded-lg flex items-center gap-1">
                          <Eye size={14} /> {t('lbl_actions', 'Actions')}
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}

      {viewLogsUserId !== null && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="card w-full" style={{ maxWidth: "500px", maxHeight: "90vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold m-0">User Logs <span className="text-sm font-normal text-hint">({viewLogsUserId})</span></h3>
              <button onClick={() => setViewLogsUserId(null)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginTop: '8px', paddingRight: '8px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', minHeight: '0' }}>
              {userLogs.length === 0 && <p className="text-hint">No logs found.</p>}
              <div className="flex flex-col gap-2">
                {userLogs.map(l => (
                  <div key={l.id} className="p-3 bg-[var(--secondary-bg-color)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm">{l.action}</div>
                      <div className="text-xs text-hint num-fix">{new Date(l.created_at).toLocaleString()}</div>
                    </div>
                    {l.metadata && (
                      <div className="mt-2 w-full">
                        <pre className="text-xs font-mono p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded overflow-y-auto" style={{maxHeight: '200px', width: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                          {(() => {
                            try {
                              const parsed = JSON.parse(l.metadata);
                              return JSON.stringify(parsed, null, 2);
                            } catch {
                              return l.metadata;
                            }
                          })()}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    
      {fullScreenImg && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setFullScreenImg(null)}>
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <button className="absolute top-4 left-4 z-50 bg-[rgba(0,0,0,0.5)] text-white border-none py-2 px-4 rounded-full flex items-center gap-2" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10000, background: 'rgba(0,0,0,0.5)', border: 'none', padding: '8px 16px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setFullScreenImg(null)}>
              <ArrowLeft size={20} /> <span className="font-bold">{t('btn_back', 'Back') as string}</span>
            </button>
            <img src={fullScreenImg} alt="Receipt Fullscreen" style={{ width: '95%', maxHeight: '90%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {viewingWalletCodeUses !== null && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setViewingWalletCodeUses(null)}>
          <div className="card w-full" style={{ maxWidth: "500px", maxHeight: "90vh", display: "flex", flexDirection: "column", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold m-0">{t('lbl_code_uses', 'Code Usages')}</h3>
              <button onClick={() => setViewingWalletCodeUses(null)} className="secondary p-2 rounded-full border-none"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginTop: '8px', paddingRight: '8px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', minHeight: '0' }}>
              {viewingWalletCodeUses.length === 0 ? (
                <p className="text-hint">No uses yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {viewingWalletCodeUses.map((u, i) => (
                    <div key={i} className="p-3 bg-[var(--secondary-bg-color)] rounded-lg border border-[var(--border-color)] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm m-0">{u.first_name} {u.username ? `(@${u.username})` : ''}</p>
                        <p className="text-xs text-hint mt-1">ID: {u.telegram_id}</p>
                      </div>
                      <p className="text-xs text-hint">{new Date(u.used_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}