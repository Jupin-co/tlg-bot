## Why

The user needs a fully functional, serverless e-commerce/ticketing Telegram bot to take orders, handle manual payment confirmations (via receipts), and coordinate with admins. A serverless architecture using Cloudflare Workers ensures 100% free hosting and instant execution, while Cloudflare D1 handles state and order management reliably.

## What Changes

- Initialize a new Node.js/TypeScript project for Cloudflare Workers.
- Integrate `grammY` as the Telegram bot framework.
- Set up state management using `grammY` conversational plugins to step users through the ordering process (e.g., selecting GB, Days, and uploading a payment receipt).
- Set up Cloudflare D1 (Serverless SQLite) to track users, pending orders, and payment statuses.
- Build an Admin interface inside Telegram to review payment receipts and approve/reject orders.

## Capabilities

### New Capabilities
- `telegram-bot-core`: Webhook setup, routing, and bot initialization using grammY.
- `order-wizard`: Conversational flow for users to select product configuration (Days, GBs) and submit payment receipts.
- `database-schema`: Cloudflare D1 schema for Users and Orders.
- `admin-panel`: Telegram-based admin flow to approve or reject pending payments via inline buttons.

### Modified Capabilities

## Impact

- **New System**: Introduces a completely new project structure.
- **Dependencies**: `grammY`, `wrangler` (Cloudflare CLI).
- **External Services**: Cloudflare Workers (compute), Cloudflare D1 (database), Telegram Bot API.
