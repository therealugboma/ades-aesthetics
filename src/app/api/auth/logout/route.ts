import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-token";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  if (token) {
    const payload = verifyAdminToken(token);
    if (payload?.sessionToken) {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (convexUrl) {
        try {
          await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "auth:destroySession",
              args: { sessionToken: payload.sessionToken },
            }),
          });
        } catch {
          // Best effort — clear cookie even if Convex call fails
        }
      }
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
