const fs = require('fs');

// 1. Fix Admin.tsx
let adminCode = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The useEffect that fetches initial data
const oldUseEffect = `  useEffect(() => {
    if (!initData || !isAdmin) return;
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'invoices') fetchInvoices();
    if (activeTab === 'messages') fetchTranslations();
    if (activeTab === 'users') fetchUsers();
  }, [initData, isAdmin, activeTab]);`;

const newUseEffect = `  useEffect(() => {
    if (!initData || !isAdmin) return;
    if (activeTab === 'catalog') fetchCatalog();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'invoices') fetchInvoices();
    if (activeTab === 'messages') fetchTranslations();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'wallet-codes') fetchWalletCodes();
  }, [initData, isAdmin, activeTab]);`;

if (adminCode.includes(oldUseEffect)) {
    adminCode = adminCode.replace(oldUseEffect, newUseEffect);
    fs.writeFileSync('frontend/src/pages/Admin.tsx', adminCode);
    console.log('Fixed Admin.tsx');
} else {
    console.log('Could not find useEffect in Admin.tsx');
}

// 2. Fix Wallet.tsx (remove window.location.reload())
let walletCode = fs.readFileSync('frontend/src/pages/Wallet.tsx', 'utf8');

// For Wallet Redeem:
// alert(t('msg_code_redeemed', 'Code successfully redeemed!'));
// window.location.reload();
const oldRedeemAlert = `alert(t('msg_code_redeemed', 'Code successfully redeemed!'));
        window.location.reload();`;

const newRedeemAlert = `alert(t('msg_code_redeemed', 'Code successfully redeemed!'));
        if (localProfile) {
          setLocalProfile({ ...localProfile, wallet_balance: (localProfile.wallet_balance || 0) + data.amount });
        }`;
        
// For Wallet Verify:
// alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));
// window.location.reload();
const oldVerifyAlert = `alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));
        window.location.reload();`;

const newVerifyAlert = `alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));
        if (localProfile) {
          setLocalProfile({ ...localProfile, wallet_status: 'PENDING' });
        }`;

let replacedWallet = false;
if (walletCode.includes(oldRedeemAlert)) {
    walletCode = walletCode.replace(oldRedeemAlert, newRedeemAlert);
    replacedWallet = true;
}
if (walletCode.includes(oldVerifyAlert)) {
    walletCode = walletCode.replace(oldVerifyAlert, newVerifyAlert);
    replacedWallet = true;
}

if (replacedWallet) {
    fs.writeFileSync('frontend/src/pages/Wallet.tsx', walletCode);
    console.log('Fixed Wallet.tsx');
} else {
    console.log('Could not find window.location.reload() in Wallet.tsx');
}

