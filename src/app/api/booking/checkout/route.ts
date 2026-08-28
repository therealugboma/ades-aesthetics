import { randomUUID } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type CheckoutBody = {
  serviceId?: unknown;
  date?: unknown;
  time?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  serviceOptionLabel?: unknown;
  notes?: unknown;
};

type BookingErrorData = {
  code?: string;
  message?: string;
};

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  return new ConvexHttpClient(url);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const { serviceId, date, time, name, email, phone, serviceOptionLabel, notes } = body;

    if (
      typeof serviceId !== "string" ||
      typeof date !== "string" ||
      typeof time !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      (serviceOptionLabel !== undefined && typeof serviceOptionLabel !== "string") ||
      (notes !== undefined && typeof notes !== "string")
    ) {
      return NextResponse.json(
        { error: "Please complete all required booking details." },
        { status: 400 }
      );
    }

    const reference = `BK-${randomUUID()}`;
    const result = await getConvexClient().mutation(
      api.appointments.createCheckout,
      {
        serviceId: serviceId as Id<"services">,
        date,
        time,
        name,
        email,
        phone,
        serviceOptionLabel,
        notes,
        reference,
      }
    );

    return NextResponse.json({
      reference,
      appointmentId: result.appointmentId,
      amount: result.amount,
      totalAmount: result.totalAmount,
      depositPercentage: result.depositPercentage,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (error instanceof ConvexError) {
      const data = error.data as BookingErrorData;
      const status = data.code === "SLOT_UNAVAILABLE" ? 409 : 400;
      return NextResponse.json(
        { error: data.message || "Booking could not be completed.", code: data.code },
        { status }
      );
    }

    console.error(
      "Booking checkout failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "We could not start your booking. Please try again." },
      { status: 500 }
    );
  }
}
