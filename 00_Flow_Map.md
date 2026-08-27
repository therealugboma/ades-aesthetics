# Flow map

## Product outcome
Premium beauty business platform enabling appointment booking, product shopping, and admin management.

## Flow registry
| ID | Flow | Primary actor | Goal | Trigger | Success outcome | Entry flows | Exit flows | Depends on | Proof |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Browse & Discover | Customer | Explore services, gallery, products | Site visit | View business offerings | none | F2, F3, F6 | shared-foundation | Page renders with data |
| F2 | Book Appointment | Customer | Reserve time slot and pay deposit | "Book Now" click | Booking confirmed with payment | F1 | F4 | shared-foundation, services | Atomic 15-minute hold uses live availability and server price |
| F3 | Shop & Purchase | Customer | Buy beauty products online | "Add to Cart" | Order placed with payment | F1 | F4 | shared-foundation, products | Order created in DB |
| F4 | Payment Processing | System | Process Paystack payments | Checkout submission | Payment recorded, status updated | F2, F3 | none | shared-foundation | Reference, amount, and currency verified before finalization |
| F5 | Admin Auth | Admin | Access dashboard securely | Login | Dashboard accessible | none | F6-F10 | shared-foundation | Live, expiring admin session required by every management operation |
| F6 | Manage Services | Admin | CRUD services | Dashboard nav | Service updated | F5 | none | shared-foundation | Service in DB |
| F7 | Manage Bookings | Admin | View/update appointments | Dashboard nav | Booking status updated | F5 | none | shared-foundation | Status in DB |
| F8 | Manage Shop | Admin | CRUD products, manage orders | Dashboard nav | Product/order updated | F5 | none | shared-foundation | Product in DB |
| F9 | Business Settings | Admin | Configure business info | Dashboard nav | Settings saved | F5 | none | shared-foundation | Settings in DB |
| F10 | Gallery Management | Admin | Upload/manage portfolio | Dashboard nav | Gallery updated | F5 | none | shared-foundation | Images in DB |

## Dependency order
| Batch | Kind | Includes | Depends on |
|---|---|---|---|
| shared-foundation | shared | Schema, auth, utils, layout, components | none |
| flow-F1 | flow | Homepage, services listing, gallery, shop listing | shared-foundation |
| flow-F2 | flow | Booking wizard, availability | shared-foundation, F1 |
| flow-F3 | flow | Product detail, cart, checkout | shared-foundation, F1 |
| flow-F4 | flow | Paystack integration, webhooks | shared-foundation |
| flow-F5 | flow | Admin auth, layout | shared-foundation |
| flow-F6 | flow | Service management | F5 |
| flow-F7 | flow | Booking management, calendar | F5 |
| flow-F8 | flow | Product/order management | F5 |
| flow-F9 | flow | Settings management | F5 |
| flow-F10 | flow | Gallery management | F5 |

## Cross-flow edges
- F2 → F4: Booking triggers payment
- F3 → F4: Order triggers payment
- F4 → F7: Payment updates booking/order status via webhook
- F6 → F2: Service changes affect available bookings
- F8 → F3: Product changes affect shop availability
