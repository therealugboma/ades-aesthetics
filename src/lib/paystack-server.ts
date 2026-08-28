import "server-only";

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

export function getPaymentFinalizeSecret() {
  const secret = process.env.PAYMENT_FINALIZE_SECRET;
  if (!secret) throw new Error("PAYMENT_FINALIZE_SECRET not configured");
  return secret;
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured");

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  );
  const result = (await response.json()) as PaystackVerification;
  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Failed to verify transaction");
  }
  if (
    typeof result.data.status !== "string" ||
    !Number.isFinite(result.data.amount) ||
    typeof result.data.currency !== "string"
  ) {
    throw new Error("Paystack returned an invalid verification response");
  }
  return result.data;
}
