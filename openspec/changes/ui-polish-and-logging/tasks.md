## 1. UI Polish & Layout Fixes

- [x] 1.1 Fix RTL numerals in `Catalog.tsx` (ensure English digits and Persian text are scoped correctly so they don't reorder)
- [x] 1.2 Fix margin and padding overlaps in the Basket component
- [x] 1.3 Add a responsive top Navbar (with hamburger menu for mobile) to `Profile.tsx` and `Admin.tsx`
- [x] 1.4 Update the inventory icon in the Profile view

## 2. Image Scaling in Admin

- [x] 2.1 Update `InvoiceView.tsx` to constrain image sizes in the list view (e.g., max-height, object-fit)
- [x] 2.2 Add an onClick modal/overlay to `InvoiceView.tsx` to view the full-size receipt image

## 3. Telemetry / Logging Updates

- [x] 3.1 Update the backend logging API in `src/api/index.ts` to accept and store a `details` JSON payload
- [x] 3.2 Update frontend components (e.g., Catalog buttons, Profile actions) to send specific micro-events with context payload
- [x] 3.3 Update the Admin user logs view to render the `details` JSON in a scrollable, readable container
