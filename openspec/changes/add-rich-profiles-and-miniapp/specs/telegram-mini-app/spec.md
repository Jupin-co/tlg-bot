## ADDED Requirements

### Requirement: Serve Mini App Frontend
The system SHALL serve a graphical frontend application (HTML/JS/CSS) to users accessing the Telegram Mini App.

#### Scenario: User opens the Mini App
- **WHEN** the user clicks the "Open App" button in Telegram
- **THEN** the worker SHALL return the HTML layout of the application

### Requirement: Secure Authentication via initData
The system SHALL authenticate Mini App API requests by validating the Telegram `initData` hash.

#### Scenario: User makes an API request from the Mini App
- **WHEN** the Mini App frontend requests sensitive user data
- **THEN** it SHALL provide the `initData` string, and the backend SHALL validate its cryptographic signature using the Bot Token before returning data
