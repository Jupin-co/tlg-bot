## Why

We need to track user identity consistently and gather rich analytics on user acquisition, retention, and behavior. Furthermore, providing a modern graphical interface via Telegram Mini Apps will drastically improve the user experience for purchasing, while maintaining everything in a unified Cloudflare worker architecture. Finally, managing this growing business requires a powerful in-bot Admin CMS to manage products, view orders, and edit bot dialogs dynamically.

## What Changes

- Add a rich `users` table to track Telegram ID, names, language, premium status, referral parameters, and `is_admin` roles.
- Add `categories`, `products`, `product_variants`, and `settings` tables for the e-commerce catalog and CMS.
- Restructure the Cloudflare Worker to act as a monolithic backend using a router (e.g. Hono).
- Share core logic (DB access, pricing calculation) between the Telegram Bot webhook and the Mini App API.
- Add a new graphical Mini App frontend served or hosted alongside the bot.
- Implement an inline-keyboard Admin Dashboard within the bot for managing the catalog and receiving order notifications.

## Capabilities

### New Capabilities
- `rich-user-profiles`: Tracking user metadata consistently across interactions.
- `monolithic-router`: Unifying bot webhook and API endpoints under a single Cloudflare Worker using Hono.
- `telegram-mini-app`: The graphical frontend interface for Telegram users.
- `admin-cms`: An in-bot dashboard for managing settings, dialogs, and receiving multi-admin order notifications.
- `ecommerce-catalog`: Dynamic products, variants, and categories management.

### Modified Capabilities
- `database-schema`: Expanding the schema to include the new `users` fields, categories, products, variants, and settings tables.

## Impact

- `src/index.ts` will be completely refactored to use a router instead of directly exporting a webhook.
- The database schema requires a migration to expand the `users` table and add catalog/CMS tables.
- A new `src/api/` and `src/core/` module structure will be introduced.
- A new `src/bot/admin/` module will be created to handle the inline keyboard CMS.
- A new frontend directory will be added for the Mini App UI.
