"use client";

import { useCallback, useEffect, useState } from "react";

export interface VerifiedPaymentStatus {
  reference: string;
  amount: number;
  status: "pending" | "success" | "failed" | "abandoned";
  orderItems: number | null;
  metadata: Record<string, unknown>;
}

const MAX_VERIFICATION_ATTEMPTS = 15;
const VERIFICATION_INTERVAL_MS = 2_000;

export function usePaymentStatus(reference: string | null) {
  const [payment, setPayment] = useState<VerifiedPaymentStatus | null>(null);
  const [verifying, setVerifying] = useState(Boolean(reference));
  const [error, setError] = useState(
    reference ? "" : "Missing payment reference."
  );
  const [verificationRun, setVerificationRun] = useState(0);

  const retry = useCallback(() => {
    setError("");
    setVerifying(Boolean(reference));
    setVerificationRun((run) => run + 1);
  }, [reference]);

  useEffect(() => {
    if (!reference) {
      return;
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/payment/status?ref=${encodeURIComponent(reference)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = (await response.json()) as {
          payment?: VerifiedPaymentStatus;
          error?: string;
        };

        if (!response.ok || !data.payment) {
          if (response.status === 404 || response.status === 400) {
            setError(data.error || "We could not find this payment reference.");
            setVerifying(false);
            return;
          }
          throw new Error(data.error || "Payment verification is temporarily unavailable.");
        }

        setPayment(data.payment);
        setError("");
        if (data.payment.status === "success" || data.payment.status === "failed") {
          setVerifying(false);
          return;
        }
      } catch (pollError) {
        if (controller.signal.aborted) return;
        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Payment verification is temporarily unavailable."
          );
        }
      }

      if (attempts < MAX_VERIFICATION_ATTEMPTS) {
        timer = setTimeout(poll, VERIFICATION_INTERVAL_MS);
      } else {
        setVerifying(false);
      }
    };

    timer = setTimeout(poll, 500);
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [reference, verificationRun]);

  return { payment, verifying, error, retry };
}
