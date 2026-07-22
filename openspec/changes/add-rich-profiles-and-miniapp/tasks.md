## 1. Database & Schema Updates

- [x] 1.1 Update `schema.sql` to include new fields in the `users` table (`first_name`, `last_name`, `language_code`, `is_premium`, `start_param`, `is_admin`)
- [x] 1.2 Add `categories`, `products`, `product_variants`, and `settings` tables to `schema.sql`
- [x] 1.3 Apply schema changes to the local D1 database via wrangler

## 2. Monolithic Architecture Setup

- [x] 2.1 Install Hono (`npm install hono`)
- [x] 2.2 Refactor `src/index.ts` to use Hono router instead of the raw fetch handler
- [x] 2.3 Mount the grammY `webhookCallback` securely to the `POST /bot` route

## 3. Core Module Extraction

- [x] 3.1 Create `src/core/db.ts` to centralize database queries (e.g. `saveUser`, `createOrder`, catalog queries)
- [x] 3.2 Refactor `src/bot.ts` to use the new `src/core` functions instead of raw SQL queries
- [x] 3.3 Update the `/start` command handler to capture and save rich user profile data from the Telegram Context

## 4. Admin CMS Implementation

- [x] 4.1 Create `src/bot/admin.ts` to handle the `/admin` command and restrict it to `users.is_admin = true`
- [x] 4.2 Build an inline-keyboard dashboard for managing the catalog (adding/editing products)
- [x] 4.3 Add a wizard for admins to edit dynamic bot settings (e.g., welcome message)
- [x] 4.4 Implement multi-admin order notifications (query all admins and broadcast order details)

## 5. Mini App API & Frontend Setup

- [x] 5.1 Create `src/api/index.ts` and mount it to `/api/*` within the main Hono router
- [x] 5.2 Implement Telegram `initData` validation middleware to secure `/api/*` routes
- [x] 5.3 Add an `/api/catalog` endpoint that serves active categories and products from D1
- [x] 5.4 Create `public/index.html` (the Mini App graphical frontend) and configure Hono to serve static files on `GET /`
