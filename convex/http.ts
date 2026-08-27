import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const handlePaystackWebhook = httpAction(async (ctx, request) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await request.text();

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );

  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedSignature !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference;
    const metadata = data.metadata || {};

    try {
      await ctx.runMutation(internal.payments.finalizeVerified, {
        reference,
        amountKobo: data.amount,
        currency: data.currency,
        metadata:
          Object.keys(metadata).length > 0
            ? JSON.stringify(metadata)
            : undefined,
      });
    } catch (error) {
      console.error("Failed to process payment:", error);
      return new Response("Payment processing failed", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
});

http.route({
  path: "/paystack/webhook",
  method: "POST",
  handler: handlePaystackWebhook,
});

export default http;
