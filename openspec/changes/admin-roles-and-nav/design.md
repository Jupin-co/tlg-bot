## Context

The telegram bot admin panel frontend currently exposes all administrative tabs to any user who has an admin role. The goal is to restrict regular admins to operational tasks (`catalog`, `payments`, `invoices`) and reserve the rest (`settings`, `users`, `messages`) for the `super_admin`.
Additionally, the navigation menu introduced in the previous iteration was not optimal. A premium mobile drawer implementation aligned with `ui-ux-pro-max` guidelines is required.

## Goals / Non-Goals

**Goals:**
- Only show `catalog`, `payments`, `invoices` tabs to regular admins.
- Show all tabs to super admins.
- Implement a premium mobile navigation drawer in both `Admin.tsx` and `Profile.tsx`.
- Ensure fluid motion and appropriate touch targets for the navigation drawer.

**Non-Goals:**
- Implementing a completely new state management library.
- Overhauling the backend API (this is a client-side routing/visibility constraint).

## Decisions

- **Role Checking:** The `userProfile` object (fetched on initial load) contains the user's ID/username. Wait, where is the role stored? We'll need to check the backend API response (`/api/auth` or `/api/admin/*`) or the initial context to determine the user's role. If the backend passes a `role: 'admin' | 'super_admin'`, we use that.
- **Drawer Implementation:** We will implement a full height side-drawer (sliding from the right or left) with a semi-transparent backdrop, ensuring mobile-first usability. The animation can be achieved using standard CSS transitions.

## Risks / Trade-offs

- **Security Risk:** Hiding tabs on the frontend doesn't prevent a malicious regular admin from hitting backend endpoints. 
  - *Mitigation:* The backend must enforce role checks on its endpoints (Settings, Users, Messages). We will assume the backend already does or will do this; this change focuses on UI.
- **State Complexity:** Managing the drawer state and click-outside behavior.
  - *Mitigation:* A simple full-screen absolute positioned overlay with an `onClick` handler to close the drawer will be used for stability and cross-device compatibility.
