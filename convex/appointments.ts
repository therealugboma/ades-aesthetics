import { query, mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./helpers";
import {
  APPOINTMENT_BUFFER_MINUTES,
  RESERVATION_TTL_MS,
  appointmentBlocksAvailability,
  bookingDateTimeMs,
  intervalsOverlapWithBuffer,
  isValidBookingDate,
  timeToMinutes,
} from "./lib/booking";

type BookingErrorCode =
  | "INVALID_BOOKING"
  | "SERVICE_UNAVAILABLE"
  | "SLOT_UNAVAILABLE";

function bookingError(code: BookingErrorCode, message: string): never {
  throw new ConvexError({ code, message });
}

function resolveServicePrice(
  service: {
    price: number;
    priceOptions?: Array<{ label: string; price: number }>;
  },
  requestedLabel?: string
) {
  const priceOptions = service.priceOptions ?? [];
  if (priceOptions.length === 0) {
    return { price: service.price, label: undefined };
  }

  const normalizedLabel = requestedLabel?.trim().toLowerCase();
  const selectedOption = priceOptions.find(
    (option) => option.label.trim().toLowerCase() === normalizedLabel
  );
  if (!selectedOption) {
    bookingError(
      "INVALID_BOOKING",
      "Please choose a valid service price option before continuing."
    );
  }

  return {
    price: selectedOption.price,
    label: selectedOption.label,
  };
}

async function validateSlot(
  ctx: MutationCtx,
  args: { serviceId: Id<"services">; date: string; time: string },
  now: number
) {
  const service = await ctx.db.get(args.serviceId);
  if (!service || !service.isActive) {
    bookingError("SERVICE_UNAVAILABLE", "This service is no longer available.");
  }

  const requestedStart = timeToMinutes(args.time);
  const requestedEnd = requestedStart + service.duration;
  if (
    !isValidBookingDate(args.date) ||
    !Number.isFinite(requestedStart) ||
    requestedStart % 30 !== 0 ||
    requestedStart < 9 * 60 ||
    requestedEnd > 19 * 60 ||
    bookingDateTimeMs(args.date, args.time) <= now
  ) {
    bookingError(
      "INVALID_BOOKING",
      "Please choose a valid future appointment time during business hours."
    );
  }

  const existingAppointments = await ctx.db
    .query("appointments")
    .withIndex("by_date", (q) => q.eq("date", args.date))
    .collect();

  for (const appointment of existingAppointments) {
    if (!appointmentBlocksAvailability(appointment, now)) continue;
    const appointmentService = await ctx.db.get(appointment.serviceId);
    if (!appointmentService) continue;

    const appointmentStart = timeToMinutes(appointment.time);
    const appointmentEnd = appointmentStart + appointmentService.duration;
    if (
      intervalsOverlapWithBuffer(
        requestedStart,
        requestedEnd,
        appointmentStart,
        appointmentEnd
      )
    ) {
      bookingError(
        "SLOT_UNAVAILABLE",
        "That time was just booked. Please choose another available time."
      );
    }
  }

  const blockedTimes = await ctx.db
    .query("blockedTimes")
    .withIndex("by_date", (q) => q.eq("date", args.date))
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
      bookingError(
        "SLOT_UNAVAILABLE",
        "That time is unavailable. Please choose another available time."
      );
    }
  }

  return service;
}

export const create = mutation({
  args: {
    sessionToken: v.string(),
    customerId: v.id("customers"),
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    serviceOptionLabel: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const now = Date.now();
    const service = await validateSlot(ctx, args, now);
    const selectedPricing = resolveServicePrice(service, args.serviceOptionLabel);

    const depositPercentage = await getSetting(ctx, "deposit_percentage");
    const depositAmount = Math.max(
      Math.round(selectedPricing.price * (parseFloat(depositPercentage) / 100)),
      1
    );

    return await ctx.db.insert("appointments", {
      customerId: args.customerId,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      status: "pending",
      depositAmount,
      totalAmount: selectedPricing.price,
      serviceOptionLabel: selectedPricing.label,
      serviceOptionPrice: selectedPricing.label ? selectedPricing.price : undefined,
      notes: args.notes,
      expiresAt: now + RESERVATION_TTL_MS,
      createdAt: now,
    });
  },
});

