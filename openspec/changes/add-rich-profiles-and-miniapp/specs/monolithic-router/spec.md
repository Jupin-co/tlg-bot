## ADDED Requirements

### Requirement: Monolithic Cloudflare Worker
The system SHALL serve all requests (Bot webhooks, API requests, HTML assets) from a single Cloudflare Worker using a router framework like Hono.

#### Scenario: Telegram sends a webhook update
- **WHEN** Telegram sends a POST request to `/bot`
- **THEN** the router SHALL pass the request directly to the grammY webhook handler

#### Scenario: Mini App requests API data
- **WHEN** the Mini App frontend sends a GET request to `/api/orders`
- **THEN** the router SHALL process the request using the shared core logic and return JSON

### Requirement: Shared Core Logic Module
The system SHALL maintain a shared `core` module containing business logic and database queries used by both the Bot and the API.

#### Scenario: Updating an order price
- **WHEN** an order is created via the bot OR via the Mini app
- **THEN** the exact same calculation function from the `core` module SHALL be used
