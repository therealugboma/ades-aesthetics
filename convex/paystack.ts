import { action } from "./_generated/server";
import { v } from "convex/values";

export const initializeTransaction = action({
  args: {
    email: v.string(),
    amount: v.number(),
    reference: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: args.email,
          amount: Math.round(args.amount * 100),
          reference: args.reference,
          metadata: args.metadata ? JSON.parse(args.metadata) : undefined,
        }),
      }
    );

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || "Failed to initialize transaction");
    }
    return data.data;
  },
});

export const verifyTransaction = action({
  args: { reference: v.string() },
  handler: async (_ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${args.reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || "Failed to verify transaction");
    }
    return data.data;
  },
});
