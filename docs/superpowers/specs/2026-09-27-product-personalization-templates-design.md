# Product Personalization Templates Design

## Objective

Replace the Liverpool-specific personalization preview with a reusable jersey personalization system. Products explicitly declare whether they support personalization. Products in the same `groupId` share one visual template, while each SKU can independently enable or disable personalization.

The first migrated template is Liverpool FC 2026/27 Home. Existing name, number, sleeve badge placement, and the current supplied back image remain visually unchanged.

## Customer Rules

- A product without personalization enabled does not show the **Customize jersey** button.
- Enabling name and number printing requires both fields.
- A name contains 1–20 English letters only. Input accepts lowercase or uppercase and is stored and displayed as uppercase.
- Spaces, numbers, hyphens, apostrophes, accented characters, Thai characters, and other symbols are rejected.
- A number contains exactly one or two digits. It is stored as text so `0` and `00` remain distinct.
- A name costs ฿80 per letter.
- A one-digit number costs ฿350. A two-digit number costs ฿700.
- Sleeve badge prices remain: none ฿0, Premier League ฿450, and Premier League with No Room for Racism ฿850.
- Name/number printing can be disabled while a sleeve badge is selected.

For example, `SALAH 11` costs ฿400 for five letters plus ฿700 for a two-digit number. With a Premier League badge, the total customization price is ฿1,550.

## Data Model

### Product

Add these fields to each product:

```js
personalizationEnabled: Boolean
personalizationGroupId: String | null
```

`personalizationGroupId` normally matches the product's existing `groupId`. Keeping an explicit reference avoids making every grouped product personalizable by accident. A product is personalizable only when `personalizationEnabled` is true and its referenced template exists and is active.

### PersonalizationTemplate

Create a collection with this shape:

```js
{
  groupId: String, // unique
  active: Boolean,
  preview: {
    backImageUrl: String,
    viewBox: String,
    name: {
      x: Number,
      y: Number,
      fontFamily: String,
      fontSize: Number,
      fontWeight: Number,
      letterSpacing: Number,
      fill: String,
      stroke: String,
      strokeWidth: Number
    },
    number: {
      x: Number,
      y: Number,
      fontFamily: String,
      fontSize: Number,
      fontWeight: Number,
      letterSpacing: Number,
      fill: String,
      stroke: String,
      strokeWidth: Number
    },
    sleeveBadge: {
      enabled: Boolean,
      transform: String,
      clipPath: String,
      zoomViewBox: String
    }
  },
  sleeveBadgeOptions: [String]
}
```

Coordinates use the SVG template view box. This keeps product-specific placement in data and keeps the shared React component free of club or SKU checks. The server accepts only known font identifiers and sleeve badge identifiers; arbitrary markup, CSS, or URLs are not rendered as executable content.

## Frontend Architecture

### JerseyPersonalizationPreview

Replace `LiverpoolJerseyPreview` with a shared `JerseyPersonalizationPreview` component. It receives:

```js
{
  template,
  nameEnabled,
  name,
  number,
  sleeveBadge,
  sleeveZoom
}
```

It renders the template's back image and places name, number, and badge using the template coordinates. Text uses a fixed font size and natural glyph widths. It never uses `textLength` or stretches short names.

### PersonalizationModal

The modal loads the product's resolved personalization template. It shows only options supported by that template. Its price summary updates as the customer types:

```text
product price
+ name price
+ number price
+ sleeve badge price
= total per shirt
```

The client calculation is for immediate feedback only. The API response remains the source of truth for the price stored in the cart.

### Admin Inventory

The product form gains:

- **Allow personalization** toggle
- **Personalization group** selector

Template editing is a separate admin section because coordinates and preview assets are shared by multiple SKUs. The first version exposes structured fields for image URL, name position, number position, and sleeve badge position. It does not provide drag-and-drop editing.

## Server Pricing and Validation

Create one server-owned personalization pricing module:

```js
NAME_PRICE_PER_LETTER = 80
NUMBER_PRICE_BY_LENGTH = { 1: 350, 2: 700 }
```

The server normalizes a submitted name with `toUpperCase()` and validates the entire original input with `^[A-Z]{1,20}$`. Any internal or surrounding whitespace causes rejection and is never trimmed or collapsed into a valid value.

The server validates the number with `^\d{1,2}$` and preserves the original string. It then derives:

```js
namePrice = customName.length * 80
numberPrice = customNumber.length === 1 ? 350 : 700
customizationPrice = namePrice + numberPrice + badgePrice
unitPrice = product.price + customizationPrice
```

When name/number printing is disabled, `customName`, `customNumber`, `namePrice`, and `numberPrice` are cleared. A badge may remain selected.

The cart API ignores all prices supplied by the browser. It verifies that the product supports personalization, loads the active template, validates the requested options, and computes each price from server rules. COD and Stripe checkout recompute the price again from the product and saved choices before creating the order or Stripe line item.

## Cart and Order Snapshots

Cart and order items store:

```js
customName: String
customNumber: String | null
namePrice: Number
numberPrice: Number
sleeveBadge: String
badgePrice: Number
price: Number // final unit price including all customization
```

Cart item identity includes product, size, custom name, custom number, and sleeve badge. Two otherwise identical shirts with different personalization remain separate lines.

Orders preserve the calculated price fields as historical snapshots. Later changes to product or customization prices do not alter existing orders.

## API Responses and Failure Handling

- Product detail responses include the product flags and resolved template when personalization is enabled.
- A missing, inactive, or malformed template makes the product non-personalizable in the storefront.
- The server returns HTTP 400 for invalid letters, a missing name/number pair, invalid number length, unsupported badge, or personalization requested for a disabled product.
- If a template is disabled after an item entered a cart, checkout rejects the item and asks the customer to review the cart.
- Guest carts calculate a preview price locally, but merge into an account through the normal cart API so the server replaces it with an authoritative price.

## Migration and Compatibility

1. Create a Liverpool FC 2026/27 Home template from the current SVG positions and supplied back image.
2. Enable personalization and assign the template group to the supported Liverpool Home SKUs.
3. Leave every other existing product disabled.
4. Read legacy numeric `customNumber` values as strings when returning old cart or order data.
5. New writes store `customNumber` as a string. Existing orders remain readable without rewriting historical records.
6. Remove Liverpool name, season, SKU, and image filename detection after the migration is active.

## Verification

Automated checks cover:

- Product flags hide or expose customization correctly.
- Products in one group resolve the same template while disabled SKUs remain unavailable.
- Only 1–20 English letters pass name validation and lowercase is normalized.
- Name and number must be present together when printing is enabled.
- `I 7`, `SALAH 11`, `0`, and `00` produce the correct distinct display values and prices.
- Client-supplied prices are ignored.
- Cart lines separate different names, numbers, and badges.
- Guest cart merge is repriced by the server.
- COD and Stripe totals include name, number, and badge prices.
- Checkout rejects personalization when its product or template has been disabled.
- The shared preview renders fixed-width glyphs without stretching a one-letter name.

Browser verification covers the Liverpool template on desktop and mobile, including full-shirt and sleeve close-up views.
