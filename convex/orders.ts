import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./helpers";
import type { Id } from "./_generated/dataModel";
import {
  ORDER_RESERVATION_TTL_MS,
  normalizeCheckoutItems,
  releaseExpiredOrderReservations,
  releasePendingOrderReservation,
} from "./lib/order";

type ProductCheckoutErrorCode =
  | "INVALID_CART"
  | "PRODUCT_UNAVAILABLE"
  | "INSUFFICIENT_STOCK";

function checkoutError(
  code: ProductCheckoutErrorCode,
  message: string,
  details: { productId?: Id<"products">; availableStock?: number } = {}
): never {
  throw new ConvexError({ code, message, ...details });
}

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

export const releaseExpiredReservations = mutation({
  args: {},
  handler: async (ctx) => {
    return await releaseExpiredOrderReservations(ctx, Date.now());
  },
});

export const createCheckout = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const phone = args.phone.trim();
    if (
      !name ||
      !email ||
      !phone ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !args.reference.startsWith("ADE-")
    ) {
      checkoutError(
        "INVALID_CART",
        "Please enter valid customer details and try again."
      );
    }

    let normalizedItems;
    try {
      normalizedItems = normalizeCheckoutItems(args.items);
    } catch {
      checkoutError(
        "INVALID_CART",
        "Product quantities must be a positive whole number."
      );
    }
    if (normalizedItems.length === 0) {
      checkoutError("INVALID_CART", "Your cart is empty.");
    }

    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
    if (existingPayment) {
      checkoutError("INVALID_CART", "Please refresh and try checkout again.");
    }

    let totalAmount = 0;
    const orderItems: Array<{
      productId: Id<"products">;
      quantity: number;
      price: number;
      name: string;
    }> = [];

    for (const item of normalizedItems) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        checkoutError(
          "PRODUCT_UNAVAILABLE",
          "A product in your cart is no longer available.",
          { productId: item.productId, availableStock: 0 }
        );
      }
      if (product.stock < item.quantity) {
        const verb = product.stock === 1 ? "is" : "are";
        checkoutError(
          "INSUFFICIENT_STOCK",
          `Only ${product.stock} ${product.name} ${verb} currently available.`,
          { productId: item.productId, availableStock: product.stock }
        );
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
      });
    }

    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    let customerId: Id<"customers">;
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

    for (const item of orderItems) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        checkoutError(
          "PRODUCT_UNAVAILABLE",
          "A product in your cart is no longer available.",
          { productId: item.productId, availableStock: 0 }
        );
      }
      await ctx.db.patch(item.productId, {
        stock: product.stock - item.quantity,
      });
    }

    const expiresAt = now + ORDER_RESERVATION_TTL_MS;
    const orderId = await ctx.db.insert("orders", {
      customerId,
      status: "pending",
      subtotal: totalAmount,
      totalAmount,
      deliveryAddress: "Arrange with customer via WhatsApp",
      expiresAt,
      createdAt: now,
    });

    for (const item of orderItems) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    await ctx.db.insert("payments", {
      reference: args.reference,
      orderId,
      amount: totalAmount,
      currency: "NGN",
      status: "pending",
      metadata: JSON.stringify({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryMethod: "WhatsApp",
        products: orderItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
      createdAt: now,
    });

    return { orderId, amount: totalAmount, expiresAt };
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
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (args.status === "cancelled" && order.status === "pending") {
      await releasePendingOrderReservation(ctx, args.orderId);
      return args.orderId;
    }
    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});
