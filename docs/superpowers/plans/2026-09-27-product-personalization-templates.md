# Product Personalization Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Liverpool-only customizer with reusable group templates, explicit product eligibility, and server-owned pricing for names, numbers, and sleeve badges.

**Architecture:** MongoDB stores one `PersonalizationTemplate` per product group while each SKU independently opts in through `personalizationEnabled` and `personalizationGroupId`. Shared server functions resolve eligibility, normalize choices, and calculate authoritative unit prices for cart, COD, and Stripe; React consumes the resolved template through a generic SVG preview.

**Tech Stack:** React 19, Vite 8, SVG, Express 5, Mongoose 9, Stripe, Node test runner

**Spec:** `docs/superpowers/specs/2026-09-27-product-personalization-templates-design.md`

## Global Constraints

- Names contain 1–20 ASCII English letters (`A–Z`) only and are stored uppercase.
- Name and number printing requires both values; neither may be purchased alone.
- Names cost ฿80 per letter; one-digit numbers cost ฿350 and two-digit numbers cost ฿700.
- Numbers are stored as strings so `0` and `00` remain distinct.
- Sleeve badge prices stay at none ฿0, Premier League ฿450, and Premier League with No Room for Racism ฿850.
- The server ignores browser-supplied prices and recalculates cart, COD, and Stripe unit prices.
- Text uses fixed font size and natural glyph width; never use SVG `textLength` or glyph stretching.
- Products without an active referenced template do not offer personalization.
- Preserve all existing uncommitted work and migrate the current Liverpool FC 2026/27 Home visual values without changing its approved appearance.

## Review Focus

- A lowercase name such as `salah` becomes `SALAH`, while whitespace, accented text, Thai text, digits, hyphens, and apostrophes are rejected.
- Legacy numeric order values remain readable, while new `0` and `00` selections stay distinct through cart merge, checkout, cancellation, and restore.
- A product with `personalizationEnabled: true` but a missing, inactive, or mismatched group template behaves as non-personalizable and checkout rejects stale cart choices.
- Guest prices are treated as previews and replaced by the server when the cart merges into an account.
- Disabling a template between cart and checkout cannot create a COD or Stripe order at a stale customization price.

---

### Task 1: Template model, resolver, and protected API

**Files:**
- Create: `server/src/models/PersonalizationTemplate.model.js`
- Create: `server/src/lib/personalizationTemplate.js`
- Create: `server/src/controllers/personalizationTemplate.controller.js`
- Create: `server/src/controllers/personalizationTemplate.controller.test.js`
- Create: `server/src/routes/v1/personalizationTemplate.routes.js`
- Modify: `server/src/models/Product.model.js`
- Modify: `server/src/controllers/product.controller.js`
- Modify: `server/src/routes/v1/index.js`

**Interfaces:**
- Produces: `resolvePersonalizationTemplate(product) -> Promise<PersonalizationTemplate | null>`
- Produces: `GET /api/v1/personalization-templates/:groupId`
- Produces: admin-only `GET/POST/PATCH /api/v1/personalization-templates`
- Produces: product fields `personalizationEnabled: Boolean` and `personalizationGroupId: String | null`

- [ ] **Step 1: Write failing resolver and controller tests**

Cover one active matching template, disabled product, inactive template, missing template, mismatched group, public single-template read, and admin-only mutations. Assert product detail returns `personalizationTemplate` only when the resolver succeeds.

- [ ] **Step 2: Run the focused tests and confirm the missing model/resolver/API failures**

Run: `node --test src/controllers/personalizationTemplate.controller.test.js` from `server`

Expected: FAIL because the template model, resolver, and routes do not exist.

- [ ] **Step 3: Implement the Mongoose schema and `resolvePersonalizationTemplate(product)`**

Validate numeric SVG coordinates, a `viewBox`/`zoomViewBox` of four finite numbers, known font ID `barlow-condensed-900`, known badge IDs, and non-empty HTTPS or local image URLs. Store transforms as numeric fields (`x`, `y`, `rotate`, `skewY`, `scaleX`, `scaleY`) rather than executable SVG/CSS strings; convert the approved Liverpool values at the React boundary.

