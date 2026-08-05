## Why

The current web interface for the Telegram bot consists of functional but unoptimized desktop-centric designs, such as wide tables and scrollable horizontal tabs. Since the interface is primarily accessed via Telegram Mini Apps (which are overwhelmingly used on mobile phones), it needs a complete mobile-first responsive redesign. We will implement high-end aesthetics, applying `ui-ux-pro-max` and `design-taste-frontend` principles to ensure a professional, intuitive, and premium user experience.

## What Changes

- Complete overhaul of layout systems to prioritize mobile viewports (e.g., replacing tables with card grids, adopting vertical or responsive-wrap navigation).
- Refined color palettes, typography, and spacing to match high-end design standards.
- Application of dynamic animations (micro-interactions) and smooth transitions.
- Standardization of all UI components (buttons, inputs, cards) across all pages (`Admin`, `Profile`, `Catalog`, `InvoiceView`, etc.).
- Complete accessibility and touch-target optimization.

## Capabilities

### New Capabilities
- `ui-components-standardization`: Defines a centralized, high-end, mobile-first component system for the entire application.

### Modified Capabilities
- `admin-panel`: Requirements changed to strictly enforce mobile-first layout patterns (cards instead of tables, touch-friendly navigation).
- `user-profile`: Requirements changed to prioritize responsive grid layout and high-end visual hierarchy for order history.
- `catalog`: Requirements changed to enforce premium product card presentation and fluid grid layouts.

## Impact

- Frontend UI components, layouts, and styles.
- `index.css` will be heavily updated to introduce a complete design token system.
- All React views (`Admin.tsx`, `Profile.tsx`, `InvoiceView.tsx`, `Catalog.tsx`, etc.) will be restructured.
- No backend API or database schema changes are expected.
