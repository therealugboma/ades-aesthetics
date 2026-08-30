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

export async function GET(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const products = await convexQuery("products:listAll", { sessionToken });
    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Products listAll error:", error);
    return NextResponse.json(
      { error: "Failed to fetch all products" },
      { status: 500 }
    );
  }
}