- [ ] **Step 4: Implement template controllers and routes**

Use `verifyToken` and `requireAdmin` for list/create/update routes. Keep one public read route for resolving an active group template. Update product detail to return the resolved template and return `null` when eligibility fails.

- [ ] **Step 5: Run focused tests, then the server suite**

Run: `node --test src/controllers/personalizationTemplate.controller.test.js`

Run: `npm test` from `server`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/PersonalizationTemplate.model.js server/src/lib/personalizationTemplate.js server/src/controllers/personalizationTemplate.controller.js server/src/controllers/personalizationTemplate.controller.test.js server/src/routes/v1/personalizationTemplate.routes.js server/src/models/Product.model.js server/src/controllers/product.controller.js server/src/routes/v1/index.js
git commit -m "feat: add product personalization templates"
```

### Task 2: Authoritative choice validation and price calculation

**Files:**
- Create: `server/src/lib/personalization.js`
- Create: `server/src/lib/personalization.test.js`
- Modify: `server/src/lib/sleeveBadges.js`

**Interfaces:**
- Consumes: `resolvePersonalizationTemplate(product)` from Task 1
- Produces: `pricePersonalization({ product, template, printEnabled, customName, customNumber, sleeveBadge }) -> { customName, customNumber, namePrice, numberPrice, sleeveBadge, badgePrice, customizationPrice, unitPrice } | null`

- [ ] **Step 1: Write failing table-driven pricing tests**

Assert literals for: `I/7` = ฿80 + ฿350; `SALAH/11` = ฿400 + ฿700; lowercase normalization; `0` versus `00`; no-print clearing name and number; badge-only selection; and final unit price including badge. Reject missing pairs, whitespace anywhere, accented/Thai/symbol/digit names, 21 letters, empty/three-digit/non-digit numbers, unsupported badges, and browser price fields.

- [ ] **Step 2: Run the focused test and confirm pricing is absent**

Run: `node --test src/lib/personalization.test.js` from `server`

Expected: FAIL because `pricePersonalization` does not exist.

- [ ] **Step 3: Implement `pricePersonalization` and consolidate badge validation**

Normalize with `toUpperCase()` only, validate raw name against `/^[A-Za-z]{1,20}$/`, validate number against `/^\d{1,2}$/`, and derive prices exclusively from server constants. Determine supported badges from the resolved template rather than Liverpool name/SKU detection.

- [ ] **Step 4: Run focused tests and the server suite**

Run: `node --test src/lib/personalization.test.js`

Run: `npm test` from `server`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/personalization.js server/src/lib/personalization.test.js server/src/lib/sleeveBadges.js
git commit -m "feat: calculate personalization prices"
```

### Task 3: Cart persistence, identity, and guest merge

**Files:**
- Modify: `server/src/models/User.model.js`
- Modify: `server/src/controllers/user.controller.js`
- Modify: `server/src/controllers/user.controller.test.js`
- Modify: `Zeta-Jersey-Store/src/lib/personalization.js`
- Modify: `Zeta-Jersey-Store/src/lib/personalization.test.js`
- Modify: `Zeta-Jersey-Store/src/services/guestCart.js`
- Modify: `Zeta-Jersey-Store/src/services/guestCart.test.js`

**Interfaces:**
- Consumes: `pricePersonalization(...)` from Task 2
- Produces: cart snapshots `customNumber: String | null`, `namePrice`, `numberPrice`, `badgePrice`, and final `price`
- Produces: frontend `preparePersonalization({ enabled, name, number, sleeveBadge, productPrice })`

- [ ] **Step 1: Write failing server cart tests**

Assert the API rejects personalization for disabled/missing-template products, ignores submitted prices, stores server price fields, keeps `0` and `00` separate, separates different personalization identities, rejects a missing name/number pair, and reprices a guest merge payload.

