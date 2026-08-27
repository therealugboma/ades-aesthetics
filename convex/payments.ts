import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./helpers";
import { serviceSecretIsValid } from "./lib/payment";
import {
  PAYMENT_CLOSE_GRACE_MS,
  reservationCanFinalize,
} from "./lib/booking";

export const create = mutation({
  args: {
    reference: v.string(),
    amount: v.number(),
    currency: v.string(),
    appointmentId: v.optional(v.id("appointments")),
    orderId: v.optional(v.id("orders")),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if ((args.appointmentId ? 1 : 0) + (args.orderId ? 1 : 0) !== 1) {
      throw new Error("A payment must belong to exactly one appointment or order");
    }

    const existing = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();
    if (existing.length > 0) {
      throw new Error("Payment with this reference already exists");
    }

    let expectedAmount: number;
    if (args.appointmentId) {
      const appointment = await ctx.db.get(args.appointmentId);
      if (!appointment) throw new Error("Payment target not found");
      expectedAmount = appointment.depositAmount;
    } else if (args.orderId) {
      const order = await ctx.db.get(args.orderId);
      if (!order) throw new Error("Payment target not found");
      expectedAmount = order.totalAmount;
    } else {
      throw new Error("Payment target not found");
    }
    if (Math.round(args.amount * 100) !== Math.round(expectedAmount * 100)) {
      throw new ConvexError({
        code: "PAYMENT_AMOUNT_MISMATCH",
        message: "The payment amount does not match the server-calculated total.",
      });
    }

    return await ctx.db.insert("payments", {
      reference: args.reference,
      appointmentId: args.appointmentId,
      orderId: args.orderId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

type VerifiedPayment = {
  reference: string;
  amountKobo: number;
  currency: string;
  metadata?: string;
};

async function finalizePayment(ctx: MutationCtx, args: VerifiedPayment) {
  const existing = await ctx.db
    .query("payments")
    .withIndex("by_reference", (q) => q.eq("reference", args.reference))
    .collect();
  if (existing.length === 0) {
    throw new Error("Payment not found");
  }
  const payment = existing[0];
  if (
    Math.round(payment.amount * 100) !== Math.round(args.amountKobo) ||
    payment.currency.toUpperCase() !== args.currency.toUpperCase()
  ) {
    throw new ConvexError({
      code: "PAYMENT_AMOUNT_MISMATCH",
      message: "Paystack returned an amount that does not match this payment.",
    });
  }

  if (payment.status === "success") return payment._id;

  const updates: { status: "success"; metadata?: string } = {
    status: "success",
  };
  if (args.metadata !== undefined) {
    updates.metadata = args.metadata;
  }
  if (payment.appointmentId) {
    const appointment = await ctx.db.get(payment.appointmentId);
    if (!appointment || !reservationCanFinalize(appointment, Date.now())) {
      throw new ConvexError({
        code: "RESERVATION_EXPIRED",
        message:
          "This appointment reservation expired before payment confirmation.",
      });
    }
  }

  await ctx.db.patch(payment._id, updates);
  if (payment.appointmentId) {
    await ctx.db.patch(payment.appointmentId, {
      status: "confirmed",
      expiresAt: undefined,
    });
  }
  if (payment.orderId) {
    await ctx.db.patch(payment.orderId, { status: "paid" });
  }
  return payment._id;
}

export const finalizeVerified = mutation({
  args: {
    serviceSecret: v.string(),
    reference: v.string(),
    amountKobo: v.number(),
    currency: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (
      !serviceSecretIsValid(
        args.serviceSecret,
        process.env.PAYMENT_FINALIZE_SECRET
      )
    ) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Payment verification is not authorized.",
      });
    }
    return await finalizePayment(ctx, {
      reference: args.reference,
      amountKobo: args.amountKobo,
      currency: args.currency,
      metadata: args.metadata,
    });
  },
});

export const releaseReservation = mutation({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!payment || payment.status !== "pending" || !payment.appointmentId) {
      return { released: false };
    }

    const appointment = await ctx.db.get(payment.appointmentId);
    if (!appointment || appointment.status !== "pending") {
      return { released: false };
    }

    const now = Date.now();
    const graceExpiry = now + PAYMENT_CLOSE_GRACE_MS;
    const expiresAt = Math.min(appointment.expiresAt ?? graceExpiry, graceExpiry);
    await ctx.db.patch(payment._id, { status: "abandoned" });
    await ctx.db.patch(appointment._id, { expiresAt });
    return { released: true, expiresAt };
  },
});

export const getByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();
    return results[0] ?? null;
  },
});

export const getByReferenceWithOrder = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();
    const payment = results[0] ?? null;
    if (!payment) return null;

    let orderItems: number | null = null;
    if (payment.orderId) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", payment.orderId!))
        .collect();
      orderItems = items.reduce((sum, item) => sum + item.quantity, 0);
    }

    return {
      ...payment,
      orderItems,
    };
  },
});

export const list = query({
  args: {
    sessionToken: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("success"),
        v.literal("failed"),
        v.literal("abandoned")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    if (args.status) {
      return await ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("payments").order("desc").collect();
  },
});
