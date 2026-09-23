# Admin dashboard demo

Run `npm run dev` from `Zeta-Jersey-Store`, then open `/admin`.

The supplied dashboard references are implemented as a frontend-only admin demo. Existing storefront and customer-account routes are preserved. The admin workspace intentionally does not require login or a backend yet so the controller/API work can be completed separately.

## Routes

- `/admin`: product/customer totals, sample paid revenue, recent activity and low-stock alerts from demo records.
- `/admin/inventory`: search, stock-status filtering, edit and confirmed deletion.
- `/admin/inventory/new` and `/admin/inventory/:id/edit`: product forms with unique SKU validation. Stock edits create adjustment history.
- `/admin/stock-movement`: searchable history and stock-in/out/adjustment entry; stock cannot become negative.
- `/admin/customers` (alias `/admin/users`): search, add, edit, delete and customer details. Registered user accounts are read-only.
- `/admin/orders`: order search, details and status editing.
- `/admin/tasks`: create tasks with priority/due date, change status and delete.
- `/admin/settings`: company details, currency, tax and notification preferences.

## Data and backend boundaries

The admin workspace uses the shared Zeta product mock at `src/data/products.json` through `src/admin/data.js`. Inventory seed records keep the same product ids, names, teams, prices, stock quantities and image metadata as the storefront mock. Edits are saved under localStorage key `zeta-admin-demo-v2` so the screens can be exercised without a backend. Customer, order, movement, task and settings records remain local demo records until shared fixtures or controllers are available.

Dashboard totals derive from demo records. Separate customer cards can be created and edited locally. Order status changes only update demo state. Currency changes formatting only, without converting amounts. Settings are local preferences.

When the assigned backend controller is ready, replace the store implementation behind `useAdminStore` and connect the existing form actions to those endpoints. Keep authentication and OAuth work with the teammate responsible for auth.

## Verification

Build and scoped ESLint checks pass. Repository-wide ESLint has 19 existing errors in unrelated profile, auth, cart and success-page files.

The frontend build and scoped ESLint checks pass. Backend controller/API integration tests should be added alongside the assigned controller work.

Browser-tested: product creation/editing, duplicate SKU rejection, low-stock status, overdraw rejection and stock history, customer creation/search/details, task creation/status, settings persistence, order details/status, and mobile navigation at 390px without page overflow.
