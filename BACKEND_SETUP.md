# Backend setup

## Stack
- Convex: Database, serverless functions, real-time subscriptions
- Paystack: Payment processing (Nigerian Naira)

## Environment variables

Next.js / Vercel:

- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Paystack public key exposed to the checkout widget
- `PAYSTACK_SECRET_KEY`: Paystack secret used only by route handlers
- `PAYMENT_FINALIZE_SECRET`: Random server-to-server secret shared with Convex
- `ADMIN_JWT_SECRET`: Long random value used to sign the HTTP-only admin cookie; required in production
- `NEXT_PUBLIC_SITE_URL`: Canonical public site URL (`https://www.adesaesthetics.store` in production)

Convex deployment:

- `PAYMENT_FINALIZE_SECRET`: Same random value used by the Next.js deployment; required to finalize verified payments
- `SEED_TOKEN`: Long random value required by the seed mutation

## Database schema
See convex/schema.ts for complete schema. Key tables:
- users, customers, services, appointments, payments
- products, productCategories, orders, orderItems
- galleryImages, blockedTimes, businessSettings, contactMessages

## Seed data
Configure `SEED_TOKEN` in the Convex deployment, then invoke `seed:seed` with matching
`seedToken`, `adminEmail`, and an `adminPassword` of at least 12 characters. The mutation
populates development data only when the settings table is empty:

- 7 sample services across nail/lash/brow categories
- 4 product categories with 8 products
- 9 gallery images
- Business settings (hours, deposit %, contact info)
- The administrator account supplied in the mutation arguments

## Booking activation

The Next.js app and Convex functions must be deployed together. The booking schema includes
expiring appointment holds, and payment finalization verifies the Paystack amount and currency
before confirming an appointment. Deploy the Convex schema/functions to the intended environment
before deploying the matching Next.js build.

## Product delivery

Product checkout charges only for the selected products. After Paystack confirms
the payment, the customer receives a prefilled WhatsApp link containing the
verified order reference, product quantities, and total. Delivery method and cost
are then agreed directly with Ades Aesthetics; there is no Sendbox dependency.
