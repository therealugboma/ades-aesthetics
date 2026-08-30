import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import {
  getPaymentFinalizeSecret,
  verifyPaystackTransaction,
} from "@/lib/paystack-server";

function parseMetadata(value?: string) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("ref");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Convex not configured");
    const convex = new ConvexHttpClient(url);

    let payment = await convex.query(api.payments.getByReferenceWithOrder, {
      reference,
    });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "pending" || payment.status === "abandoned") {
      try {
        const transaction = await verifyPaystackTransaction(reference);
        if (transaction.status === "success") {
          await convex.mutation(api.payments.finalizeVerified, {
            serviceSecret: getPaymentFinalizeSecret(),
            reference,
            amountKobo: transaction.amount,
            currency: transaction.currency,
            metadata: transaction.metadata
              ? JSON.stringify(transaction.metadata)
              : undefined,
          });
        }
        payment = await convex.query(api.payments.getByReferenceWithOrder, {
          reference,
        });
      } catch (error) {
        console.error("Payment finalization failed", {
          reference,
          message:
            error instanceof Error ? error.message : "Unknown verification error",
        });
      }
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        payment: {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          orderItems: payment.orderItems,
          orderProducts: payment.orderProducts,
          metadata: parseMetadata(payment.metadata),
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error(
      "Payment status failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
