import test from "node:test";
import assert from "node:assert/strict";

import {
  ORDER_RESERVATION_TTL_MS,
  normalizeCheckoutItems,
  orderReservationIsExpired,
} from "../convex/lib/order.ts";
import { getCheckoutFailure } from "../src/lib/checkout-errors.ts";

test("checkout combines duplicate product rows before validating stock", () => {
  assert.deepEqual(
    normalizeCheckoutItems([
      { productId: "product-1", quantity: 2 },
      { productId: "product-1", quantity: 3 },
      { productId: "product-2", quantity: 1 },
    ]),
    [
      { productId: "product-1", quantity: 5 },
      { productId: "product-2", quantity: 1 },
    ]
  );
});

test("checkout rejects non-positive and fractional quantities", () => {
  assert.throws(
    () => normalizeCheckoutItems([{ productId: "product-1", quantity: 0 }]),
    /whole number/i
  );
  assert.throws(
    () => normalizeCheckoutItems([{ productId: "product-1", quantity: 1.5 }]),
    /whole number/i
  );
});

test("pending product reservations expire after the checkout hold", () => {
  const now = Date.now();
  assert.equal(
    orderReservationIsExpired(
      { status: "pending", createdAt: now - 1_000 },
      now
    ),
    false
  );
  assert.equal(
    orderReservationIsExpired(
      { status: "pending", createdAt: now - ORDER_RESERVATION_TTL_MS - 1 },
      now
    ),
    true
  );
  assert.equal(
    orderReservationIsExpired({ status: "paid", createdAt: now }, now),
    false
  );
});

test("stock errors return a safe actionable response", () => {
  const failure = getCheckoutFailure({
    data: {
      code: "INSUFFICIENT_STOCK",
      message: "Only 2 Brow Gel are currently available.",
      productId: "product-1",
      availableStock: 2,
    },
  });

  assert.deepEqual(failure, {
    status: 409,
    body: {
      code: "INSUFFICIENT_STOCK",
      error: "Only 2 Brow Gel are currently available.",
      productId: "product-1",
      availableStock: 2,
    },
  });
});

test("unexpected checkout errors do not expose backend details", () => {
  assert.deepEqual(getCheckoutFailure(new Error("database internals")), {
    status: 500,
    body: {
      code: "CHECKOUT_FAILED",
      error: "Checkout failed. Please review your cart and try again.",
    },
  });
});
