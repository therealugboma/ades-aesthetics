export type BookingPaymentOption = "deposit" | "full";

export function resolveBookingPayment(
  totalAmount: number,
  depositPercentage: number,
  paymentOption: BookingPaymentOption
) {
  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0 ||
    !Number.isFinite(depositPercentage) ||
    depositPercentage <= 0 ||
    depositPercentage > 100
  ) {
    throw new Error("Invalid booking payment configuration");
  }

  if (paymentOption !== "deposit" && paymentOption !== "full") {
    throw new Error("Invalid booking payment option");
  }

  const percentage = paymentOption === "full" ? 100 : depositPercentage;
  return {
    amount: Math.max(Math.round(totalAmount * (percentage / 100)), 1),
    percentage,
    paymentOption,
  };
}
