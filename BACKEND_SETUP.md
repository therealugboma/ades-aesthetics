# Backend setup

## Stack
- Convex: Database, serverless functions, real-time subscriptions
- Paystack: Payment processing (Nigerian Naira)

## Environment variables
- NEXT_PUBLIC_CONVEX_URL: Convex deployment URL
- PAYSTACK_SECRET_KEY: Paystack API secret (server only)
- PAYSTACK_PUBLIC_KEY: Paystack public key (client)
- PAYSTACK_WEBHOOK_SECRET: HMAC secret for webhook verification

## Database schema
See convex/schema.ts for complete schema. Key tables:
- users, customers, services, appointments, payments
- products, productCategories, orders, orderItems
- galleryImages, blockedTimes, businessSettings, contactMessages

## Seed data
Run the seed mutation to populate development data:
- 7 sample services across nail/lash/brow categories
- 4 product categories with 8 products
- 9 gallery images
- Business settings (hours, deposit %, contact info)
- Admin user (admin@adesaesthetics.com)
