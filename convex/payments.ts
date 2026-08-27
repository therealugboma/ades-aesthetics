import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

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
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();
    if (existing.length > 0) {
      throw new Error("Payment with this reference already exists");
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

export const updateByReference = mutation({
  args: {
    reference: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("abandoned")
    ),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();
    if (existing.length === 0) {
      throw new Error("Payment not found");
    }
    const payment = existing[0];
    if (payment.status === "success" || payment.status === "failed") {
      return payment._id;
    }
    const updates: Record<string, any> = { status: args.status };
    if (args.metadata !== undefined) {
      updates.metadata = args.metadata;
    }
    await ctx.db.patch(payment._id, updates);
    if (args.status === "success") {
      if (payment.appointmentId) {
        await ctx.db.patch(payment.appointmentId, { status: "confirmed" });
      }
      if (payment.orderId) {
        await ctx.db.patch(payment.orderId, { status: "paid" });
      }
    }
    return payment._id;
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

export const list = query({
  args: {
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
    await requireAdmin(ctx);
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
