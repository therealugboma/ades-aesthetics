import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || !payload.sessionToken) {
    return NextResponse.json(
      { error: "Admin authentication is unavailable" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "auth:verifySession",
        args: { sessionToken: payload.sessionToken },
      }),
    });

    const data = await response.json();

    if (!data.value) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const result = NextResponse.json({
      user: {
        email: data.value.email,
        name: data.value.name,
        role: data.value.role,
      },
      sessionToken: payload.sessionToken,
    });
    result.headers.set("Cache-Control", "no-store");
    return result;
  } catch {
    return NextResponse.json(
      { error: "Unable to verify admin session" },
      { status: 503 }
    );
  }
}
