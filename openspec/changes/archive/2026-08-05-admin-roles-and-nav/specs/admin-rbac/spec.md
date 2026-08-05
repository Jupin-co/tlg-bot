## ADDED Requirements

### Requirement: Role-based Tab Visibility
The system SHALL display only the 'Catalog', 'Payments', and 'Invoices' tabs to users with the role of `admin`. Users with the role of `super_admin` SHALL see all available tabs.

#### Scenario: Regular admin logs in
- **WHEN** a user with the role of `admin` accesses the admin panel
- **THEN** the navigation drawer and tab list only display options for Catalog, Payments, and Invoices.

#### Scenario: Super admin logs in
- **WHEN** a user with the role of `super_admin` accesses the admin panel
- **THEN** the navigation drawer and tab list display all administrative options including Settings, Users, and Messages.
