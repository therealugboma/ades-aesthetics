# Context glossary

## Domain terms
- Service: A beauty service offered (nails, lashes, brows, skin)
- Appointment: A booked time slot for a service
- Deposit: Percentage of service price paid upfront to confirm booking
- Product: Physical beauty product for sale in the shop
- Order: A purchase of one or more products
- Gallery: Portfolio images showcasing work
- Blocked Time: Period admin has blocked on the calendar

## Lifecycle states
- Appointment: pending → confirmed → completed | cancelled | no_show
- Order: pending → paid → processing → shipped → delivered | cancelled
- Payment: pending → success | failed | abandoned

## Actors
- Customer: Books appointments, shops products
- Admin: Manages all business operations
- Staff: Limited admin access (future)