- [ ] **Step 2: Run the server cart tests and confirm the expected failures**

Run: `node --test src/controllers/user.controller.test.js` from `server`

Expected: FAIL on string numbers, eligibility, and name/number pricing.

- [ ] **Step 3: Update the cart schema and controller**

Change new `customNumber` writes to strings, add the three price snapshots, load the active template, call `pricePersonalization`, and include product/size/name/number/badge in cart-line identity. Coerce legacy numeric values to strings only when reading or comparing existing records.

- [ ] **Step 4: Write failing frontend helper and guest-cart tests**

Assert input filtering permits letters only, preserves `0`/`00`, requires both fields, calculates preview prices, separates guest lines, and sends choices without trusting the guest price on merge.

- [ ] **Step 5: Run frontend tests and confirm the expected failures**

Run: `node --test src/lib/personalization.test.js src/services/guestCart.test.js` from `Zeta-Jersey-Store`

Expected: FAIL on the new validation and price fields.

- [ ] **Step 6: Implement frontend normalization and guest-cart behavior**

Filter the controlled name input to ASCII letters before uppercasing, preserve number text, compute display-only prices, and forward only choices during account merge.

- [ ] **Step 7: Run both focused suites and commit**

Run: `node --test src/controllers/user.controller.test.js` from `server`

Run: `node --test src/lib/personalization.test.js src/services/guestCart.test.js` from `Zeta-Jersey-Store`

Expected: all focused tests PASS.

```bash
git add server/src/models/User.model.js server/src/controllers/user.controller.js server/src/controllers/user.controller.test.js Zeta-Jersey-Store/src/lib/personalization.js Zeta-Jersey-Store/src/lib/personalization.test.js Zeta-Jersey-Store/src/services/guestCart.js Zeta-Jersey-Store/src/services/guestCart.test.js
git commit -m "feat: persist priced jersey personalization"
```

### Task 4: COD, Stripe, cancellation, and order snapshots

**Files:**
- Modify: `server/src/models/Order.model.js`
- Modify: `server/src/controllers/order.controller.js`
- Modify: `server/src/controllers/order.controller.test.js`
- Modify: `server/src/controllers/stripe.controller.js`
- Modify: `server/src/controllers/stripe.controller.test.js`

**Interfaces:**
- Consumes: `pricePersonalization(...)` from Task 2
- Produces: immutable order item snapshots with string number and all three component prices

- [ ] **Step 1: Write failing COD and Stripe pricing tests**

Assert `SALAH/11` plus each badge creates the exact unit amount, tampered cart prices are ignored, a disabled template blocks checkout, and order snapshots include all component prices.

- [ ] **Step 2: Write failing Stripe restore tests**

Assert expired/failed checkout restores string `0` and `00` to separate matching cart lines with their price snapshots and does not merge different badges.

- [ ] **Step 3: Run checkout tests and confirm the pricing/restore failures**

Run: `node --test src/controllers/order.controller.test.js src/controllers/stripe.controller.test.js` from `server`

Expected: FAIL because checkout currently prices badges only and models cast numbers.

- [ ] **Step 4: Update order schema and both checkout paths**

Re-resolve the active template and call `pricePersonalization` immediately before stock reservation. Copy normalized choices and price fields into order/Stripe line items. Update cart removal and restore identity to compare normalized string numbers.

- [ ] **Step 5: Run focused tests and full server suite**

Run: `node --test src/controllers/order.controller.test.js src/controllers/stripe.controller.test.js`

