## MODIFIED Requirements

### Requirement: Catalog Layout Redesign
The system SHALL present the Catalog view in a premium, fluid grid layout optimized for mobile screens, employing unified design tokens for shadows, borders, and typography. Margin and padding overlaps MUST be prevented.

#### Scenario: User views the catalog
- **WHEN** a user navigates to the Catalog page
- **THEN** products are displayed in elegant, well-spaced cards with distinct CTAs without collision or clipping.

## ADDED Requirements

### Requirement: Persian Numerals Ordering (RTL)
The system SHALL render all numbers and currencies in the catalog using properly scoped Bi-Directional text techniques to avoid English digits disrupting Persian sentence structure.

#### Scenario: Displaying prices
- **WHEN** a product price is rendered (e.g., 200,000 Toman)
- **THEN** it reads correctly from right-to-left without the digits splitting the sentence or appearing on the wrong side of the currency text.
