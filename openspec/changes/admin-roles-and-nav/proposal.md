## Why

Currently, all users with admin access can see all tabs in the admin panel. We need to implement Role-Based Access Control (RBAC) so that regular admins are restricted to specific operational tabs (Catalog, Payments, Invoices), while only Super Admins have full access to sensitive areas (Settings, Users, Messages).
Additionally, the recently implemented hamburger menu does not meet premium UI/UX standards. It needs to be replaced with a high-quality navigation module adhering to `ui-ux-pro-max` guidelines for mobile navigation (e.g., proper touch targets, fluid animation, clear hierarchy).

## What Changes

- Update `Admin.tsx` to conditionally render tabs based on the user's role (`super_admin` vs `admin`).
- Restrict regular admins to: `catalog`, `payments`, `invoices`.
- Restrict Super Admins to all tabs.
- Redesign the mobile navigation menu in `Admin.tsx` and `Profile.tsx` using a premium drawer/bottom-sheet or bottom navigation pattern as recommended by the `ui-ux-pro-max` skill.

## Capabilities

### New Capabilities
- `admin-rbac`: Implementing role-based tab visibility in the admin panel.
- `premium-mobile-nav`: Implementing a high-quality mobile navigation drawer/menu.

### Modified Capabilities

## Impact

- `frontend/src/pages/Admin.tsx`: Navigation structure and tab rendering logic.
- `frontend/src/pages/Profile.tsx`: Mobile navigation menu redesign.
- User session state / Telegram Init Data parsing: Ensure user role is correctly identified on the client-side.
