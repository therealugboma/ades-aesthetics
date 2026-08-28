export const APPOINTMENT_BUFFER_MINUTES = 30;
export const RESERVATION_TTL_MS = 15 * 60 * 1000;
export const PAYMENT_CLOSE_GRACE_MS = 2 * 60 * 1000;

type AppointmentAvailabilityState = {
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  createdAt: number;
  expiresAt?: number;
};

type TimeInterval = {
  start: number;
  end: number;
};

export function timeToMinutes(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return Number.NaN;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

export function appointmentBlocksAvailability(
  appointment: AppointmentAvailabilityState,
  now: number
): boolean {
  if (appointment.status === "cancelled") return false;
  if (appointment.status !== "pending") return true;

  const expiresAt =
    appointment.expiresAt ?? appointment.createdAt + RESERVATION_TTL_MS;
  return expiresAt > now;
}

export function reservationCanFinalize(
  appointment: { status: string; createdAt: number; expiresAt?: number }
): boolean {
  if (appointment.status === "confirmed") return true;
  // The hold expiry only decides whether an *unpaid* reservation blocks new
  // availability. Once Paystack has verified the exact amount and currency,
  // a delayed callback/webhook must still be able to confirm the reservation.
  return appointment.status === "pending";
}

export function intervalsOverlapWithBuffer(
  requestedStart: number,
  requestedEnd: number,
  occupiedStart: number,
  occupiedEnd: number,
  bufferMinutes = APPOINTMENT_BUFFER_MINUTES
): boolean {
  return (
    requestedStart < occupiedEnd + bufferMinutes &&
    requestedEnd > occupiedStart - bufferMinutes
  );
}

export function createAvailableSlots({
  serviceDuration,
  openingMinutes,
  closingMinutes,
  slotInterval,
  bufferMinutes,
  occupiedIntervals,
}: {
  serviceDuration: number;
  openingMinutes: number;
  closingMinutes: number;
  slotInterval: number;
  bufferMinutes: number;
  occupiedIntervals: TimeInterval[];
}): string[] {
  const slots: string[] = [];

  for (
    let start = openingMinutes;
    start + serviceDuration <= closingMinutes;
    start += slotInterval
  ) {
    const end = start + serviceDuration;
    const isBlocked = occupiedIntervals.some((interval) =>
      intervalsOverlapWithBuffer(
        start,
        end,
        interval.start,
        interval.end,
        bufferMinutes
      )
    );

    if (!isBlocked) slots.push(minutesToTime(start));
  }

  return slots;
}

export function isValidBookingDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function bookingDateTimeMs(date: string, time: string): number {
  return Date.parse(`${date}T${time}:00+01:00`);
}
