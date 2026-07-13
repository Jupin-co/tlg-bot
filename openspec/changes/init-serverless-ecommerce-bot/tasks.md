## 1. Setup

- [x] 1.1 Initialize a new Cloudflare Worker project with TypeScript
- [x] 1.2 Install dependencies (`grammy`, `@grammyjs/conversations`)
- [x] 1.3 Configure `wrangler.toml` (environment variables, database bindings)

## 2. Database (D1)

- [x] 2.1 Create D1 database locally via wrangler
- [x] 2.2 Create schema file `schema.sql` for `users` and `orders` tables
- [x] 2.3 Apply schema to local D1 database

## 3. Bot Core & State Management

- [x] 3.1 Implement webhook handler in `src/index.ts` for Cloudflare Workers
- [x] 3.2 Initialize grammY bot instance and session/conversations middleware
- [x] 3.3 Create a custom grammY Context type containing D1 environment bindings

## 4. Order Wizard

- [x] 4.1 Implement `/start` command and greeting
- [x] 4.2 Create the conversation wizard (ask Days -> ask GBs -> calculate price)
- [x] 4.3 Add message handler for photo uploads (capturing the payment receipt)
- [x] 4.4 Save the order to D1 database with status `PENDING_PAYMENT`

## 5. Admin Flow

- [x] 5.1 Send the order summary and photo to `ADMIN_CHAT_ID` with Approve/Reject inline keyboard
- [x] 5.2 Implement callback query handler for "Reject" (updates DB, notifies user)
- [x] 5.3 Implement callback query handler for "Approve"
- [x] 5.4 Implement conversation for Admin to provide product details upon approval and notify the user
