# Pages and Lib Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the frontend's route pages and helper modules by route family and domain without changing behavior.

**Architecture:** Move the 21 route modules under `src/pages` into `store`, `auth`, `account`, and `reviews`; move the 20 JS helpers in `src/lib` into domain folders; move the hero manifest to existing `src/data`. Update all imports in `App.jsx`, `vite.config.js`, pages, components, hooks, contexts, services, and admin.

**Tech Stack:** React, JSX, Vite, JavaScript, JSON.

**Spec:** `docs/superpowers/specs/2026-09-28-pages-lib-organization-design.md`

## Global Constraints

- Move files and update import paths only; do not change implementation logic.
- Preserve all route URLs, exports, and lazy-loading boundaries.
- Do not add aliases or barrel files.
- Keep frontend pages under `src/pages`; backend and dependencies are unaffected.
- Do not add or run automated tests; the user requested removal of test files.
- Run the frontend production build after each move batch and search for stale paths.

## Review Focus

- Every `App.jsx` lazy import must retain its current component and route after page moves; verify with the build.
- Imports from pages, hooks, contexts, services, components, and admin must use new lib paths; search for old paths.
- `api.js` must still import its base URL normalizer; verify with the build.
- Form and personalization utilities import one another; check those relative paths after their move batch.
- Vite config and `HeroSection` / `cardImage` must resolve the relocated `heroImages.json`; verify with the build.

---

## File Move Map

| Destination | Source files |
| --- | --- |
| `src/pages/store` | LandingPage.jsx, AllProductsPage.jsx, ProductDetailPage.jsx, CartPage.jsx, CheckoutPage.jsx, OrderConfirmationPage.jsx |
| `src/pages/auth` | Login.jsx, Register.jsx, ResetPassword.jsx, VerifyEmail.jsx, EmailConfirmation.jsx, ChangePassword.jsx, RegisterSuccess.jsx, LoginSuccess.jsx, ResetPasswordSuccess.jsx, ChangePasswordSuccess.jsx, VerifyEmailSuccess.jsx |
| `src/pages/account` | Profile.jsx, ProfileBody.jsx, Settings.jsx |
| `src/pages/reviews` | SubmitReviewPage.jsx |
| `src/lib/api` | api.js, apiBase.js |
| `src/lib/catalog` | cardImage.js, landingCatalog.js, productCatalog.js |
| `src/lib/navigation` | navigation.js, loginReturnPath.js |
| `src/lib/reviews` | reviewEligibility.js, reviewPayload.js |
| `src/lib/wishlist` | wishlistModel.js |
| `src/lib/shared` | utils.js |
| `src/lib/forms` | productForm.js, profileForm.js, thaizipAddress.js, validation.js |
| `src/lib/personalization` | personalization.js, personalizationBreakdown.js, personalizationPreview.js, sleeveBadges.js, templateProductChoices.js |
| `src/data` | heroImages.json (move from `src/lib`) |

### Task 1: Group route-level pages

**Files:**
- Move all 21 files listed in the `src/pages` rows above.
- Modify `Zeta-Jersey-Store/src/App.jsx` and imports within moved pages.

**Interfaces:** Keep the lazy imports' default exports and every route path unchanged.

- [x] Create `pages/store`, `pages/auth`, `pages/account`, and `pages/reviews`; move each page to its mapped folder.
- [x] Update `App.jsx` imports to the new paths while preserving each lazy boundary and route URL.
- [x] Update any relative page-to-page imports, if present, without changing behavior.
- [x] Search `src` for stale root-level page imports.
- [x] Run `npm run build` from `Zeta-Jersey-Store`; resolve only import/path errors.

### Task 2: Group API, catalog, navigation, review, wishlist, and shared helpers

**Files:**
- Move the 11 helpers listed in `lib/api`, `lib/catalog`, `lib/navigation`, `lib/reviews`, `lib/wishlist`, and `lib/shared` above.
- Update imports in all consumers under `src`.

**Interfaces:** Keep named/default exports unchanged. `api.js` continues to use `apiBase.js`; `cardImage.js` retains its existing manifest import until Task 3 moves that file.

- [x] Create the six mapped `lib` folders and move the listed helper modules.
- [x] Update imports across components, pages, hooks, contexts, services, admin, and moved helpers.
- [x] Search `src` for stale root-level imports of the moved helpers.
- [x] Run `npm run build` from `Zeta-Jersey-Store`; resolve only import/path errors.

### Task 3: Group form and personalization helpers; move the hero manifest

**Files:**
- Move the nine helpers listed in `lib/forms` and `lib/personalization` above.
- Move `src/lib/heroImages.json` to `src/data/heroImages.json`.
- Update imports in consumers, including `vite.config.js`, `HeroSection.jsx`, and `cardImage.js`.

**Interfaces:** Preserve helper exports and JSON contents. `profileForm.js` continues to use Thai address validation; personalization helpers continue to share sleeve badge data.

- [x] Create `lib/forms`, `lib/personalization`, and the destination data path; move all ten files to their mapped paths.
- [x] Update all imports, including the build-time JSON import in `vite.config.js`.
- [x] Search `src` and `vite.config.js` for references to the old lib root paths and `lib/heroImages.json`.
- [x] Run `npm run build` from `Zeta-Jersey-Store` and inspect the diff for unintended logic or route changes.

## Self-Review

- Spec coverage: all 21 page files, 20 JavaScript helpers, and the hero manifest have an explicit destination.
- All routes and lazy boundaries are covered in Task 1; every known lib consumer type is included in Tasks 2 and 3.
- Tasks are ordered to keep page and utility imports resolvable at each build gate.
- Validation uses import searches and production builds only; automated tests are neither added nor run.


