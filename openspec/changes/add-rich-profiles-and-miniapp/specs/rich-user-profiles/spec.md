## ADDED Requirements

### Requirement: Extract User Profile Data
The system SHALL extract detailed user profile data from Telegram upon the user's first interaction.

#### Scenario: Extracting payload from /start
- **WHEN** the user starts the bot using a link like `t.me/Bot?start=ref123`
- **THEN** the system SHALL extract `ref123` and store it in the database

### Requirement: Consistent Internal Tracking
The system SHALL use the user's immutable Telegram ID as the primary key for all user-associated records.

#### Scenario: User changes their username
- **WHEN** a user changes their `@username` on Telegram
- **THEN** the system SHALL continue to identify them by their original Telegram ID and seamlessly update their username record upon next interaction
