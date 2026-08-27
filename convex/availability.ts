import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableSlots = query({
  args: {
    date: v.string(),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      throw new Error("Service not found or inactive");
    }

    const openingHour = 9;
    const closingHour = 19;
    const slotInterval = 30;

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const activeAppointments = existingAppointments.filter(
      (a) => a.status !== "cancelled"
    );

    const appointmentIntervals = await Promise.all(
      activeAppointments.map(async (apt) => {
        const aptService = await ctx.db.get(apt.serviceId);
        if (!aptService) return null;
        const start = timeToMinutes(apt.time);
        const end = start + aptService.duration;
        return { start, end };
      })
    );

    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const blockedIntervals = blockedTimes.map((b) => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
    }));

    const allIntervals = [
      ...appointmentIntervals.filter(Boolean) as { start: number; end: number }[],
      ...blockedIntervals,
    ];

    const buffer = 30;
    const dayStart = openingHour * 60;
    const dayEnd = closingHour * 60;
    const serviceDuration = service.duration;

    const availableSlots: string[] = [];

    for (let minutes = dayStart; minutes + serviceDuration <= dayEnd; minutes += slotInterval) {
      const slotStart = minutes;
      const slotEnd = minutes + serviceDuration;

      const isBlocked = allIntervals.some(
        (interval) =>
          slotStart < interval.end + buffer && slotEnd > interval.start - buffer
      );

      if (!isBlocked) {
        availableSlots.push(minutesToTime(minutes));
      }
    }

    return availableSlots;
  },
});

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
