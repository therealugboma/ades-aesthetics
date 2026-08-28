import { NextRequest, NextResponse } from "next/server";
import { adminSessionToken } from "@/lib/admin-token";

async function convexQuery(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") return null;
  return data.value;
}

async function convexMutation(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(data.message || `Failed: ${path}`);
  }
  return data.value;
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const status = request.nextUrl.searchParams.get("status");
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const appointments = await convexQuery("appointments:list", {
      sessionToken,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });

    return NextResponse.json({ appointments: appointments || [] });
  } catch (error) {
    console.error("Appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { customerId, serviceId, date, time, serviceOptionLabel, notes } = await request.json();

    if (!customerId || !serviceId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appointmentId = await convexMutation("appointments:create", {
      sessionToken,
      customerId,
      serviceId,
      date,
      time,
      serviceOptionLabel,
      notes,
    });

    return NextResponse.json({ id: appointmentId });
  } catch (error) {
    console.error("Appointments create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await convexMutation("appointments:updateStatus", {
      sessionToken,
      id,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Appointments update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!adminSessionToken(request)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      );
    }

    // Note: There's no remove mutation for appointments in the current schema
    // This would need to be added to convex/appointments.ts if needed
    return NextResponse.json(
      { error: "Delete operation not supported" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Appointments delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
