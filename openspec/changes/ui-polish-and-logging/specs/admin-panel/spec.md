## MODIFIED Requirements

### Requirement: Admin Dashboard Layout Redesign
The system SHALL display the Admin Web UI using a mobile-optimized responsive card layout, deprecating any horizontal-scrolling table views for user or message management. It SHALL include a top navbar or hamburger menu for navigation.

#### Scenario: Accessing the Admin panel on a mobile device
- **WHEN** an admin accesses the dashboard on a smartphone
- **THEN** they navigate sections using a responsive hamburger menu or navbar instead of a grid of buttons.

## ADDED Requirements

### Requirement: Modal Image Viewer
The system SHALL render uploaded receipt images within constrained dimensions and allow full-screen viewing on click.

#### Scenario: Viewing a receipt
- **WHEN** the admin clicks a receipt thumbnail
- **THEN** the image opens in a large modal or overlay without breaking the underlying layout

### Requirement: Detailed Telemetry View
The system SHALL display the detailed JSON telemetry payloads in the User Logs panel in a scrollable container.

#### Scenario: Inspecting user activity
- **WHEN** an admin views a user's logs
- **THEN** they can see and scroll through the detailed interaction JSON payloads
