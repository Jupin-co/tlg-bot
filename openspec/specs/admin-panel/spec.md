## ADDED Requirements

### Requirement: Admin Notification
The system SHALL forward order details and the payment receipt to the configured `ADMIN_CHAT_ID`.

#### Scenario: New order received
- **WHEN** a user completes an order
- **THEN** the admin receives a message with the user's config, price, and the uploaded photo, along with inline buttons for "Approve" and "Reject".

### Requirement: Payment Approval
The system SHALL allow the admin to approve an order via an inline button.

#### Scenario: Admin clicks Approve
- **WHEN** the admin clicks "Approve"
- **THEN** the bot prompts the admin to enter the product details (e.g., connection link)
- **WHEN** the admin provides the details
- **THEN** the bot sends the details to the user and marks the order as `DELIVERED` in the database

### Requirement: Payment Rejection
The system SHALL allow the admin to reject an order via an inline button.

#### Scenario: Admin clicks Reject
- **WHEN** the admin clicks "Reject"
- **THEN** the bot notifies the user that their payment was rejected and updates the order status to `REJECTED`
