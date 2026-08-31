type PaystackAmounts = {
  amount: number;
  requested_amount?: number;
  fees?: number;
};

function requireKoboAmount(value: number, label: string, allowZero = false) {
  if (
    !Number.isSafeInteger(value) ||
    (allowZero ? value < 0 : value <= 0)
  ) {
    throw new Error(`Paystack returned an invalid ${label}`);
  }
  return value;
}

export function resolvePaystackAmounts(transaction: PaystackAmounts) {
  const chargedAmountKobo = requireKoboAmount(
    transaction.amount,
    "charged amount"
  );
  const requestedAmountKobo = requireKoboAmount(
    transaction.requested_amount ?? chargedAmountKobo,
    "requested amount"
  );

  if (chargedAmountKobo < requestedAmountKobo) {
    throw new Error("Paystack charged amount is less than the requested amount");
  }

  const feesKobo = requireKoboAmount(
    transaction.fees ?? chargedAmountKobo - requestedAmountKobo,
    "fee amount",
    true
  );

  return {
    requestedAmountKobo,
    chargedAmountKobo,
    feesKobo,
  };
}

export function resolveExpectedPaystackAmount(
  transaction: ReturnType<typeof resolvePaystackAmounts>,
  expectedAmountKobo: number
) {
  const expected = requireKoboAmount(expectedAmountKobo, "expected amount");
  const feeAdjustedAmount = transaction.chargedAmountKobo - transaction.feesKobo;
  const confirmedAmounts = new Set([
    transaction.requestedAmountKobo,
    feeAdjustedAmount,
    transaction.feesKobo === 0 ? transaction.chargedAmountKobo : -1,
  ]);

  if (!confirmedAmounts.has(expected) || transaction.chargedAmountKobo < expected) {
    throw new Error("Paystack returned an amount that does not match this payment");
  }

  return expected;
}
