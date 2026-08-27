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
    const { items, delivery, shippingFee, total } = await request.json();

    if (!items?.length || !delivery?.email || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
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
    });

    // 3. Create payment record
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
        shippingFee,
      }),
    });

    // 4. Initialize Paystack transaction
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: delivery.email,
        amount: Math.round(total * 100),
        reference,
        currency: "NGN",
        metadata: {
          order_id: orderId,
          customer_name: delivery.fullName,
          customer_phone: delivery.phone,
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      return NextResponse.json({ error: paystackData.message || "Payment initialization failed" }, { status: 500 });
    }

    return NextResponse.json({
      access_code: paystackData.data.access_code,
      reference,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
