import "server-only";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { getPaymentFinalizeSecret } from "@/lib/paystack-server";
import { sendPaymentReceipt } from "@/lib/payment-receipt-server";

type PaymentNotificationRecord = {
  reference: string;
  amount: number;
  status: string;
  metadata?: string;
  receiptEmailSentAt?: number;
  orderProducts?: Array<{ name: string; quantity: number; price: number }>;
};

function parseMetadata(value?: string) {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function sendReceiptIfNeeded(
  convex: ConvexHttpClient,
  payment: PaymentNotificationRecord
) {
  if (payment.status !== "success" || payment.receiptEmailSentAt) return;

  try {
    const emailId = await sendPaymentReceipt({
      reference: payment.reference,
      amount: payment.amount,
      metadata: parseMetadata(payment.metadata),
      orderProducts: payment.orderProducts,
    });
    await convex.mutation(api.payments.markReceiptEmailSent, {
      serviceSecret: getPaymentFinalizeSecret(),
      reference: payment.reference,
      emailId,
    });
  } catch (error) {
    console.error("Payment receipt email failed", {
      reference: payment.reference,
      message: error instanceof Error ? error.message : "Unknown email error",
    });
  }
}
