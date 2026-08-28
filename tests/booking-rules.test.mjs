import test from "node:test";
import assert from "node:assert/strict";

import {
  RESERVATION_TTL_MS,
  appointmentBlocksAvailability,
  createAvailableSlots,
  intervalsOverlapWithBuffer,
  reservationCanFinalize,
} from "../convex/lib/booking.ts";
import { serviceSecretIsValid } from "../convex/lib/payment.ts";

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
