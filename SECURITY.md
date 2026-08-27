# Security model

## Trust boundaries
- Public: Customer pages, service listing, product listing
- Authenticated: Customer booking, checkout
- Admin: All management operations

## Authentication
- Password-based admin login creates a random, 24-hour server-side session
- The browser cookie is HTTP-only and signed with `ADMIN_JWT_SECRET`
- Production authentication fails closed when `ADMIN_JWT_SECRET` is missing
- Seed requests require the Convex-only `SEED_TOKEN`; there is no default admin password

## Authorization
- `requireAdmin()` rejects missing, invalid, expired, and non-admin sessions
- All admin mutations/queries enforce this check
- Admin upload actions verify the same session before issuing an upload URL
- Public queries only return active, published data

## Data protection
- Paystack secret key is server-only in the Next.js and Convex environments
- No secrets in client-side code
- Customer PII (email, phone) stored in Convex database
- Webhook HMAC signature verification for Paystack

## Payment security
- Server-side price validation (never trust frontend prices)
- Appointment and payment creation is atomic
- Unpaid appointment holds expire after 15 minutes; closing checkout shortens the hold to a two-minute payment-webhook grace period
- Late payment finalization cannot revive an expired or cancelled reservation
- Idempotent payment finalization checks the payment reference before processing
- Paystack transactions are reverified server-side, including exact amount and currency
- Deposit percentage configured by admin, enforced server-side
