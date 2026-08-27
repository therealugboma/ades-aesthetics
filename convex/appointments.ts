import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      throw new Error("Service not found or inactive");
    }

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const requestedStart = timeToMinutes(args.time);
    const requestedEnd = requestedStart + service.duration;

    for (const apt of existingAppointments) {
      if (apt.status === "cancelled") continue;
      const aptService = await ctx.db.get(apt.serviceId);
      if (!aptService) continue;
      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + aptService.duration;
      const buffer = 30;
      if (requestedStart < aptEnd + buffer && requestedEnd > aptStart - buffer) {
        throw new Error("This time slot is not available. Please try a different time or date. TEST123");
      }
    }

    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    for (const blocked of blockedTimes) {
      const blockedStart = timeToMinutes(blocked.startTime);
      const blockedEnd = timeToMinutes(blocked.endTime);
      if (requestedStart < blockedEnd && requestedEnd > blockedStart) {
        throw new Error("This time slot is blocked. Please try a different time or date.");
      }
    }

    const depositPercentage = await getSetting(ctx, "deposit_percentage");
    const depositAmount = service.price * (parseFloat(depositPercentage) / 100);

    return await ctx.db.insert("appointments", {
      customerId: args.customerId,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      status: "pending",
      depositAmount,
      totalAmount: service.price,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
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

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function getSetting(ctx: any, key: string): Promise<string> {
  const results = await ctx.db
    .query("businessSettings")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .collect();
  if (results.length === 0) throw new Error(`Setting "${key}" not found`);
  return results[0].value;
}
