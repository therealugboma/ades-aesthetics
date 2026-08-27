import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

type PaystackVerification = {
  status: boolean;
  message?: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  };
};

async function fetchVerifiedTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured");

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
    }
  );
  const result = (await response.json()) as PaystackVerification;
  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Failed to verify transaction");
  }
  return result.data;
}

export const verifyAndFinalize = action({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const transaction = await fetchVerifiedTransaction(args.reference);
    if (transaction.status !== "success") {
      return { status: transaction.status };
    }

    const metadata = transaction.metadata;
    await ctx.runMutation(internal.payments.finalizeVerified, {
      reference: args.reference,
      amountKobo: transaction.amount,
      currency: transaction.currency,
      metadata:
        metadata && Object.keys(metadata).length > 0
          ? JSON.stringify(metadata)
          : undefined,
    });

    return { status: "success" };
  },
});
