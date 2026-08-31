import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export const ORDER_RESERVATION_TTL_MS = 15 * 60 * 1000;

type CheckoutItem<ProductId extends string = string> = {
  productId: ProductId;
  quantity: number;
};

type OrderReservationState = {
  status: string;
  createdAt: number;
  expiresAt?: number;
};

export function normalizeCheckoutItems<ProductId extends string>(
  items: CheckoutItem<ProductId>[]
): CheckoutItem<ProductId>[] {
  const quantities = new Map<ProductId, number>();

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Product quantities must be a positive whole number.");
    }
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity
    );
  }

  return Array.from(quantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function orderReservationIsExpired(
  order: OrderReservationState,
  now: number
): boolean {
  if (order.status !== "pending") return false;
  const expiresAt = order.expiresAt ?? order.createdAt + ORDER_RESERVATION_TTL_MS;
  return expiresAt <= now;
}

export function orderReservationCanFinalize(order: OrderReservationState): boolean {
  return order.status === "pending" || order.status === "paid";
}

export async function releasePendingOrderReservation(
  ctx: MutationCtx,
  orderId: Id<"orders">
) {
  const order = await ctx.db.get(orderId);
  if (!order || order.status !== "pending") {
    return { released: false };
  }

  const items = await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

  for (const item of items) {
    const product = await ctx.db.get(item.productId);
    if (product) {
      await ctx.db.patch(product._id, { stock: product.stock + item.quantity });
    }
  }

  const payments = await ctx.db
    .query("payments")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();
  for (const payment of payments) {
    if (payment.status === "pending") {
      await ctx.db.patch(payment._id, { status: "abandoned" });
    }
  }

  await ctx.db.patch(orderId, {
    status: "cancelled",
    expiresAt: undefined,
  });
  return { released: true };
}

export async function releaseExpiredOrderReservations(
  ctx: MutationCtx,
  now: number
) {
  const pendingOrders = await ctx.db
    .query("orders")
    .withIndex("by_status", (q) => q.eq("status", "pending"))
    .collect();

  let released = 0;
  for (const order of pendingOrders) {
    if (!orderReservationIsExpired(order, now)) continue;
    const result = await releasePendingOrderReservation(ctx, order._id);
    if (result.released) released += 1;
  }
  return released;
}

export type OrderDocument = Doc<"orders">;
