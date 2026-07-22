## MODIFIED Requirements

### Requirement: Users Table
The system SHALL maintain a `users` table to track Telegram user IDs, usernames, first name, last name, language code, premium status, and the start parameter (referral code).

#### Scenario: User interacts for the first time
- **WHEN** a user starts a conversation or opens the mini app
- **THEN** their telegram ID and rich profile data (names, language, start param) are saved in the `users` table
