export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    "in_progress": "bg-blue-500/10 text-blue-500",
    completed: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
    refunded: "bg-purple-500/10 text-purple-500",
    processing: "bg-info/10 text-info",
    shipped: "bg-indigo-500/10 text-indigo-500",
    delivered: "bg-success/10 text-success",
    active: "bg-success/10 text-success",
    inactive: "bg-muted/10 text-muted",
    paid: "bg-success/10 text-success",
    unpaid: "bg-error/10 text-error",
  };
  return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-600";
}
