import "server-only";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { getPaymentFinalizeSecret } from "@/lib/paystack-server";
import { sendPaymentReceipt } from "@/lib/payment-receipt-server";
import { getPendingPaymentEmailRecipients } from "@/lib/payment-receipt";

type PaymentNotificationRecord = {
  reference: string;
  amount: number;
  status: string;
  metadata?: string;
  receiptEmailSentAt?: number;
  ownerOrderEmailSentAt?: number;
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
  if (payment.status !== "success") return;

  const recipients = getPendingPaymentEmailRecipients({
    hasOrderProducts: Boolean(payment.orderProducts?.length),
    customerEmailSent: Boolean(payment.receiptEmailSentAt),
    ownerEmailSent: Boolean(payment.ownerOrderEmailSentAt),
  });
  if (!recipients.customer && !recipients.owner) return;

  try {
    const delivery = await sendPaymentReceipt(
      {
        reference: payment.reference,
        amount: payment.amount,
        metadata: parseMetadata(payment.metadata),
        orderProducts: payment.orderProducts,
      },
      recipients
    );
    const serviceSecret = getPaymentFinalizeSecret();
    if (delivery.customerEmailId) {
      await convex.mutation(api.payments.markReceiptEmailSent, {
        serviceSecret,
        reference: payment.reference,
        emailId: delivery.customerEmailId,
      });
    }
    if (delivery.ownerEmailId) {
      await convex.mutation(api.payments.markOwnerOrderEmailSent, {
        serviceSecret,
        reference: payment.reference,
        emailId: delivery.ownerEmailId,
      });
    }
  } catch (error) {
    console.error("Payment receipt email failed", {
      reference: payment.reference,
      message: error instanceof Error ? error.message : "Unknown email error",
    });
  }
}
