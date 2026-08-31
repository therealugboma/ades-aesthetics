import "server-only";
import { Resend } from "resend";
import {
  createPaymentReceipt,
  type PaymentReceiptInput,
} from "@/lib/payment-receipt";

export async function sendPaymentReceipt(input: PaymentReceiptInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const receipt = createPaymentReceipt(input);
  const from =
    process.env.EMAIL_FROM ||
    "Ades Aesthetics <invoices@adesaesthetics.store>";
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from,
      to: receipt.to,
      subject: receipt.subject,
      html: receipt.html,
    },
    {
      headers: {
        "Idempotency-Key": `payment-receipt-${input.reference}`,
      },
    }
  );

  if (error) {
    throw new Error(`Receipt email failed: ${error.message}`);
  }
  if (!data?.id) throw new Error("Receipt email provider returned no message ID");
  return data.id;
}
