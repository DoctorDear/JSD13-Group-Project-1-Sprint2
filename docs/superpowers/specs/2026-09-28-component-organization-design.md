# Component Organization Design

## Goal

Make the frontend's React components easier to find and maintain by grouping
them by responsibility. Preserve current rendering, behavior, public props,
data flow, and route ownership. The initial refactor changes file locations and
imports only; component internals are out of scope unless an import needs a
small path adjustment.

## Current state

Most of the frontend components live directly under
`Zeta-Jersey-Store/src/components`. Profile components are already grouped under
`components/ProfilePages`, while pages and admin screens have their own
directories. Components are imported directly by pages, `App.jsx`, and admin
screens. The repository's automated test files were removed at the user's
request, so this work must not recreate them.

## Structure

Organize components into folders by feature and shared purpose:

| Folder | Responsibility | Components |
| --- | --- | --- |
| `components/layout` | Site chrome and common page shells | Navbar, Footer, PromoBar, AuthLayout, SuccessLayout |
| `components/navigation` | Menus and route access boundaries | UserMenu, GuestUserMenu, CartHoverMenu, RouteGuards |
| `components/shared` | Small reusable UI without a single feature owner | Avatar, Field, FormError, PageHeader, Subscribe, Suggestion |
| `components/catalog` | Landing sections, league cards, product cards, filters, and detail presentation | Collections, HeroSection, LeagueCard, ProductCard, ProductDetail, ProductFilters, SizeGuideModal |
| `components/cart` | Cart feedback and cart line item presentation | CartFeedback, CartFeedbackHost, CartItemCard |
| `components/checkout` | Checkout-only item and Thai address inputs | CheckOutItemCard, ThaiLocationFields, thai-address-autocomplete, thai-address-cascade-select |
| `components/personalization` | Jersey print and sleeve-badge preview and controls | JerseyPersonalizationPreview, PersonalizationModal, SleeveBadge, SleeveBadgeDetails |
| `components/profile` | Profile dashboard and its sections | Existing `ProfilePages` components |
| `components/reviews` | Review composition and display | ProductReviewComposer, ProductReviewSection, ReviewForm |
| `components/auth` | Auth-specific social login controls | SocialButtons |
| `components/wishlist` | Wishlist interaction control | WishlistButton |

The existing `components/ProfilePages` directory moves to
`components/profile`. Page entry points stay under `src/pages`, admin screens
stay under `src/admin`, and backend files are unaffected. Keep filenames and
default/named exports unchanged. Do not add barrel files or path aliases in this
pass; direct imports make dependencies explicit and reduce unrelated tooling
changes.

## Other approaches considered

1. Keep a flat directory and use naming prefixes. This does not address the
   user's difficulty finding components.
2. Group by generic type such as `cards`, `forms`, and `modals`. This separates
   UI pieces that change together across one feature.
3. Group by feature, with a small shared folder. This is the selected approach;
   it keeps feature-owned pieces together and offers a clear place for truly
   reusable UI.

## Compatibility and validation

Update import paths across `src` while retaining component names, exports, and
runtime behavior. Do not edit CSS or JSX structure as part of file moves. After
each move batch, inspect unresolved imports and run the existing production
build. Automated tests must not be added or run because the user requested
removing test files. Before completion, confirm that no imports still point to
the old `components/ProfilePages` path and review the final diff for accidental
logic changes.

## Scope

This is a source organization change. It does not split oversized components,
change component APIs, alter page routes, introduce new dependencies, or modify
the server. If implementation reveals that a component has multiple feature
owners or moving it requires a behavior change, pause and revise this design
with the user before proceeding.
