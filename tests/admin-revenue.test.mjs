import test from "node:test";
import assert from "node:assert/strict";

import { calculateAdminRevenue } from "../src/lib/admin-revenue.ts";

test("admin revenue separates successful bookings and product orders", () => {
  assert.deepEqual(
    calculateAdminRevenue([
      { status: "success", amount: 3600, appointmentId: "appointment-1" },
      { status: "success", amount: 12000, appointmentId: "appointment-2" },
      { status: "success", amount: 20000, orderId: "order-1" },
      { status: "pending", amount: 5000, orderId: "order-2" },
      { status: "failed", amount: 8000, appointmentId: "appointment-3" },
    ]),
    {
      bookingRevenue: 15600,
      orderRevenue: 20000,
      totalRevenue: 35600,
    }
  );
});

test("admin revenue ignores invalid and unrelated payment rows", () => {
  assert.deepEqual(
    calculateAdminRevenue([
      { status: "success", amount: Number.NaN, orderId: "order-1" },
      { status: "success", amount: 5000 },
    ]),
    { bookingRevenue: 0, orderRevenue: 0, totalRevenue: 0 }
  );
});