Run: `npm test` from `server`

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/Order.model.js server/src/controllers/order.controller.js server/src/controllers/order.controller.test.js server/src/controllers/stripe.controller.js server/src/controllers/stripe.controller.test.js
git commit -m "feat: price customization during checkout"
```

### Task 5: Generic SVG preview and modal pricing UI

**Files:**
- Create: `Zeta-Jersey-Store/src/components/JerseyPersonalizationPreview.jsx`
- Modify: `Zeta-Jersey-Store/src/components/PersonalizationModal.jsx`
- Modify: `Zeta-Jersey-Store/src/components/ProductDetail.jsx`
- Modify: `Zeta-Jersey-Store/src/lib/personalizationPreview.js`
- Modify: `Zeta-Jersey-Store/src/lib/personalizationPreview.test.js`
- Delete after migration: `Zeta-Jersey-Store/src/components/LiverpoolJerseyPreview.jsx`

**Interfaces:**
- Consumes: resolved `product.personalizationTemplate` from Task 1
- Consumes: `preparePersonalization(...)` from Task 3
- Produces: `JerseyPersonalizationPreview({ template, printEnabled, name, number, sleeveBadge, sleeveZoom })`

- [ ] **Step 1: Write failing template resolution tests**

Assert product flags and resolved templates control button visibility, and no name/season/SKU/image regex enables customization. Assert a one-letter preview style contains no `textLength` and uses the template's fixed `fontSize`.

- [ ] **Step 2: Run frontend tests and confirm old Liverpool detection fails the contract**

Run: `node --test src/lib/personalizationPreview.test.js` from `Zeta-Jersey-Store`

Expected: FAIL because preview selection is still Liverpool-specific.

- [ ] **Step 3: Implement `JerseyPersonalizationPreview`**

Map validated numeric template fields to SVG attributes, retain the fabric filter, sleeve clipping, full-shirt/sleeve view switching, natural glyph width, and current Liverpool visual values including the user-adjusted name font size and sleeve visibility.

- [ ] **Step 4: Refactor the modal and product detail**

Render Customize only for an eligible resolved template. Filter name keystrokes/paste to letters, require the name/number pair on submit, preserve number strings, show separate name/number/badge rows, and display the final per-shirt total with `aria-live`.

- [ ] **Step 5: Run focused tests, lint, and build**

Run: `node --test src/lib/personalization.test.js src/lib/personalizationPreview.test.js src/services/guestCart.test.js`

Run: `npm run lint`

Run: `npm run build`

Expected: tests, lint, and build PASS.

- [ ] **Step 6: Commit**

```bash
git add Zeta-Jersey-Store/src/components/JerseyPersonalizationPreview.jsx Zeta-Jersey-Store/src/components/PersonalizationModal.jsx Zeta-Jersey-Store/src/components/ProductDetail.jsx Zeta-Jersey-Store/src/lib/personalizationPreview.js Zeta-Jersey-Store/src/lib/personalizationPreview.test.js Zeta-Jersey-Store/src/components/LiverpoolJerseyPreview.jsx
git commit -m "feat: render shared jersey personalization previews"
```

### Task 6: Admin product eligibility and template editor

**Files:**
- Create: `Zeta-Jersey-Store/src/admin/PersonalizationTemplates.jsx`
- Modify: `Zeta-Jersey-Store/src/admin/AdminApp.jsx`
- Modify: `Zeta-Jersey-Store/src/admin/Inventory.jsx`
- Modify: `Zeta-Jersey-Store/src/admin/useAdminStore.js`
- Modify: `Zeta-Jersey-Store/src/services/adminService.js`
- Modify: `Zeta-Jersey-Store/src/lib/productForm.js`
- Modify: `Zeta-Jersey-Store/src/lib/productForm.test.js`

**Interfaces:**
- Consumes: admin template API from Task 1
- Produces: product form payload fields `personalizationEnabled` and `personalizationGroupId`
- Produces: `/admin/personalization-templates` list/create/edit UI

- [ ] **Step 1: Write failing product-form validation tests**

Assert enabled products require a template group, disabled products clear it, and invalid group IDs or non-finite coordinate fields are rejected before API submission.

- [ ] **Step 2: Run the form tests and confirm missing validation**

Run: `node --test src/lib/productForm.test.js` from `Zeta-Jersey-Store`

Expected: FAIL on personalization fields.

- [ ] **Step 3: Add admin service/store support and product controls**

Load templates beside products/orders, normalize the two product fields, add an Allow personalization checkbox and template selector, and send explicit false/null values when disabled.

- [ ] **Step 4: Add structured template management UI**

Provide fields for group ID, active status, back image, view boxes, approved font ID, name/number styling, numeric badge transform/clip geometry, and supported badge options. Reuse `JerseyPersonalizationPreview` for a read-only live preview before save.

- [ ] **Step 5: Run frontend tests, lint, and build**

Run: `node --test src/lib/productForm.test.js`

Run: `npm run lint`

Run: `npm run build`

Expected: tests, lint, and build PASS.

- [ ] **Step 6: Commit**

```bash
git add Zeta-Jersey-Store/src/admin/PersonalizationTemplates.jsx Zeta-Jersey-Store/src/admin/AdminApp.jsx Zeta-Jersey-Store/src/admin/Inventory.jsx Zeta-Jersey-Store/src/admin/useAdminStore.js Zeta-Jersey-Store/src/services/adminService.js Zeta-Jersey-Store/src/lib/productForm.js Zeta-Jersey-Store/src/lib/productForm.test.js
git commit -m "feat: manage personalization templates"
```

### Task 7: Liverpool migration and downstream presentation

**Files:**
- Create: `server/src/scripts/seed-personalization-template.js`
- Modify: `server/package.json`
- Modify: `Zeta-Jersey-Store/src/components/CartItemCard.jsx`
- Modify: `Zeta-Jersey-Store/src/components/CheckOutItemCard.jsx`
- Modify: `Zeta-Jersey-Store/src/components/SleeveBadgeDetails.jsx`
- Modify: `Zeta-Jersey-Store/src/components/ProfilePages/OrderHistory.jsx`
- Modify: `Zeta-Jersey-Store/src/admin/Operations.jsx`

**Interfaces:**
- Consumes: template/model contracts and snapshot fields from Tasks 1–6
- Produces: idempotent `npm run seed:personalization` migration

- [ ] **Step 1: Write the idempotent migration and dry-run assertions**

The script upserts group `LFC-2627-HOME`, uses `/images/personalization/liverpool-home-26-27-back.jpeg`, and enables matching Liverpool Home SKUs. Export the migration function so a test can call it twice and assert one template and stable product flags. Seed these approved SVG values exactly:

```js
viewBox: [0, 0, 1000, 1000]
name: { x: 500, y: 255, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 3 }
number: { x: 500, y: 605, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900, letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 5 }
sleeveBadge: { x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032, zoomViewBox: [710, 175, 175, 310], clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z" }
```

- [ ] **Step 2: Update cart, checkout, order history, and admin order rows**

Show uppercase name, exact string number, sleeve badge label, component price breakdown, and final unit price. Handle legacy orders where component price fields or string numbers are absent.

- [ ] **Step 3: Run all automated verification**

Run: `npm test` from `server`

Run: `node --test` from `Zeta-Jersey-Store`

Run: `npm run lint` from `Zeta-Jersey-Store`

Run: `npm run build` from `Zeta-Jersey-Store`

Expected: all tests, lint, and build PASS.

- [ ] **Step 4: Verify the real flow in a browser**

Confirm on desktop and mobile: disabled products hide Customize; enabled Liverpool variants share one template; `I/7`, `SALAH/11`, `0`, and `00` keep natural text widths and exact prices; badge clipping works in both views; guest and signed-in cart totals match the modal; cart, checkout, and order history display the same choices and prices. Do not complete a real payment.

- [ ] **Step 5: Commit**

```bash
git add server/src/scripts/seed-personalization-template.js server/package.json Zeta-Jersey-Store/src/components/CartItemCard.jsx Zeta-Jersey-Store/src/components/CheckOutItemCard.jsx Zeta-Jersey-Store/src/components/SleeveBadgeDetails.jsx Zeta-Jersey-Store/src/components/ProfilePages/OrderHistory.jsx Zeta-Jersey-Store/src/admin/Operations.jsx
git commit -m "feat: migrate Liverpool personalization template"
```
