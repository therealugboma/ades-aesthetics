import {
  WHATSAPP_PHONE_DISPLAY,
  buildWhatsAppUrl,
} from "./site.ts";

type ReceiptProduct = {
  name: string;
  quantity: number;
  price: number;
};

export type PaymentReceiptInput = {
  reference: string;
  amount: number;
  metadata: Record<string, unknown>;
  orderProducts?: ReceiptProduct[];
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function textMetadata(metadata: Record<string, unknown>, key: string) {
  return typeof metadata[key] === "string" ? metadata[key] : "";
}

function numberMetadata(metadata: Record<string, unknown>, key: string) {
  return typeof metadata[key] === "number" ? metadata[key] : 0;
}

function receiptLayout({
  preview,
  heading,
  customerName,
  reference,
  rows,
  totalLabel,
  total,
  whatsappUrl,
  whatsappPrompt,
}: {
  preview: string;
  heading: string;
  customerName: string;
  reference: string;
  rows: string;
  totalLabel: string;
  total: number;
  whatsappUrl: string;
  whatsappPrompt: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(preview)}</title></head>
  <body style="margin:0;background:#f8f5f5;color:#151b2b;font-family:Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f5;padding:28px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eee4e6">
          <tr><td style="background:#8f4f59;padding:28px 34px;color:#ffffff">
            <div style="font-family:Georgia,serif;font-size:28px">Ades Aesthetics</div>
            <div style="margin-top:6px;font-size:13px;opacity:.9">Payment receipt · ${escapeHtml(reference)}</div>
          </td></tr>
          <tr><td style="padding:34px">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;color:#151b2b">${escapeHtml(heading)}</h1>
            <p style="margin:14px 0 24px;line-height:1.6;color:#596174">Hello ${escapeHtml(customerName || "Customer")}, your Paystack payment has been confirmed. Keep this email as your invoice.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
              ${rows}
              <tr><td style="padding:16px 0;border-top:2px solid #eee4e6;font-weight:bold">${escapeHtml(totalLabel)}</td><td align="right" style="padding:16px 0;border-top:2px solid #eee4e6;font-weight:bold;color:#a83452">${escapeHtml(formatNaira(total))}</td></tr>
            </table>
            <div style="margin-top:24px;padding:20px;border-radius:14px;background:#edf9f0;color:#215d35">
              <strong>Follow up with us on WhatsApp</strong>
              <p style="margin:8px 0 16px;line-height:1.5">${escapeHtml(whatsappPrompt)} Message ${escapeHtml(WHATSAPP_PHONE_DISPLAY)} and your reference will already be included.</p>
              <a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;border-radius:999px;background:#16803c;color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:bold">Continue on WhatsApp</a>
            </div>
            <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#7a8291">This receipt was issued automatically after Paystack confirmed payment. Please do not pay again for the same reference.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function createPaymentReceipt(input: PaymentReceiptInput) {
  const { metadata } = input;
  const customerEmail = textMetadata(metadata, "customerEmail");
  const customerName = textMetadata(metadata, "customerName");
  if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
    throw new Error("Payment receipt is missing a valid customer email");
  }

  if (input.orderProducts?.length) {
    const orderRows = input.orderProducts
      .map(
        (product) =>
          `<tr><td style="padding:12px 0;border-top:1px solid #f0e8ea">${escapeHtml(product.name)} × ${product.quantity}</td><td align="right" style="padding:12px 0;border-top:1px solid #f0e8ea">${escapeHtml(formatNaira(product.price * product.quantity))}</td></tr>`
      )
      .join("");
    const message = [
      "Hello Ades Aesthetics, I have paid for my product order.",
      `Order reference: ${input.reference}`,
      "Please help me arrange delivery.",
    ].join("\n");
    return {
      to: customerEmail,
      subject: `Order invoice ${input.reference} · Ades Aesthetics`,
      html: receiptLayout({
        preview: `Your Ades Aesthetics order ${input.reference} is confirmed`,
        heading: "Order Confirmed",
        customerName,
        reference: input.reference,
        rows: orderRows,
        totalLabel: "Total paid",
        total: input.amount,
        whatsappUrl: buildWhatsAppUrl(message),
        whatsappPrompt: "Contact us to choose the delivery option that suits you best.",
      }),
    };
  }

  const serviceName = textMetadata(metadata, "serviceName") || "Beauty service";
  const optionLabel = textMetadata(metadata, "serviceOptionLabel");
  const paymentOption = textMetadata(metadata, "paymentOption");
  const totalAmount = numberMetadata(metadata, "totalAmount");
  const balance = Math.max(totalAmount - input.amount, 0);
  const rows = [
    ["Service", optionLabel ? `${serviceName} — ${optionLabel}` : serviceName],
    ["Appointment date", textMetadata(metadata, "date")],
    ["Appointment time", textMetadata(metadata, "time")],
    ["Payment type", paymentOption === "full" ? "Full payment" : "30% deposit"],
    ...(balance > 0 ? [["Balance due", formatNaira(balance)]] : []),
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:12px 0;border-top:1px solid #f0e8ea;color:#596174">${escapeHtml(label)}</td><td align="right" style="padding:12px 0;border-top:1px solid #f0e8ea">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const message = [
    "Hello Ades Aesthetics, I am following up on my confirmed appointment.",
    `Booking reference: ${input.reference}`,
    `${serviceName} on ${textMetadata(metadata, "date")} at ${textMetadata(metadata, "time")}`,
  ].join("\n");

  return {
    to: customerEmail,
    subject: `Booking invoice ${input.reference} · Ades Aesthetics`,
    html: receiptLayout({
      preview: `Your Ades Aesthetics booking ${input.reference} is confirmed`,
      heading: "Booking Confirmed",
      customerName,
      reference: input.reference,
      rows,
      totalLabel: paymentOption === "full" ? "Total paid" : "Deposit paid",
      total: input.amount,
      whatsappUrl: buildWhatsAppUrl(message),
      whatsappPrompt: "Contact us if you need help or want to add details to your appointment.",
    }),
  };
}
