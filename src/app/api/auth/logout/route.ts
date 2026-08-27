import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ades-aesthetics-admin-secret-change-in-production";

function base64url(data: Buffer | string): string {
  const str = typeof data === "string" ? data : data.toString("latin1");
  return Buffer.from(str, "latin1").toString("base64url");
}

function verify(token: string): any | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSig = base64url(
      crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
    );
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  if (token) {
    const payload = verify(token);
    if (payload?.sub) {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (convexUrl) {
        try {
          await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "auth:destroySession",
              args: { userId: payload.sub },
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
