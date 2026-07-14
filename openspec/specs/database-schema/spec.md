## ADDED Requirements

### Requirement: Users Table
The system SHALL maintain a `users` table to track Telegram user IDs and usernames.

#### Scenario: User interacts for the first time
- **WHEN** a user starts a conversation
- **THEN** their telegram ID is saved in the `users` table

### Requirement: Orders Table
The system SHALL maintain an `orders` table storing the user ID, days, gb, price, status, and created_at timestamp.

#### Scenario: Order is submitted
- **WHEN** the user finishes the wizard
- **THEN** an order record is inserted with status `PENDING_PAYMENT`

#### Scenario: Order is approved
- **WHEN** the admin approves the order
- **THEN** the status is updated to `DELIVERED`
