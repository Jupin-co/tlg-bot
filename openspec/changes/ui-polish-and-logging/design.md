## Context

After applying the initial global mobile redesign, user feedback identified several specific UI flaws and a functional gap in user activity logging. The layout requires fine-tuning (margins, scaling, and RTL bugs), and the application needs a more robust way to track detailed user interactions (e.g., beyond just "VIEW_CATALOG" to exact button clicks).

## Goals / Non-Goals

**Goals:**
- Fix RTL numerals and currency ordering by ensuring `direction: ltr` or standard Bidi formatting is correctly scoped for dynamic numbers in Farsi strings.
- Refactor the Catalog and Basket with accurate mobile padding and spacing.
- Add a top responsive navbar to the Profile and Admin pages.
- Add an Image modal/scaling solution for the Admin invoice view.
- Update the backend API and frontend tracking to support detailed JSON payloads for user logs (micro-logging).

**Non-Goals:**
- Complete restructuring of the database schema (we will append to the existing `logs` structure or add a details field if possible, rather than migrating everything).

## Decisions

**1. RTL Fix for Numbers**
- **Decision:** Utilize proper wrapping (`<span dir="ltr">`) for mixed English/Numeric strings within Persian text, or utilize `Intl.NumberFormat('fa-IR')` exclusively for currencies so the characters themselves are strictly Persian and don't trigger the browser's bi-directional reordering algorithm.

**2. Image Scaling in Admin**
- **Decision:** Constrain the image to `max-width: 100%; max-height: 200px; object-fit: contain` in the list view. Add an `onClick` handler that opens the image in a full-screen `<dialog>` or absolute overlay modal.

**3. Detailed Telemetry**
- **Decision:** Extend the existing `logUserAction` endpoint to accept an optional `details` JSON payload, which will capture element IDs or state snapshots. In the Admin panel, the logs table will present this JSON in a scrollable `<pre>` or card element.

## Risks / Trade-offs

- **Risk:** Storing detailed JSON logs might quickly bloat the SQLite/D1 database if traffic is high.
- **Mitigation:** Suggest implementing log rotation or truncation in the future, and store details as text/JSON strings efficiently.
