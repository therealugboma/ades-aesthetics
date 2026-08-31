import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getCheckoutFailure } from "@/lib/checkout-errors";

export async function POST(request: NextRequest) {
  try {
    const { items, customer } = await request.json();

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof customer?.fullName !== "string" ||
      typeof customer?.email !== "string" ||
      typeof customer?.phone !== "string" ||
      !customer.fullName.trim() ||
      !/^\S+@\S+\.\S+$/.test(customer.email.trim()) ||
      !customer.phone.trim() ||
      items.some(
        (item: { productId?: unknown; quantity?: unknown }) =>
          typeof item.productId !== "string" ||
          !Number.isInteger(item.quantity) ||
          Number(item.quantity) < 1
      )
    ) {
      return NextResponse.json(
        {
          code: "INVALID_CART",
          error: "Please enter valid customer details and cart quantities.",
        },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Convex not configured");

    const reference = `ADE-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    const convex = new ConvexHttpClient(url);

    // Cleanup is deliberately a separate transaction. It repairs expired
    // product holds even when the new cart later fails validation.
    await convex.mutation(api.orders.releaseExpiredReservations, {});
    const checkout = await convex.mutation(
      api.orders.createCheckout,
      {
        items: items.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId as Id<"products">,
          quantity: item.quantity,
        })),
        name: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        reference,
      }
    );

    return NextResponse.json({ reference, amount: checkout.amount });
  } catch (error) {
    const failure = getCheckoutFailure(error);
    console.error("Checkout failed", {
      code: failure.body.code,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
