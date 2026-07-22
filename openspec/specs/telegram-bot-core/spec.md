## ADDED Requirements

### Requirement: Bot Initialization
The system SHALL initialize a grammY bot instance bound to Cloudflare Workers using a Webhook strategy.

#### Scenario: Webhook request received
- **WHEN** Telegram sends an update via POST request
- **THEN** the worker handles the request and passes it to the bot instance

### Requirement: Cloudflare Environment Variables
The system SHALL rely on Cloudflare environment variables for sensitive data (BOT_TOKEN, ADMIN_CHAT_ID).

#### Scenario: Bot token is loaded
- **WHEN** the worker starts
- **THEN** it reads the `BOT_TOKEN` from the `env` object and initializes the bot
