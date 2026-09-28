# Component Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make frontend React components easier to find by grouping them by feature and shared purpose without changing runtime behavior.

**Architecture:** Move components from `Zeta-Jersey-Store/src/components` into the approved responsibility folders and update imports in pages, `App.jsx`, admin, and moved components. Preserve filenames, exports, route ownership, and component internals.

**Tech Stack:** React, JSX, Vite, npm.

**Spec:** `docs/superpowers/specs/2026-09-28-component-organization-design.md`

## Global Constraints

- The initial refactor changes file locations and imports only; component internals are out of scope.
- Keep filenames and default/named exports unchanged.
- Do not add barrel files or path aliases.
- Pages stay under `src/pages`, admin screens stay under `src/admin`, and backend files are unaffected.
- Do not add or run automated tests; the user requested removal of test files.
- Run the frontend production build after each move batch and inspect unresolved old paths.

## Review Focus

- Imports inside moved components must resolve relative to their new folders; check using the production build.
- Imports from pages, `App.jsx`, and admin must use the new paths; search for old paths after each batch.
- Preserve named imports from `AuthLayout` and `RouteGuards`; confirm the production build resolves them.
- Preserve the existing `ProfilePages` component exports and all consumers when moving that directory.
- Windows path case can hide import mistakes; use exact new filenames and confirm Vite resolves every import.

---

## File Move Map

Move the following files without changing their contents other than import paths required by their new locations:

| Destination folder | Source files |
| --- | --- |
| `src/components/layout` | `Navbar.jsx`, `Footer.jsx`, `PromoBar.jsx`, `AuthLayout.jsx`, `SuccessLayout.jsx` |
| `src/components/navigation` | `UserMenu.jsx`, `GuestUserMenu.jsx`, `CartHoverMenu.jsx`, `RouteGuards.jsx` |
| `src/components/shared` | `Avatar.jsx`, `Field.jsx`, `FormError.jsx`, `PageHeader.jsx`, `Subscribe.jsx`, `Suggestion.jsx` |
| `src/components/catalog` | `Collections.jsx`, `HeroSection.jsx`, `LeagueCard.jsx`, `ProductCard.jsx`, `ProductDetail.jsx`, `ProductFilters.jsx`, `SizeGuideModal.jsx` |
| `src/components/cart` | `CartFeedback.jsx`, `CartFeedbackHost.jsx`, `CartItemCard.jsx` |
| `src/components/checkout` | `CheckOutItemCard.jsx`, `ThaiLocationFields.jsx`, `thai-address-autocomplete.jsx`, `thai-address-cascade-select.jsx` |
| `src/components/personalization` | `JerseyPersonalizationPreview.jsx`, `PersonalizationModal.jsx`, `SleeveBadge.jsx`, `SleeveBadgeDetails.jsx` |
| `src/components/profile` | Move all ten JSX files currently in `src/components/ProfilePages/` directly into this folder, preserving filenames |
| `src/components/reviews` | `ProductReviewComposer.jsx`, `ProductReviewSection.jsx`, `ReviewForm.jsx` |
| `src/components/auth` | `SocialButtons.jsx` |
| `src/components/wishlist` | `WishlistButton.jsx` |

### Task 1: Move shared, layout, navigation, and auth components

**Files:**
- Move files from the `layout`, `navigation`, `shared`, and `auth` rows above.
- Modify imports in all affected files under `src/pages`, `src/admin`, and `src` (including `App.jsx`).

**Interfaces:** Component exports and props remain unchanged.

- [x] Move the listed files into their destination folders, preserving filenames.
- [x] Update imports in application entry points and within the moved files; retain named imports from `AuthLayout` and `RouteGuards`.
- [x] Search `Zeta-Jersey-Store/src` for imports that still target the old root paths.
- [x] Run `npm run build` from `Zeta-Jersey-Store`; resolve any path errors without changing component behavior.

### Task 2: Move catalog, cart, checkout, personalization, reviews, and wishlist components

**Files:**
- Move files from the `catalog`, `cart`, `checkout`, `personalization`, `reviews`, and `wishlist` rows above.
- Modify imports in affected files under `src/pages`, `src/admin`, `src`, and the moved components themselves.

**Interfaces:** Component exports and props remain unchanged; the admin's personalization preview keeps its existing import contract.

- [x] Move the listed files into their destination folders, preserving filenames.
- [x] Update all imports to the new paths, including `PersonalizationTemplates.jsx` and pages that render product, checkout, cart, review, or wishlist components.
- [x] Search `Zeta-Jersey-Store/src` for imports that still target the old root paths.
- [x] Run `npm run build` from `Zeta-Jersey-Store`; resolve any path errors without changing component behavior.

### Task 3: Move profile components and close out the directory migration

**Files:**
- Move all ten files from `src/components/ProfilePages/` into `src/components/profile/`.
- Modify imports in `src/pages/ProfileBody.jsx` and any profile components that import one another.

**Interfaces:** Keep every profile component export unchanged.

- [x] Move the ten profile component files, preserving filenames.
- [x] Update internal profile imports and `ProfileBody.jsx` to `../components/profile/...`.
- [x] Search `Zeta-Jersey-Store/src` for `components/ProfilePages` and other moved component paths; confirm there are no stale imports.
- [x] Run `npm run build` from `Zeta-Jersey-Store` and inspect `git diff` to confirm only file locations and import paths changed.

## Self-Review

- Spec coverage: all eleven approved component folders and all current component files are included in the move map.
- Behavior and API constraints are carried into each task; no logic changes, new exports, dependencies, aliases, or barrel files are planned.
- Validation uses import searches and the production build only; automated tests are neither added nor run.
- Tasks follow dependency order: shared import paths first, feature components second, profile directory last.

