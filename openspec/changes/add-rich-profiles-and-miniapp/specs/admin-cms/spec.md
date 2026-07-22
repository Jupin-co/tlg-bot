## ADDED Requirements

### Requirement: Admin Dashboard Access
The system SHALL provide an `/admin` command that is only accessible to users with `is_admin = true` in the database.

#### Scenario: Unauthorized access attempt
- **WHEN** a normal user types `/admin`
- **THEN** the system SHALL ignore the command or return an unauthorized message

### Requirement: Multi-Admin Order Notifications
The system SHALL notify all administrators when a new order is created.

#### Scenario: Order is submitted
- **WHEN** an order is successfully submitted and paid
- **THEN** the system SHALL query all users with `is_admin = true` and send an order summary message with inline action buttons to each of them

### Requirement: Dynamic Settings CMS
The system SHALL allow admins to edit bot dialogs and settings via the inline admin panel.

#### Scenario: Admin changes the welcome message
- **WHEN** an admin edits the 'welcome_message' setting in the bot dashboard
- **THEN** the `settings` table is updated and subsequent `/start` commands use the new text
