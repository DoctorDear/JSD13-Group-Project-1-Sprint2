# Stripe-hosted checkout for Zeta Jersey Store

## Goal and scope

Customers can pay for an existing cart through Stripe Checkout in test mode, then see a trustworthy order state. Card payment is offered through Stripe; PromptPay is offered only when the connected Thai Stripe account supports it. Cash on Delivery (COD) remains available. The store never collects card details. This design covers local development and test payments, not production activation.

## Current behavior

The React checkout calls `POST /api/v1/orders`. The Express controller validates the cart, decrements `Product.quantity`, creates an order with pending payment, and clears the cart. The checkout currently presents Card, PromptPay, and COD, but all three submit to the same order endpoint and no Stripe payment occurs. The confirmation page can therefore appear for an unpaid card order.

## Chosen flow

Use Stripe-hosted Checkout. The server owns product prices and creates a Checkout Session. The browser redirects to the session URL. A verified Stripe webhook, not the browser return URL, determines whether payment succeeded. Keep the COD route on the existing order flow. Do not collect or store card data in this app.

1. Customer selects Card or PromptPay and submits shipping details. The frontend requests a new checkout session through an authenticated API endpoint with the chosen method and shipping address.
2. The server reloads the customer's cart and product records, validates availability, and atomically reserves stock by conditional decrement. It creates an order with a durable `awaiting_payment` state, item/price snapshots, reservation timestamp, and selected method. It creates a Stripe Checkout Session using server-derived THB line items and the order ID as metadata/client reference. The server saves the session ID and URL, then returns the URL. If session creation fails, it releases the reservation and marks the order failed or removes the provisional order in one consistent path.
3. The frontend redirects to Stripe Checkout. The return page retrieves the order from the API and displays `awaiting_payment` until a webhook confirms payment; it must never label a return as paid by itself. A cancel return shows the pending/cancelled state and allows a new attempt through a safe server endpoint.
4. The webhook receives the raw request body before Express JSON parsing, validates the Stripe signature, looks up the order by session ID, and makes an idempotent state transition. `checkout.session.completed` with `payment_status=paid` or `checkout.session.async_payment_succeeded` marks it paid and moves it to processing. `checkout.session.async_payment_failed` and `checkout.session.expired` release reserved stock once and mark the attempt failed/expired. A completed session with unpaid status stays pending until an asynchronous result arrives.
5. COD creates the order and decrements stock as today, with a clearly named COD payment method and pending collection status. It does not create a Stripe session.

## Data and API changes

- Extend the Order payment information with Stripe session ID, payment intent ID where present, and a small payment state (`awaiting_payment`, `paid`, `failed`, `expired`, or COD pending collection). Keep `paidAt` and amount snapshots. Store a reservation state/timestamp so stock can be released exactly once. Add a unique sparse index for Stripe session ID.
- Add an authenticated endpoint to create a Stripe Checkout Session from the cart. Never trust client-submitted item prices or total.
- Add a public webhook endpoint with Stripe signature verification. Mount it before `express.json()` in `server/src/server.js`. Reject unknown events safely and respond promptly.
- Add an authenticated endpoint or extend order detail lookup so the return page can fetch payment status. Ownership checks must apply to customer reads.
- Preserve current shipping fields, My Orders, and COD checkout behavior. Update labels so Card/PromptPay only appear when Stripe test configuration is available; show PromptPay only when enabled for the account or let Stripe determine supported methods and label the choice accordingly.

## Consistency and recovery

Reserve stock before creating the external session so two buyers cannot buy the last item. A reservation is released only on a verified terminal failure/expiration, and never after a paid transition. Use a stable idempotency key for session creation and an atomic order-state update for webhook retries and duplicate events. Do not re-decrement stock on webhook success. Clear the cart only after a session is successfully created; make the return page independent of cart state.

The webhook may be delayed or missed during local development. Add a reconciliation path for old pending orders that retrieves their Stripe Session/payment state before releasing stock. Do not expire an order solely from the browser leaving Checkout. Stripe's Checkout Session expiry should bound the reservation; test asynchronous methods separately. If DB and Stripe actions fail between steps, reconciliation must repair orders with missing session IDs or completed sessions not reflected locally.

## Configuration and security

Server-only `STRIPE_SECRET_KEY` (`sk_test_...`) and `STRIPE_WEBHOOK_SECRET` (`whsec_...`) live in ignored `server/.env`; add example variable names to an env example, not real values. Use Stripe CLI forwarding for local webhooks; its webhook signing secret differs from a Dashboard endpoint secret. A public frontend URL and API URL configure success/cancel redirects. Never send secret keys to Vite or commit them. Test mode cannot charge real money. PromptPay requires an eligible Thai Stripe account, THB, and Dashboard activation.

## Verification

- Automated server tests: server prices override client input; insufficient stock; session creation failure restores stock; authenticated ownership; valid/invalid webhook signatures; paid, delayed, failed, expired, duplicate, and out-of-order webhook events; no double release or double fulfillment.
- Frontend tests: Card/PromptPay redirects to Checkout; COD submits directly; cancel and success returns show server state; no false paid confirmation while webhook is pending.
- Manual test mode: complete a Stripe test card checkout, cancel a session, and test PromptPay if available. Forward webhooks locally and verify database order status, stock, and My Orders. Run project build/tests and `npm run dev` with the existing MongoDB connection.

## Open operational limitation

The Stripe account's country and payment-method settings determine whether PromptPay is available. Until test keys and a webhook signing secret are supplied locally, only COD can be exercised end to end.
