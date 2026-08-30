import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const getOrCreate = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    if (existing.length > 0) {
      return existing[0]._id;
    }
    return await ctx.db.insert("customers", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    sessionToken: v.string(),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const limit = args.paginationOpts?.numItems ?? 50;
    let q = ctx.db.query("customers").order("desc");
    const cursor = args.paginationOpts?.cursor;
    if (cursor !== undefined) {
      q = q.filter((q) => q.lt(q.field("_creationTime"), cursor));
    }
    const customers = await q.take(limit);
    return {
      customers,
      cursor:
        customers.length === limit
          ? customers[customers.length - 1]._creationTime.toString()
          : null,
    };
  },
});

export const getById = query({
  args: { sessionToken: v.string(), id: v.id("customers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const customer = await ctx.db.get(args.id);
    if (!customer) throw new Error("Customer not found");
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_customer", (q) => q.eq("customerId", args.id))
      .order("desc")
      .collect();
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.id))
      .order("desc")
      .collect();
    return { ...customer, appointments, orders };
  },
});
