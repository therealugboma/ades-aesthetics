import { NextRequest, NextResponse } from "next/server";

async function convexMutation(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(data.message || `Failed: ${path}`);
  }
  return data.value;
}

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
        { error: "Please enter valid customer details and cart quantities." },
        { status: 400 }
      );
    }

    const reference = `ADE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const fullName = customer.fullName.trim();
    const email = customer.email.trim().toLowerCase();
    const phone = customer.phone.trim();

    // 1. Find or create customer
    const customerId = await convexMutation("customers:getOrCreate", {
      name: fullName,
      email,
      phone,
    });

    // 2. Create order (validates stock + deducts)
    const order = (await convexMutation("orders:create", {
      customerId,
      items: items.map((item: { productId: string; quantity: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryAddress: "Arrange with customer via WhatsApp",
    })) as { orderId: string; totalAmount: number };

    // 3. Create pending payment record
    await convexMutation("payments:create", {
      reference,
      orderId: order.orderId,
      amount: order.totalAmount,
      currency: "NGN",
      metadata: JSON.stringify({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        deliveryMethod: "WhatsApp",
      }),
    });

    return NextResponse.json({ reference, amount: order.totalAmount });
  } catch (error) {
    console.error("Checkout failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Checkout failed. Please review your cart and try again." },
      { status: 500 }
    );
  }
}
