# Security model

## Trust boundaries
- Public: Customer pages, service listing, product listing
- Authenticated: Customer booking, checkout
- Admin: All management operations

## Authentication
- Convex Auth with password-based admin login
- Admin seed account created via seed script

## Authorization
- requireAdmin() helper checks authentication + admin role
- All admin mutations/queries enforce this check
- Public queries only return active, published data

## Data protection
- Paystack secret key only in Convex environment variables
- No secrets in client-side code
- Customer PII (email, phone) stored in Convex database
- Webhook HMAC signature verification for Paystack

## Payment security
- Server-side price validation (never trust frontend prices)
- Idempotent webhook processing (check reference before processing)
- Paystack transaction verification server-side
- Deposit percentage configured by admin, enforced server-side
