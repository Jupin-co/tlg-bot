## Context

The user is starting a brand new Telegram bot project for an e-commerce/ticketing use case. The bot needs to be hosted for free, guide users through an ordering flow (selecting parameters like Days and GBs), accept a manual payment receipt via image upload, and allow an administrator to review and approve the payment within Telegram itself.

## Goals / Non-Goals

**Goals:**
- Set up a highly responsive, zero-maintenance, free hosting environment using Cloudflare Workers.
- Persist users, orders, and payment statuses seamlessly using Cloudflare D1.
- Provide a robust state machine ("conversations") so the bot can ask a series of questions.
- Provide a smooth admin experience for approving orders directly inside Telegram.

**Non-Goals:**
- Fully automated payment verification (e.g., Stripe, Crypto APIs) — out of scope for now, manual image upload is required.
- External web admin panel — everything should happen inside Telegram for v1.
- Complex product inventory management — the bot assumes a single type of configurable service for now.

## Decisions

1. **Cloudflare Workers (Compute) + grammY (Bot Framework):**
   - *Rationale:* Cloudflare Workers offer 100k free requests per day, instant cold starts, and zero hosting costs for idle time. `grammY` is the premier Telegram bot framework for TypeScript and has official support/middleware for running on Cloudflare Workers.
   - *Alternatives considered:* Node.js on Vercel (10s timeout limit can be tight), Python on PythonAnywhere (less robust serverless model compared to edge workers).

2. **grammY Conversations for State Management:**
   - *Rationale:* We need a way to ask "How many GB?", wait for an answer, then ask "How many days?", then wait for an answer. `grammY`'s built-in conversational plugin allows writing this flow sequentially in code without complex external state tracking.
   - *Alternatives considered:* Manually tracking user state in a database table `user_state` (error-prone, hard to maintain).

3. **Cloudflare D1 (Database):**
   - *Rationale:* D1 is Cloudflare's serverless SQLite offering. It integrates natively with Workers, is very fast, and has a great free tier.
   - *Alternatives considered:* Supabase (PostgreSQL) — slightly more complex to set up, requires HTTP fetching from the edge, whereas D1 is native.

4. **Telegram Inline Keyboard for Admin Panel:**
   - *Rationale:* When a user uploads a receipt, the bot forwards it to a specific Admin Telegram ID with `Approve` and `Reject` inline buttons. This is the fastest way for the admin to manage orders without building a React/Next.js dashboard.
   - *Alternatives considered:* External web dashboard (too much overhead for an MVP).

## Risks / Trade-offs

- **[Risk] State Loss during Serverless Cold Starts:** If the worker spins down while a user is mid-conversation, they might lose their place.
  - *Mitigation:* We will use Cloudflare D1 or KV as the session storage backend for grammY conversations so state survives across worker invocations.
- **[Risk] Admin ID hardcoding:** Hardcoding a single admin ID might be limiting.
  - *Mitigation:* We'll store the Admin ID as an Environment Variable (`ADMIN_CHAT_ID`) so it can be changed without modifying the code.
- **[Risk] Cloudflare Workers File Upload Limits:** Telegram sends images as file IDs, but downloading them if needed could hit worker limits.
  - *Mitigation:* We don't need to download the image. The bot can simply forward the Telegram Message (containing the image) directly to the Admin.
