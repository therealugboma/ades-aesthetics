import "server-only";
import { Resend } from "resend";
import {
  createPaymentEmailMessages,
  type PaymentReceiptInput,
} from "@/lib/payment-receipt";

export async function sendPaymentReceipt(
  input: PaymentReceiptInput,
  recipients: { customer: boolean; owner: boolean } = {
    customer: true,
    owner: true,
  }
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const ownerEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "adesaesthetics@gmail.com";
  const messages = createPaymentEmailMessages(input, ownerEmail).filter(
    (message) => recipients[message.recipient]
  );
  const from =
    process.env.EMAIL_FROM ||
    "Ades Aesthetics <invoices@adesaesthetics.store>";
  const resend = new Resend(apiKey);
  const deliveries = await Promise.all(
    messages.map(async (message) => {
      const { data, error } = await resend.emails.send(
        {
          from,
          to: message.to,
          subject: message.subject,
          html: message.html,
        },
        {
          headers: {
            "Idempotency-Key": message.idempotencyKey,
          },
        }
      );
      if (error) {
        throw new Error(
          `${message.recipient} receipt failed: ${error.message}`
        );
      }
      if (!data?.id) {
        throw new Error(
          `${message.recipient} receipt provider returned no message ID`
        );
      }
      return { recipient: message.recipient, emailId: data.id };
    })
  );

  const customerEmailId = deliveries.find(
    (delivery) => delivery.recipient === "customer"
  )?.emailId;
  if (recipients.customer && !customerEmailId) {
    throw new Error("Customer receipt provider returned no message ID");
  }
  const ownerEmailId = deliveries.find(
    (delivery) => delivery.recipient === "owner"
  )?.emailId;

  console.info("Payment receipt emails sent", {
    reference: input.reference,
    customerEmailId,
    ownerEmailId,
  });

  return { customerEmailId, ownerEmailId };
}
