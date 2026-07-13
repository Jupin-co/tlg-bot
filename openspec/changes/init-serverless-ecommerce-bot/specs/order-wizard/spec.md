## ADDED Requirements

### Requirement: Start Command
The system SHALL provide a `/start` command that initiates the order wizard.

#### Scenario: User sends /start
- **WHEN** a user sends `/start`
- **THEN** the bot replies with a welcome message and asks "How many Days of service do you need?"

### Requirement: Wizard Flow (Days and GB)
The system SHALL collect the number of Days and GBs sequentially.

#### Scenario: Collecting configuration
- **WHEN** the user provides Days
- **THEN** the bot saves it in state and asks for GBs
- **WHEN** the user provides GBs
- **THEN** the bot calculates the price and asks the user to upload a payment receipt

### Requirement: Receipt Upload
The system SHALL accept photo messages as payment receipts.

#### Scenario: User uploads photo
- **WHEN** the user uploads a photo after finishing configuration
- **THEN** the bot marks the order as PENDING_PAYMENT, saves the record to the database, and forwards the photo to the Admin
