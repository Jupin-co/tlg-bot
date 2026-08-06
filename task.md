# Wallet System Implementation Tasks

- [ ] **1. Database Schema Updates**
  - [ ] Create migration script to add `national_code`, `date_of_birth`, `wallet_status` (TEXT: UNVERIFIED, PENDING, VERIFIED, REJECTED), and `wallet_balance` (INTEGER) to `profiles`.
  - [ ] Add `type` (TEXT DEFAULT 'PRODUCT_PURCHASE') to `invoices`.
  - [ ] Execute migration script.

- [ ] **2. Backend: KYC & Admin Verification**
  - [ ] Implement Iranian National Code validation function.
  - [ ] Create `POST /api/wallet/verify` to submit KYC (national code + DOB) and set `wallet_status` to 'PENDING'.
  - [ ] Create `GET /admin/verifications` to fetch pending KYC requests.
  - [ ] Create `POST /admin/verifications/:id/approve` and `reject` to update `wallet_status`.

- [ ] **3. Backend: Wallet Charge & Payment**
  - [ ] Create `POST /api/wallet/charge` to generate a `WALLET_CHARGE` invoice.
  - [ ] Update `POST /admin/payments/:id/approve` to handle `WALLET_CHARGE` invoices by increasing `wallet_balance`.
  - [ ] Create `POST /api/invoice/pay-with-wallet` to allow users to pay for `PRODUCT_PURCHASE` invoices instantly using their wallet balance.

- [ ] **4. Frontend: Profile Wallet UI**
  - [ ] Add Wallet section to `Profile.tsx`.
  - [ ] Implement KYC Form with National Code validation and Date Picker for DOB.
  - [ ] Show Pending/Rejected status states.
  - [ ] Show Wallet Balance and "Charge Wallet" form when verified.

- [ ] **5. Frontend: Admin KYC UI**
  - [ ] Add a new "Verifications" tab in `Admin.tsx`.
  - [ ] Build UI to list pending verifications and Approve/Reject them.

- [ ] **6. Frontend: Checkout & Invoice Updates**
  - [ ] Update `InvoiceView.tsx` to handle `WALLET_CHARGE` invoices cleanly (don't show "Pay with Wallet" for wallet charges).
  - [ ] Add "Pay with Wallet" button in `InvoiceView.tsx` for `PRODUCT_PURCHASE` invoices if user balance >= total price.
