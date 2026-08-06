## ADDED Requirements

### Requirement: Granular Event Tracking
The system SHALL capture detailed interaction logs (telemetry) rather than just page views, storing JSON payload details in the database.

#### Scenario: User clicks a specific action
- **WHEN** a user interacts with a UI element (e.g. copies a code, submits an order)
- **THEN** the system logs the event type along with an accompanying JSON payload capturing contextual details
