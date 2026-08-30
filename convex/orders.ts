import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";
import type { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    deliveryAddress: v.string(),
    deliveryNotes: v.optional(v.string()),
    deliveryFee: v.optional(v.number()),
    deliveryCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let totalAmount = 0;
    const orderItems: {
      productId: Id<"products">;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock - item.quantity,
        });
      }
    }

    const orderId = await ctx.db.insert("orders", {
      customerId: args.customerId,
      status: "pending",
      subtotal: totalAmount,
      deliveryFee: args.deliveryFee,
      deliveryCost: args.deliveryCost,
      totalAmount: totalAmount + (args.deliveryFee ?? 0),
      deliveryAddress: args.deliveryAddress,
      deliveryNotes: args.deliveryNotes,
      createdAt: Date.now(),
    });

    for (const item of orderItems) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return { orderId, totalAmount };
  },
});

export const list = query({
  args: {
    sessionToken: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const getById = query({
  args: { sessionToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
    const customer = await ctx.db.get(order.customerId);
    return { ...order, items, customer };
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.string(),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});
