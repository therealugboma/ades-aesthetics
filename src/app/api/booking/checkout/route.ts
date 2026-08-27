import { NextRequest, NextResponse } from "next/server";

async function convexMutation(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const result = await res.json();
  if (result.status !== "success") {
    throw new Error(result.message || `Failed: ${path}`);
  }
  return result.value;
}

async function convexQuery(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const result = await res.json();
  if (result.status !== "success") {
    throw new Error(result.message || `Failed: ${path}`);
  }
  return result.value;
}

export async function POST(request: NextRequest) {
  try {
    const { serviceId, servicePrice, date, time, name, email, phone, notes } =
      await request.json();

    if (!serviceId || !date || !time || !email || typeof servicePrice !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Find or create customer
    const customerId = await convexMutation("customers:getOrCreate", {
      name: name || email,
      email,
      phone: phone || "",
    });

    // 2. Create appointment (validates availability + block)
    const appointmentId = await convexMutation("appointments:create", {
      customerId,
      serviceId,
      date,
      time,
      notes,
    });

    // Deposit (30%)
    const depositAmount = Math.max(Math.round(servicePrice * 0.3), 1);
    const reference = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 3. Create pending payment record
    await convexMutation("payments:create", {
      reference,
      appointmentId,
      amount: depositAmount,
      currency: "NGN",
      metadata: JSON.stringify({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        appointmentId,
        totalAmount: servicePrice,
        depositAmount,
      }),
    });

    return NextResponse.json({
      reference,
      appointmentId,
      amount: depositAmount,
      email,
      customerName: name,
    });
  } catch (error) {
    console.error("Booking checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 500 }
    );
  }
}
