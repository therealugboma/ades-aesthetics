import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "convex/_generated/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reference?: unknown };
    if (
      typeof body.reference !== "string" ||
      !body.reference.startsWith("ADE-")
    ) {
      return NextResponse.json(
        { error: "Invalid checkout reference" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Convex not configured");

    const result = await new ConvexHttpClient(url).mutation(
      api.payments.releaseReservation,
      { reference: body.reference }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout release failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Could not release checkout" },
      { status: 500 }
    );
  }
}
