## Context

The Telegram bot web interface currently uses desktop-centric layouts (horizontal scrolling tabs, wide data tables) which provide a subpar experience on mobile devices, the primary platform for Telegram Mini Apps. The goal is to completely redesign the frontend using a mobile-first philosophy, standardizing components and leveraging `ui-ux-pro-max` and `design-taste-frontend` principles for a premium aesthetic.

## Goals / Non-Goals

**Goals:**
- Create a unified design token system in `index.css`.
- Replace all `<table>` elements with responsive card grids.
- Implement mobile-friendly navigation (e.g., bottom navigation bars or responsive grids instead of horizontal scroll tabs).
- Introduce high-end styling (soft shadows, glassmorphism where appropriate, modern typography).
- Ensure all interactive elements have sufficient touch targets (minimum 44x44px).

**Non-Goals:**
- Changing backend API endpoints or database schemas.
- Adding entirely new features outside of redesigning the existing ones.

## Decisions

**1. Design Token System**
- **Decision:** Use raw CSS variables (`index.css`) rather than introducing a heavy framework like Tailwind if not already fully utilized, to maintain the current stack's simplicity while enforcing consistency. (If Tailwind is already in use, we will leverage it heavily with a strictly defined `tailwind.config.js`).
- **Rationale:** Ensures high-end customization without bloating the bundle.

**2. Mobile-First Layouts**
- **Decision:** Use CSS Grid for most collections.
- **Rationale:** Grid allows for easy 1-column layouts on mobile and 2- or 3-column layouts on larger screens. Tables are notoriously difficult to make responsive without horizontal scrolling.

**3. Animation Strategy**
- **Decision:** Implement subtle micro-interactions on buttons and cards (e.g., scale transforms on active/hover states).
- **Rationale:** Provides the "pro-max" premium feel requested by the user.

## Risks / Trade-offs

- **Risk:** High-end animations might cause performance issues on low-end Android devices in Telegram Mini App mode.
- **Mitigation:** Use strictly hardware-accelerated CSS properties (`transform`, `opacity`) and avoid animating expensive layout properties (`width`, `height`, `margin`).
