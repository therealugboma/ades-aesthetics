import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  APPOINTMENT_BUFFER_MINUTES,
  BUSINESS_CLOSING_MINUTES,
  BUSINESS_OPENING_MINUTES,
  appointmentBlocksAvailability,
  bookingDateTimeMs,
  createAvailableSlots,
  timeToMinutes,
} from "./lib/booking";

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

    const slotInterval = 30;

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const now = Date.now();
    const activeAppointments = existingAppointments.filter((appointment) =>
      appointmentBlocksAvailability(appointment, now)
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

    const occupiedIntervals = [
      ...appointmentIntervals.filter(Boolean) as { start: number; end: number }[],
      ...blockedIntervals,
    ];

    return createAvailableSlots({
      serviceDuration: service.duration,
      openingMinutes: BUSINESS_OPENING_MINUTES,
      closingMinutes: BUSINESS_CLOSING_MINUTES,
      slotInterval,
      bufferMinutes: APPOINTMENT_BUFFER_MINUTES,
      occupiedIntervals,
    }).filter((time) => bookingDateTimeMs(args.date, time) > now);
  },
});
