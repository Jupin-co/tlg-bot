## 1. Role-Based Access Control

- [x] 1.1 Extract user role from frontend context/auth initialization
- [x] 1.2 Modify `Admin.tsx` tab data structure to conditionally include `settings`, `users`, and `messages` tabs based on role
- [x] 1.3 Ensure `Admin.tsx` defaults to `catalog` and handles edge cases where an invalid tab might be set

## 2. Navigation Redesign

- [x] 2.1 Refactor the `isMenuOpen` overlay in `Admin.tsx` into a proper side-drawer/bottom-sheet pattern using standard CSS transitions
- [x] 2.2 Replicate the navigation redesign in `Profile.tsx` for consistency
- [x] 2.3 Verify the new navigation respects safe touch targets and behaves smoothly on mobile
