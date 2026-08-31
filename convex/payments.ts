import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./helpers";
import { mergePaymentMetadata, serviceSecretIsValid } from "./lib/payment";
import {
  APPOINTMENT_BUFFER_MINUTES,
  BUSINESS_CLOSING_MINUTES,
  BUSINESS_OPENING_MINUTES,
  PAYMENT_CLOSE_GRACE_MS,
  appointmentBlocksAvailability,
  bookingDateTimeMs,
  intervalsOverlapWithBuffer,
  isValidBookingDate,
  reservationCanFinalize,
  timeToMinutes,
} from "./lib/booking";
import {
  orderReservationCanFinalize,
  releasePendingOrderReservation,
} from "./lib/order";

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

function parsePaymentMetadata(value?: string) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function restoreVerifiedAppointment(
  ctx: MutationCtx,
  payment: {
    amount: number;
    metadata?: string;
  }
) {
  const metadata = parsePaymentMetadata(payment.metadata);
  const customerName = metadata.customerName;
  const customerEmail = metadata.customerEmail;
  const customerPhone = metadata.customerPhone;
  const serviceName = metadata.serviceName;
  const serviceOptionLabel = metadata.serviceOptionLabel;
  const date = metadata.date;
  const time = metadata.time;
  const totalAmount = metadata.totalAmount;
  const paymentOption = metadata.paymentOption === "full" ? "full" : "deposit";

  if (
    typeof customerName !== "string" ||
    typeof customerEmail !== "string" ||
    typeof customerPhone !== "string" ||
    typeof serviceName !== "string" ||
    typeof date !== "string" ||
    typeof time !== "string" ||
    typeof totalAmount !== "number" ||
    bookingDateTimeMs(date, time) <= Date.now()
  ) {
    throw new ConvexError({
      code: "RESERVATION_UNAVAILABLE",
      message: "This appointment cannot be restored automatically.",
    });
  }

  const service = (await ctx.db.query("services").collect()).find(
    (candidate) => candidate.name === serviceName && candidate.isActive
  );
  if (!service) {
    throw new ConvexError({
      code: "RESERVATION_UNAVAILABLE",
      message: "The booked service is no longer available.",
    });
  }

  const option =
    typeof serviceOptionLabel === "string"
      ? service.priceOptions?.find(
          (candidate) => candidate.label === serviceOptionLabel
        )
      : undefined;
  const verifiedServicePrice = option?.price ?? service.price;
  if (verifiedServicePrice !== totalAmount) {
    throw new ConvexError({
      code: "RESERVATION_UNAVAILABLE",
      message: "The original booking price cannot be verified.",
    });
  }

  const requestedStart = timeToMinutes(time);
  const requestedEnd = requestedStart + service.duration;
  if (
    !isValidBookingDate(date) ||
    !Number.isFinite(requestedStart) ||
    requestedStart < BUSINESS_OPENING_MINUTES ||
    requestedEnd > BUSINESS_CLOSING_MINUTES
  ) {
    throw new ConvexError({
      code: "RESERVATION_UNAVAILABLE",
      message: "The original appointment schedule cannot be verified.",
    });
  }
  const existingAppointments = await ctx.db
    .query("appointments")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();
  for (const appointment of existingAppointments) {
    if (!appointmentBlocksAvailability(appointment, Date.now())) continue;
    const existingService = await ctx.db.get(appointment.serviceId);
    if (!existingService) continue;
    const existingStart = timeToMinutes(appointment.time);
    if (
      intervalsOverlapWithBuffer(
        requestedStart,
        requestedEnd,
        existingStart,
        existingStart + existingService.duration
      )
    ) {
      throw new ConvexError({
        code: "RESERVATION_UNAVAILABLE",
        message: "The original appointment time is no longer available.",
      });
    }
  }

  const blockedTimes = await ctx.db
    .query("blockedTimes")
    .withIndex("by_date", (q) => q.eq("date", date))
    .collect();
  for (const blocked of blockedTimes) {
    if (
      intervalsOverlapWithBuffer(
        requestedStart,
        requestedEnd,
        timeToMinutes(blocked.startTime),
        timeToMinutes(blocked.endTime),
        APPOINTMENT_BUFFER_MINUTES
      )
    ) {
      throw new ConvexError({
        code: "RESERVATION_UNAVAILABLE",
        message: "The original appointment time is blocked.",
      });
    }
  }

  let customer = await ctx.db
    .query("customers")
    .withIndex("by_email", (q) => q.eq("email", customerEmail.toLowerCase()))
    .first();
  if (!customer) {
    const customerId = await ctx.db.insert("customers", {
      name: customerName,
      email: customerEmail.toLowerCase(),
      phone: customerPhone,
      createdAt: Date.now(),
    });
    customer = await ctx.db.get(customerId);
  }
  if (!customer) throw new Error("Could not restore booking customer");

  return await ctx.db.insert("appointments", {
    customerId: customer._id,
    serviceId: service._id,
    date,
    time,
    status: "confirmed",
    depositAmount: payment.amount,
    totalAmount,
    paymentOption,
    serviceOptionLabel:
      typeof serviceOptionLabel === "string" ? serviceOptionLabel : undefined,
    serviceOptionPrice: option?.price,
    notes: "Restored automatically after verified Paystack payment",
    createdAt: Date.now(),
  });
}

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

  const updates: {
    status: "success";
    metadata?: string;
    appointmentId?: typeof payment.appointmentId;
  } = {
    status: "success",
  };
  const mergedMetadata = mergePaymentMetadata(payment.metadata, args.metadata);
  if (mergedMetadata !== undefined) {
    updates.metadata = mergedMetadata;
  }
  let appointmentId = payment.appointmentId;
  if (appointmentId) {
    const appointment = await ctx.db.get(appointmentId);
    if (!appointment) {
      appointmentId = await restoreVerifiedAppointment(ctx, payment);
      updates.appointmentId = appointmentId;
    } else if (!reservationCanFinalize(appointment)) {
      throw new ConvexError({
        code: "RESERVATION_UNAVAILABLE",
        message: "This appointment can no longer be confirmed.",
      });
    }
  }
  if (payment.orderId) {
    const order = await ctx.db.get(payment.orderId);
    if (!order || !orderReservationCanFinalize(order)) {
      throw new ConvexError({
        code: "RESERVATION_UNAVAILABLE",
        message: "This order can no longer be completed.",
      });
    }
  }

  await ctx.db.patch(payment._id, updates);
  if (appointmentId) {
    await ctx.db.patch(appointmentId, {
      status: "confirmed",
      expiresAt: undefined,
    });
  }
  if (payment.orderId) {
    await ctx.db.patch(payment.orderId, {
      status: "paid",
      expiresAt: undefined,
    });
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

export const markReceiptEmailSent = mutation({
  args: {
    serviceSecret: v.string(),
    reference: v.string(),
    emailId: v.string(),
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
        message: "Receipt update is not authorized.",
      });
    }

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
    if (!payment || payment.status !== "success") {
      throw new Error("A successful payment is required before sending a receipt");
    }
    if (payment.receiptEmailSentAt) return payment._id;

    await ctx.db.patch(payment._id, {
      receiptEmailSentAt: Date.now(),
      receiptEmailId: args.emailId,
    });
    return payment._id;
  },
});

