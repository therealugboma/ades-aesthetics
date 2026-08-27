import { NextRequest, NextResponse } from "next/server";

async function convexQuery(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") return null;
  return data.value;
}

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const payment = await convexQuery("payments:getByReference", { reference: ref });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // If still pending, try verifying with Paystack
    if (payment.status === "pending") {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (secretKey) {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
          { headers: { Authorization: `Bearer ${secretKey}` } }
        );
        const verifyData = await verifyRes.json();
        if (verifyData.status && verifyData.data.status === "success") {
          // Update payment status
          const url = process.env.NEXT_PUBLIC_CONVEX_URL;
          await fetch(`${url}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "payments:updateByReference",
              args: {
                reference: ref,
                status: "success",
                metadata: JSON.stringify(verifyData.data.metadata || {}),
              },
            }),
          });
          payment.status = "success";
          payment.metadata = JSON.stringify(verifyData.data.metadata || {});
        }
      }
    }

    const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
    return NextResponse.json({
      payment: {
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        metadata,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
}
