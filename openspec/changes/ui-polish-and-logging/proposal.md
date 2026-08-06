## Why

The global mobile redesign introduced some layout and styling issues, specifically around RTL numeral ordering in the Catalog, margin/padding collisions in the Basket, and poor image scaling in payment receipts. Additionally, the Profile and Admin panels lack responsive navbars (e.g., hamburger menus), and the current user logging system is insufficient, only capturing generic `VIEW_CATALOG` events instead of detailed user interactions.

## What Changes

- **UI Polish**: Fix RTL numeral and currency ordering in the Catalog. Repair margin and padding collisions in the Basket. Update the inventory icon in the Profile.
- **Navbars**: Introduce a responsive top navbar or hamburger menu for the Profile and Admin pages to replace desktop-centric buttons.
- **Image Scaling**: Display payment receipt images in a responsive, screen-fitted size, allowing users to click to open them in full size.
- **Detailed User Telemetry**: Expand the user action logging system to capture micro-details (e.g., specific buttons clicked, actions taken) and display these enhanced logs in the Admin user management panel with scrolling enabled.

## Capabilities

### New Capabilities
- `user-telemetry`: Gathering and storing micro-detailed logs of user interactions (button clicks, specific page views, actions).

### Modified Capabilities
- `admin-panel`: Added hamburger menu/navbar, scaled payment receipt images with click-to-expand, and scrollable detailed user log views.
- `catalog`: RTL fixes for numbers and currency, and spacing adjustments.
- `user-profile`: Top navbar integration and icon updates.

## Impact

- Frontend: `Catalog.tsx`, `Profile.tsx`, `Admin.tsx`, `InvoiceView.tsx`, and `index.css` for layout and RTL fixes.
- Backend / API: The logging API endpoint and the bot's logging mechanism will be expanded to accept and store detailed event payloads.
