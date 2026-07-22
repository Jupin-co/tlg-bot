## Context

Currently, the bot is a standalone Cloudflare Worker exporting a webhook directly from `index.ts`. It has a basic database schema (`users`, `orders`, `sessions`). We need to expand the `users` table to track Telegram profiles comprehensively (including language, premium status, referral codes) and add a Telegram Mini App graphical interface. The new architecture needs to serve both the bot webhooks and the Mini App's backend and frontend from the same Cloudflare Worker to easily share code and D1 Database bindings.

## Goals / Non-Goals

**Goals:**
- Unify the architecture under a single Cloudflare Worker using Hono.
- Expand the `users` database table to include rich profile data.
- Ensure business logic is shared between the Telegram bot and the Mini App API.
- Setup the foundation for the Mini App frontend (HTML/JS) to be served by the worker.

**Non-Goals:**
- We are not fully styling or designing the complex frontend of the Mini App in this phase (the focus is on architecture, DB setup, and routing foundation).

## Decisions

**1. Unified Router (Hono)**
We will use `hono` as the core router in `src/index.ts`. It will handle all incoming Cloudflare Worker requests and route them to:
- `POST /bot` -> The grammY webhook handler.
- `/api/*` -> The Mini App JSON backend endpoints.
- `GET /` -> Static HTML generation for the Mini App frontend.
*Alternative considered:* Separate Cloudflare Workers for bot and frontend. *Rejected* because they share the exact same D1 database and core business logic, so a monolith is much easier to maintain and deploy.

**2. Shared Core Logic Module**
We will extract all database queries and business logic into a `src/core/` directory. Both `src/bot/` and `src/api/` will import and use functions from `src/core/` to ensure a single source of truth.

**3. Telegram Mini App Authentication**
The Mini App will authenticate by passing the Telegram `initData` string via HTTP headers. The `/api/*` routes will validate the HMAC hash using the `BOT_TOKEN` to securely prove the user's identity without requiring a password.

**4. In-Bot Admin CMS**
We will build an `/admin` command restricted by the `users.is_admin` flag in the DB. It will use grammY's inline keyboards and conversation (or state) handlers to provide a wizard for adding/editing products, managing categories, and editing bot settings (dialogs) without leaving Telegram.

**5. Database-driven Catalog and Settings**
Instead of hardcoding products and bot messages in code, everything will be pulled from D1 (`categories`, `products`, `product_variants`, `settings`). The Mini App will fetch the active catalog via an `/api/catalog` endpoint, ensuring the bot and the web app are perfectly in sync.

## Risks / Trade-offs

- **Risk:** The worker size gets too large due to bundling frontend assets.
  - **Mitigation:** Keep the initial frontend lightweight (vanilla JS/HTML). Cloudflare Workers have a 1MB limit. If the frontend grows, we will transition from a raw Worker to Cloudflare Pages (which natively supports static assets alongside the same backend functions).
- **Risk:** Hono routing conflicts with grammY.
  - **Mitigation:** We will mount grammY's `webhookCallback` specifically on the `POST /bot` route to isolate it from the web API.
