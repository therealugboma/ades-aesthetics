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

    const orders = await convexQuery("orders:list", {
      sessionToken,
      status: status || undefined
    });

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminSessionToken(request)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { customerId, items, deliveryAddress, deliveryNotes, deliveryFee, deliveryCost } = await request.json();

    if (!customerId || !items || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await convexMutation("orders:create", {
      customerId,
      items,
      deliveryAddress,
      deliveryNotes: deliveryNotes || undefined,
      deliveryFee: deliveryFee || undefined,
      deliveryCost: deliveryCost || undefined,
    });

    return NextResponse.json({ id: order.orderId });
  } catch (error) {
    console.error("Orders create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
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

    await convexMutation("orders:updateStatus", {
      sessionToken,
      orderId: id,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Orders update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
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
        { error: "Missing order ID" },
        { status: 400 }
      );
    }

    // Note: There's no remove mutation for orders in the current schema
    // This would need to be added to convex/orders.ts if needed
    return NextResponse.json(
      { error: "Delete operation not supported" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Orders delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete order" },
      { status: 500 }
    );
  }
}
