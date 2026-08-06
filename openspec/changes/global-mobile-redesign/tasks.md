## 1. Design Tokens and Global Styles

- [x] 1.1 Update `frontend/src/index.css` to define central `ui-ux-pro-max` design tokens (colors, border-radius, shadows, spacing)
- [x] 1.2 Implement global micro-interaction CSS classes (e.g. `.card`, `.card:active`, `.btn:active`) in `index.css`
- [x] 1.3 Ensure `dir-auto` and `num-fix` are properly preserved while upgrading typography to premium fonts

## 2. Shared Components & Layout Updates

- [ ] 2.1 Refactor app-wide container wrappers to enforce safe areas and mobile padding
- [ ] 2.2 Standardize Button and Input styles across the application
- [ ] 2.3 Implement bottom navigation or wrap-based responsive grids for top-level tabs

## 3. Page Redesigns

- [ ] 3.1 Redesign `Admin.tsx` replacing any remaining tables with CSS grids and upgrading cards
- [ ] 3.2 Redesign `Profile.tsx` converting purchase history lists into premium visual feeds
- [ ] 3.3 Redesign `Catalog.tsx` updating product cards to support high-end aesthetics (shadows, distinct CTAs)
- [ ] 3.4 Redesign `InvoiceView.tsx` with mobile-first receipt/status views

## 4. Verification

- [ ] 4.1 Verify layouts on simulated mobile viewport (width < 640px)
- [ ] 4.2 Verify micro-animations are smooth and performant
- [ ] 4.3 Verify RTL text rendering is unaffected
