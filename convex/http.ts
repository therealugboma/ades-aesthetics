import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const http = httpRouter();

const processPayment = internalMutation({
  args: {
    reference: v.string(),
    amount: v.number(),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .collect();

    if (existing.length === 0) {
      throw new Error(
        "Payment record not found for reference: " + args.reference
      );
    }

    const payment = existing[0];

    if (payment.status === "success" || payment.status === "failed") {
      return payment._id;
    }

    await ctx.db.patch(payment._id, {
      status: "success",
      metadata: args.metadata,
    });

    if (payment.appointmentId) {
      await ctx.db.patch(payment.appointmentId, { status: "confirmed" });
    }

    if (payment.orderId) {
      await ctx.db.patch(payment.orderId, { status: "paid" });
    }

    return payment._id;
  },
});

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
    const amount = data.amount / 100;
    const metadata = JSON.stringify(data.metadata || {});

    try {
      await ctx.runMutation(processPayment as any, {
        reference,
        amount,
        metadata,
      });
    } catch (error) {
      console.error("Failed to process payment:", error);
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