export const markOwnerOrderEmailSent = mutation({
  args: {
    serviceSecret: v.string(),
    reference: v.string(),
    emailId: v.string(),
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
        message: "Owner order notification update is not authorized.",
      });
    }

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
    if (!payment || payment.status !== "success" || !payment.orderId) {
      throw new Error(
        "A successful product payment is required before notifying the owner"
      );
    }
    if (payment.ownerOrderEmailSentAt) return payment._id;

    await ctx.db.patch(payment._id, {
      ownerOrderEmailSentAt: Date.now(),
      ownerOrderEmailId: args.emailId,
    });
    return payment._id;
  },
});

export const releaseReservation = mutation({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!payment || payment.status !== "pending") {
      return { released: false };
    }

    if (payment.orderId) {
      return await releasePendingOrderReservation(ctx, payment.orderId);
    }

    if (!payment.appointmentId) return { released: false };

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
    let appointmentStatus: string | null = null;
    let orderProducts: Array<{
      name: string;
      quantity: number;
      price: number;
    }> = [];
    if (payment.orderId) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", payment.orderId!))
        .collect();
      orderItems = items.reduce((sum, item) => sum + item.quantity, 0);
      orderProducts = (
        await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            if (!product || !("name" in product)) return null;
            return {
              name: product.name,
              quantity: item.quantity,
              price: item.price,
            };
          })
        )
      ).filter(
        (item): item is { name: string; quantity: number; price: number } =>
          item !== null
      );
    }
    if (payment.appointmentId) {
      const appointment = await ctx.db.get(payment.appointmentId);
      appointmentStatus = appointment?.status ?? null;
    }

    return {
      ...payment,
      appointmentStatus,
      orderItems,
      orderProducts,
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
