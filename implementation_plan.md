# Wallet System Implementation Plan

This plan introduces a new Wallet system where users can verify their identity (National Code & Date of Birth), charge their wallet via invoices, and use the wallet balance.

## User Review Required
> [!IMPORTANT]
> The database schema will be updated to store wallet information and support different invoice types. Please review the database migration plan below.

## Open Questions
> [!WARNING]
> 1. Should the user be able to pay for products *using* their wallet balance? (The current request mentions charging the wallet, but not explicitly paying with it. I will assume yes, users can use the wallet balance during checkout).
> 2. Are there any specific validation rules for the Iranian National Code (e.g. 10 digits)? I will implement a basic 10-digit check.
> 3. Should the admin have a dedicated page to review "Wallet Verifications" (KYC), or is the verification automatic upon entering the National Code and Date of Birth? The prompt says "the user should share date of birth and iranian national code, then it will be activate, the verified status should be add in db", which implies automatic activation without admin approval for the KYC part itself.

## Proposed Changes

---

### Database Schema
We will add new columns to support the wallet and distinguish wallet charge invoices from regular product invoices.

#### [NEW] `scratch/db_wallet_migration.sql`
- Add `national_code` (TEXT) to `profiles`.
- Add `date_of_birth` (TEXT) to `profiles`.
- Add `wallet_verified` (BOOLEAN DEFAULT 0) to `profiles`.
- Add `wallet_balance` (INTEGER DEFAULT 0) to `profiles`.
- Add `type` (TEXT DEFAULT 'PRODUCT_PURCHASE') to `invoices`.

---

### Backend API (`backend/src/api/index.ts` & `backend/src/core/db.ts`)
Update the backend to handle wallet verification, wallet charge invoices, and payment approval logic.

#### [MODIFY] `src/api/index.ts`
- **Wallet Verification Endpoint**: Add `POST /api/user/wallet/verify` to accept `national_code` and `date_of_birth` and set `wallet_verified = 1`.
- **Wallet Charge Endpoint**: Add `POST /api/wallet/charge` to create an invoice with `type = 'WALLET_CHARGE'` and the specified amount.
- **Payment Approval Logic**: Modify `POST /admin/payments/:id/approve` to check the invoice type. If it's `WALLET_CHARGE`, it will add `total_price` to the user's `wallet_balance` instead of generating redeem codes.
- **Checkout Logic**: Modify `/api/invoice/create` (or related checkout logic) to allow paying with the wallet balance if it's a `PRODUCT_PURCHASE` invoice.

---

### Frontend UI
Create the Wallet UI in the Profile tab and update the Invoice/Admin views to handle wallet charges.

#### [MODIFY] `frontend/src/pages/Profile.tsx`
- Add a new "Wallet" section in the Profile tab.
- If `wallet_verified` is false: Show a form asking for National Code and Date of Birth to activate the wallet.
- If `wallet_verified` is true: Show the current `wallet_balance` and an input field + button to "Charge Wallet".
- Charging the wallet will redirect the user to `/invoice/:id` where they can upload their payment receipt.

#### [MODIFY] `frontend/src/pages/Admin.tsx`
- Ensure the Invoices list clearly displays the invoice type (e.g., "Wallet Charge" vs "Product Purchase").
- The payment approval flow remains the same (Admin views receipt image and clicks Approve), but the backend handles the balance update automatically.

#### [MODIFY] `frontend/src/pages/InvoiceView.tsx`
- Ensure the invoice view clearly states if the invoice is for a "Wallet Charge".

## Verification Plan

### Automated Tests
- Run `npm run build` in the frontend to ensure no TypeScript errors.
- Run database migrations successfully.

### Manual Verification
- Go to Profile, enter National Code and Date of Birth to verify the wallet.
- Verify that `wallet_verified` becomes true and the charge form appears.
- Enter an amount (e.g. 500) and click "Charge Wallet".
- Verify an invoice is created and you are redirected to the checkout page.
- Upload a dummy receipt image.
- Go to Admin Panel -> Payments, find the payment and approve it.
- Go back to Profile and verify the wallet balance has increased by 500.
