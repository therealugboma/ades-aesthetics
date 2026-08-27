# Brief analysis

- North star: Build a premium, production-ready beauty business platform for Ades Aesthetics that enables customers to book appointments, shop for products, and pay online.
- Paradigm: web
- Target platforms: Desktop, Mobile (responsive)
- Persistent data: yes
- Sensitive categories: payments (Paystack), customer PII, admin auth
- Proof environment: local (development), deployed target (production)

## Actors and measurable goals
- Customer: Browse services, book appointments with deposit payment, shop products, pay online
- Admin: Manage services, bookings, products, orders, gallery, settings, view payments

## Scope and non-goals
- In scope: Full booking flow, e-commerce, admin dashboard, Paystack payments
- Out of scope: Email notifications (future), shipping calculation (manual), mobile app

## Signature moments
- Multi-step booking wizard with real-time availability
- Smooth Paystack payment integration
- Admin calendar view for appointment management

## Supplied materials
- Implementation plan (provided by user)

## Constraints
- Nigerian Naira (NGN) currency
- Paystack for payments
- Convex for backend/database
- Next.js 14+ App Router

## Decision register
- Authentication: Convex Auth (ASSUMED - built into Convex)
- Deposit: 30% of service price (ASSUMED - admin configurable)
- Logo: Text-based "Ades Aesthetics" (ASSUMED - premium typography)
- Currency: NGN with kobo conversion for Paystack (ASSUMED)
- Email notifications: Not in initial build (ASSUMED)
- Shipping: No calculation, admin handles manually (ASSUMED)

## Open questions
1. Real Paystack API keys needed for payment testing
2. Convex project deployment needed for backend
3. WhatsApp number for contact integration
