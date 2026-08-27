# Build agent — Ades Aesthetics

## mandate
Build a premium, production-ready beauty business platform. Customers book appointments and shop products. Admins manage everything via dashboard.

## Required reading
- AGENTS.md (constitution)
- convex/schema.ts (data model)
- SECURITY.md (security rules)
- BACKEND_SETUP.md (backend config)

## Conflict hierarchy
current user instruction > repository constitution > security and data rules > flow contracts > backend and design references > individual flow notes > builder judgment

## Dependency order
1. Shared foundation (schema, auth, utils, layout components)
2. Services & Booking (service listing, booking wizard, availability)
3. Shop & Order (product listing, cart, checkout, Paystack)
4. Gallery (image gallery with filtering)
5. Admin dashboard (all management pages)
6. SEO & performance (sitemap, robots, metadata)

## Per-flow loop
1. Re-read the flow contract and seams
2. Write failing test or verify existing behavior
3. Build through interfaces
4. Implement every state (loading, empty, error, success)
5. Wire every action
6. Run security pass
7. Run accessibility check
8. Verify: lint, typecheck, build
9. Capture proof

## Security requirements
- Server-side price validation for payments
- HMAC webhook verification
- requireAdmin() on all admin operations
- No secrets in client code
- Idempotent webhook processing

## Backend activation
- Convex: Run `npx convex dev` for local development
- Paystack: Use test keys during development
- Seed data: Run seed mutation for dev data

## Stop conditions
- Stop for missing credentials
- Stop for production deployment without approval
- Stop for payment activation without real keys
- Stop for DNS changes
