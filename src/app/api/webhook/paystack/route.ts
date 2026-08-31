import { createHmac, timingSafeEqual } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import {
  getPaymentFinalizeSecret,
  verifyPaystackTransaction,
} from "@/lib/paystack-server";

function validSignature(body: string, signature: string, secret: string) {
  const expected = Buffer.from(
    createHmac("sha512", secret).update(body).digest("hex"),
    "hex"
  );
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();
    if (!validSignature(body, signature, secretKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body) as {
      event?: string;
      data?: { reference?: string };
    };
    if (event.event === "charge.success" && event.data?.reference) {
      const url = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!url) throw new Error("Convex not configured");
      const transaction = await verifyPaystackTransaction(event.data.reference);
      if (transaction.status !== "success") {
        throw new Error("Paystack transaction is not successful");
      }
      await new ConvexHttpClient(url).mutation(api.payments.finalizeVerified, {
        serviceSecret: getPaymentFinalizeSecret(),
        reference: event.data.reference,
        amountKobo: transaction.requestedAmountKobo,
        currency: transaction.currency,
        metadata: JSON.stringify({
          ...(transaction.metadata ?? {}),
          paystackRequestedAmountKobo: transaction.requestedAmountKobo,
          paystackChargedAmountKobo: transaction.chargedAmountKobo,
          paystackFeesKobo: transaction.feesKobo,
        }),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Paystack webhook endpoint is active" });
}
