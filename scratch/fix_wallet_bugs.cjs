const fs = require('fs');

// 1. Fix backend wallet status
let apiCode = fs.readFileSync('src/api/index.ts', 'utf8');
apiCode = apiCode.replace(/profile\.wallet_status !== 'ACTIVE'/g, "profile.wallet_status !== 'VERIFIED'");
fs.writeFileSync('src/api/index.ts', apiCode);

// 2. Fix Wallet.tsx translations
let walletCode = fs.readFileSync('frontend/src/pages/Wallet.tsx', 'utf8');

// The redeem handler
const brokenRedeemAlert = `if (data.error) alert(data.error);
      else {
        alert(t('msg_code_redeemed', 'Code successfully redeemed!'));`;
        
const fixedRedeemAlert = `if (data.error) {
        let errMsg = data.error;
        if (errMsg === 'Wallet is not active') errMsg = t('err_wallet_not_active', 'Wallet is not active');
        else if (errMsg === 'Invalid code') errMsg = t('err_invalid_code', 'Invalid code');
        else if (errMsg === 'Code has expired') errMsg = t('err_code_expired', 'Code has expired');
        else if (errMsg === 'Code usage limit reached') errMsg = t('err_code_limit_reached', 'Code usage limit reached');
        else if (errMsg === 'You have already redeemed this code') errMsg = t('err_code_already_redeemed', 'You have already redeemed this code');
        else if (errMsg === 'Code is required') errMsg = t('err_code_is_required', 'Code is required');
        alert(errMsg);
      } else {
        alert(t('msg_code_redeemed', 'Code successfully redeemed!'));`;

walletCode = walletCode.replace(brokenRedeemAlert, fixedRedeemAlert);

// The verify handler (Wait, verify handler already had if (data.error) alert(data.error);)
const brokenVerifyAlert = `if (data.error) alert(data.error);
      else {
        alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));`;

const fixedVerifyAlert = `if (data.error) {
        let errMsg = data.error;
        if (errMsg === 'Missing fields') errMsg = t('err_missing_fields', 'Missing fields');
        alert(errMsg);
      } else {
        alert(t('msg_kyc_submitted', 'Verification submitted! Pending admin approval.'));`;
        
walletCode = walletCode.replace(brokenVerifyAlert, fixedVerifyAlert);

fs.writeFileSync('frontend/src/pages/Wallet.tsx', walletCode);
console.log('Fixed translations and wallet_status!');
