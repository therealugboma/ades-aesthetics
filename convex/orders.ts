import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

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
  },
  handler: async (ctx, args) => {
    let totalAmount = 0;
    const orderItems: {
      productId: any;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !("isActive" in product) || !product.isActive) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }
      if (!("stock" in product) || product.stock < item.quantity) {
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
      if (product && "stock" in product) {
        await ctx.db.patch(item.productId, {
          stock: (product as any).stock - item.quantity,
        });
      }
    }

    const orderId = await ctx.db.insert("orders", {
      customerId: args.customerId,
      status: "pending",
      totalAmount,
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

    return orderId;
  },
});

export const list = query({
  args: {
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
    await requireAdmin(ctx);
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
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});
