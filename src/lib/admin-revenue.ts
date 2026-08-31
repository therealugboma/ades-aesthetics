type RevenuePayment = {
  amount: number;
  status: string;
  appointmentId?: unknown;
  orderId?: unknown;
};

export function calculateAdminRevenue(payments: RevenuePayment[]) {
  let bookingRevenue = 0;
  let orderRevenue = 0;

  for (const payment of payments) {
    if (payment.status !== "success" || !Number.isFinite(payment.amount)) {
      continue;
    }
    if (payment.appointmentId) bookingRevenue += payment.amount;
    if (payment.orderId) orderRevenue += payment.amount;
  }

  return {
    bookingRevenue,
    orderRevenue,
    totalRevenue: bookingRevenue + orderRevenue,
  };
}
