import test from "node:test";
import assert from "node:assert/strict";

import {
  RESERVATION_TTL_MS,
  appointmentBlocksAvailability,
  createAvailableSlots,
  intervalsOverlapWithBuffer,
  reservationCanFinalize,
} from "../convex/lib/booking.ts";
import {
  mergePaymentMetadata,
  serviceSecretIsValid,
} from "../convex/lib/payment.ts";
import { resolvePaystackAmounts } from "../src/lib/paystack-transaction.ts";

test("daily availability starts at 10:00 and services finish by 19:00", () => {
  const slots = createAvailableSlots({
    serviceDuration: 90,
    openingMinutes: 10 * 60,
    closingMinutes: 19 * 60,
    slotInterval: 30,
    bufferMinutes: 30,
    occupiedIntervals: [],
  });

  assert.equal(slots[0], "10:00");
  assert.equal(slots.at(-1), "17:30");
  assert.equal(slots.includes("09:30"), false);
  assert.equal(slots.includes("18:00"), false);
});

test("expired unpaid reservations stop blocking appointment slots", () => {
  const now = Date.UTC(2026, 7, 27, 12);

  assert.equal(
    appointmentBlocksAvailability(
      {
        status: "pending",
        createdAt: now - RESERVATION_TTL_MS - 1,
      },
      now
    ),
    false
  );
});

test("active unpaid reservations block the slot until their explicit expiry", () => {
  const now = Date.UTC(2026, 7, 27, 12);

  assert.equal(
    appointmentBlocksAvailability(
      {
        status: "pending",
        createdAt: now - RESERVATION_TTL_MS * 2,
        expiresAt: now + 1,
      },
      now
    ),
    true
  );
});

test("confirmed appointments block availability and cancelled ones do not", () => {
  const now = Date.UTC(2026, 7, 27, 12);

  assert.equal(
    appointmentBlocksAvailability({ status: "confirmed", createdAt: now }, now),
    true
  );
  assert.equal(
    appointmentBlocksAvailability({ status: "cancelled", createdAt: now }, now),
    false
  );
});

test("appointment overlap includes the configured turnaround buffer", () => {
  assert.equal(intervalsOverlapWithBuffer(10 * 60, 11 * 60, 11 * 60 + 29, 12 * 60), true);
  assert.equal(intervalsOverlapWithBuffer(10 * 60, 11 * 60, 11 * 60 + 30, 12 * 60), false);
});

test("available slot generation excludes conflicts and services that run past closing", () => {
  const slots = createAvailableSlots({
    serviceDuration: 60,
    openingMinutes: 9 * 60,
    closingMinutes: 11 * 60 + 30,
    slotInterval: 30,
    bufferMinutes: 30,
    occupiedIntervals: [{ start: 9 * 60, end: 10 * 60 }],
  });

  assert.deepEqual(slots, ["10:30"]);
});

test("verified payment finalization accepts pending reservations even after the hold expires", () => {
  const now = Date.now();
  assert.equal(
    reservationCanFinalize(
      { status: "pending", createdAt: now, expiresAt: now + 1 }
    ),
    true
  );
  assert.equal(
    reservationCanFinalize(
      { status: "pending", createdAt: now, expiresAt: now }
    ),
    true
  );
  assert.equal(
    reservationCanFinalize({ status: "cancelled", createdAt: now }),
    false
  );
  assert.equal(
    reservationCanFinalize({ status: "confirmed", createdAt: now }),
    true
  );
});

test("payment finalization requires the configured server-to-server secret", () => {
  assert.equal(serviceSecretIsValid("correct-secret", "correct-secret"), true);
  assert.equal(serviceSecretIsValid("wrong-secret", "correct-secret"), false);
  assert.equal(serviceSecretIsValid("correct-secret", undefined), false);
});

test("Paystack verification metadata does not erase checkout order details", () => {
  assert.deepEqual(
    JSON.parse(
      mergePaymentMetadata(
        JSON.stringify({ customerName: "Ada", channel: "checkout" }),
        JSON.stringify({ channel: "paystack" })
      )
    ),
    { customerName: "Ada", channel: "paystack" }
  );
  assert.equal(
    mergePaymentMetadata(JSON.stringify({ customerName: "Ada" }), "{}"),
    JSON.stringify({ customerName: "Ada" })
  );
});

test("Paystack customer-borne fees do not change the requested payment amount", () => {
  assert.deepEqual(
    resolvePaystackAmounts({
      amount: 375635,
      requested_amount: 360000,
      fees: 15635,
    }),
    {
      requestedAmountKobo: 360000,
      chargedAmountKobo: 375635,
      feesKobo: 15635,
    }
  );
});

test("Paystack amount validation remains safe without requested_amount", () => {
  assert.deepEqual(resolvePaystackAmounts({ amount: 360000 }), {
    requestedAmountKobo: 360000,
    chargedAmountKobo: 360000,
    feesKobo: 0,
  });

  assert.throws(
    () =>
      resolvePaystackAmounts({
        amount: 350000,
        requested_amount: 360000,
      }),
    /less than the requested amount/
  );
});
