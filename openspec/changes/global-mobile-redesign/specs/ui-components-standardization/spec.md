## ADDED Requirements

### Requirement: Centralized Design Tokens
The system SHALL define a centralized set of CSS variables for colors, typography, and spacing in `index.css` to ensure consistent visual language across the app.

#### Scenario: Theming application
- **WHEN** the application loads
- **THEN** it applies the `ui-ux-pro-max` color scheme via CSS variables

### Requirement: Global Mobile-First Layout
The system SHALL use mobile-first CSS Grid/Flexbox layouts across all components, avoiding fixed horizontal layouts.

#### Scenario: Viewing on mobile
- **WHEN** a user opens the app on a mobile device (width < 640px)
- **THEN** grid components collapse into a single column automatically without horizontal scrolling

### Requirement: Interactive Micro-Animations
The system SHALL implement subtle CSS-based hover and active state transformations for all clickable elements to provide tactile feedback.

#### Scenario: Pressing a button
- **WHEN** a user taps a button or card
- **THEN** the element scales down slightly (`transform: scale(0.98)`) and adjusts shadow depth
