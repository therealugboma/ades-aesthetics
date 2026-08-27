# Ades Aesthetics — Build Constitution

## Product truth
Premium beauty business platform for Ades Aesthetics in Lagos, Nigeria. Enables customers to book appointments, shop for products, and pay online. Admin dashboard for full business management.

## Stack
- Next.js 14+ App Router, TypeScript, Tailwind CSS
- Convex (backend, database, real-time)
- Paystack (Nigerian payments)
- Zustand (client cart state)

## Conflict hierarchy
current user instruction > repository constitution > security and data rules > flow contracts > backend and design references > individual flow notes > builder judgment

## Build order
1. Shared foundation (schema, auth, utils, layout)
2. Services & Booking flows
3. Shop & Order flows
4. Gallery flow
5. Admin dashboard
6. SEO & performance

## Security rules
- Server-side price validation for all payments
- HMAC signature verification for Paystack webhooks
- requireAdmin() check on all admin mutations/queries
- Idempotent webhook processing
- No secrets in client code

## Stop conditions
- Paystack payment activation requires real credentials
- Convex deployment requires project setup
- Production deployment requires user approval

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
