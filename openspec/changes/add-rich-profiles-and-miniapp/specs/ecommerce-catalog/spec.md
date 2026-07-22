## ADDED Requirements

### Requirement: Categorized Product Catalog
The system SHALL organize products into hierarchical categories.

#### Scenario: Disabling a category
- **WHEN** an admin toggles a category's `is_active` flag to false
- **THEN** all products under that category SHALL be hidden from the Mini App and Bot catalog menus

### Requirement: Product Stock and Visibility Toggles
The system SHALL support internal stock tracking and toggles for selling and visibility.

#### Scenario: Product is out of stock but visible
- **WHEN** a product's `is_selling` flag is false but `is_hidden` is false
- **THEN** the product SHALL be displayed in the catalog but the purchase button SHALL be disabled or replaced with "Out of Stock"

### Requirement: Product Variants
The system SHALL support optional variants for products with price modifiers.

#### Scenario: Purchasing a variant
- **WHEN** a user selects a "60 Days" variant with a +$10 price modifier for a $50 product
- **THEN** the system SHALL calculate the total order price as $60
