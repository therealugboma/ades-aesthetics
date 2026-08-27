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
    const { items, delivery, shippingFee, deliveryCost, subtotal, total } = await request.json();

    if (!items?.length || !delivery?.email || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reference = `ADE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const fullAddress = `${delivery.streetAddress}, ${delivery.lga}, ${delivery.state}${delivery.postalCode ? " " + delivery.postalCode : ""}`;

    // 1. Find or create customer
    const customerId = await convexMutation("customers:getOrCreate", {
      name: delivery.fullName,
      email: delivery.email,
      phone: delivery.phone,
    });

    // 2. Create order (validates stock + deducts)
    const orderId = await convexMutation("orders:create", {
      customerId,
      items: items.map((item: { productId: string; quantity: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryAddress: fullAddress,
      deliveryNotes: delivery.notes || undefined,
      deliveryFee: shippingFee,
      deliveryCost,
    });

    // 3. Create pending payment record
    await convexMutation("payments:create", {
      reference,
      orderId,
      amount: total,
      currency: "NGN",
      metadata: JSON.stringify({
        customerName: delivery.fullName,
        customerEmail: delivery.email,
        customerPhone: delivery.phone,
        deliveryAddress: fullAddress,
        subtotal,
        shippingFee,
        deliveryCost,
        total,
      }),
    });

    return NextResponse.json({ reference });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
