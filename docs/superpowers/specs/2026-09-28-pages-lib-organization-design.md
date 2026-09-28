# Pages and Lib Organization Design

## Goal

Make route components and frontend helper modules easier to locate by grouping
them around their route family or domain. Preserve URL paths, lazy-loading
boundaries, exports, imports' behavior, and data flow. This refactor moves files
and updates import paths only; it does not split files or change implementation
logic.

## Current state

`src/pages` contains 21 route-level JSX files in one directory. `src/lib`
contains 20 JavaScript utilities plus `heroImages.json`. Routes are declared in
`src/App.jsx`; utility modules are imported directly by pages, components,
hooks, contexts, services, admin screens, and `vite.config.js`. Components have
already been organized into feature folders, and the new paths should be used
where those components import lib modules.

## Structure

Group route components by the route families already declared in `App.jsx`:

| Folder | Responsibility | Page files |
| --- | --- | --- |
| `pages/store` | Public shop and order flow | LandingPage, AllProductsPage, ProductDetailPage, CartPage, CheckoutPage, OrderConfirmationPage |
| `pages/auth` | Login, registration, password, and email confirmation flow | Login, Register, ResetPassword, VerifyEmail, EmailConfirmation, ChangePassword, and their five `*Success` pages |
| `pages/account` | Signed-in profile and settings | Profile, ProfileBody, Settings |
| `pages/reviews` | Review submission route | SubmitReviewPage |

Group utilities by domain. Move `heroImages.json` to the existing `src/data`
directory because it is a static image manifest consumed by both the frontend
and Vite configuration, rather than a helper function.

| Folder | Responsibility | Utility files |
| --- | --- | --- |
| `lib/api` | API client and base URL | api.js, apiBase.js |
| `lib/catalog` | Product and landing catalog helpers | cardImage.js, landingCatalog.js, productCatalog.js |
| `lib/navigation` | Navigation items and return-path handling | navigation.js, loginReturnPath.js |
| `lib/personalization` | Jersey personalization and template choices | personalization.js, personalizationBreakdown.js, personalizationPreview.js, sleeveBadges.js, templateProductChoices.js |
| `lib/forms` | Product, profile, Thai address, and general validation | productForm.js, profileForm.js, thaizipAddress.js, validation.js |
| `lib/reviews` | Review eligibility and payload shaping | reviewEligibility.js, reviewPayload.js |
| `lib/wishlist` | Wishlist data helpers | wishlistModel.js |
| `lib/shared` | General-purpose class-name helpers | utils.js |
| `data` | Static data consumed by the app and build config | heroImages.json (moved from `lib`) |

Update all import paths across `src`, plus the root Vite config for
`heroImages.json`. Keep page route URLs and component exports unchanged. Do not
add aliases or barrel files. Keep `src/App.jsx` as the route registry and keep
the route-level files in `src/pages` subfolders.

## Other approaches considered

1. Keep `pages` and `lib` flat and rely on naming. This leaves the discovery
problem in place.
2. Group all page files and helpers into generic buckets such as `forms` or
   `utilities`. This hides which route family or domain owns each file.
3. Group pages by their existing route families and helpers by domain. This
   follows the current router and usage patterns with no runtime redesign; this
   is the selected approach.

## Compatibility and validation

Only move files and update imports; preserve all URLs, exports, and lazy route
loading. After each move batch, search for stale old paths and run the frontend
production build. Do not add or run automated tests because the user asked to
remove test files. Review the final diff for unintended logic changes and
confirm the Vite config resolves the relocated hero manifest.

## Scope

This is a frontend source organization change. It does not modify component
internals, API contracts, server files, route behavior, dependencies, or
business logic. If an import requires changing runtime behavior to move a file,
pause and revise this design with the user.