export const createCheckout = mutation({
  args: {
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    serviceOptionLabel: v.optional(v.string()),
    notes: v.optional(v.string()),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const phone = args.phone.trim();
    if (!name || !email || !phone || !/^\S+@\S+\.\S+$/.test(email)) {
      bookingError(
        "INVALID_BOOKING",
        "Please enter a valid name, email address, and phone number."
      );
    }

    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
    if (existingPayment) {
      bookingError("INVALID_BOOKING", "Please refresh and try your booking again.");
    }

    const service = await validateSlot(ctx, args, now);
    const selectedPricing = resolveServicePrice(service, args.serviceOptionLabel);
    const depositSetting = Number(await getSetting(ctx, "deposit_percentage"));
    if (!Number.isFinite(depositSetting) || depositSetting <= 0 || depositSetting > 100) {
      throw new Error("Invalid deposit_percentage business setting");
    }

    const depositAmount = Math.max(
      Math.round(selectedPricing.price * (depositSetting / 100)),
      1
    );

    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer._id;
      await ctx.db.patch(customerId, { name, phone });
    } else {
      customerId = await ctx.db.insert("customers", {
        name,
        email,
        phone,
        createdAt: now,
      });
    }

    const expiresAt = now + RESERVATION_TTL_MS;
    const appointmentId = await ctx.db.insert("appointments", {
      customerId,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      status: "pending",
      depositAmount,
      totalAmount: selectedPricing.price,
      serviceOptionLabel: selectedPricing.label,
      serviceOptionPrice: selectedPricing.label ? selectedPricing.price : undefined,
      notes: args.notes?.trim() || undefined,
      expiresAt,
      createdAt: now,
    });

    await ctx.db.insert("payments", {
      reference: args.reference,
      appointmentId,
      amount: depositAmount,
      currency: "NGN",
      status: "pending",
      metadata: JSON.stringify({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        appointmentId,
        totalAmount: selectedPricing.price,
        depositAmount,
        depositPercentage: depositSetting,
        serviceName: service.name,
        serviceOptionLabel: selectedPricing.label,
        date: args.date,
        time: args.time,
      }),
      createdAt: now,
    });

    return {
      appointmentId,
      amount: depositAmount,
      totalAmount: selectedPricing.price,
      depositPercentage: depositSetting,
      expiresAt,
    };
  },
});

export const list = query({
  args: {
    sessionToken: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("no_show")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    let appointments;
    if (args.status) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .order("desc")
        .collect();
    }
    if (args.startDate) {
      appointments = appointments.filter((a) => a.date >= args.startDate!);
    }
    if (args.endDate) {
      appointments = appointments.filter((a) => a.date <= args.endDate!);
    }
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const customer = await ctx.db.get(apt.customerId);
        const service = await ctx.db.get(apt.serviceId);
        return { ...apt, customer, service };
      })
    );
    return enriched;
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

export const getByDate = query({
  args: { sessionToken: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .order("asc")
      .collect();
    return Promise.all(
      appointments.map(async (apt) => {
        const customer = await ctx.db.get(apt.customerId);
        const service = await ctx.db.get(apt.serviceId);
        return { ...apt, customer, service };
      })
    );
  },
});

async function getSetting(ctx: MutationCtx, key: string): Promise<string> {
  const results = await ctx.db
    .query("businessSettings")
    .withIndex("by_key", (q) => q.eq("key", key))
    .collect();
  if (results.length === 0) throw new Error(`Setting "${key}" not found`);
  return results[0].value;
}
