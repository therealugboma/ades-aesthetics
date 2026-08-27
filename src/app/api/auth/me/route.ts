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
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verify(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || !payload.sessionToken) {
    return NextResponse.json({
      user: { email: payload.email, name: payload.name, role: payload.role },
    });
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

    return NextResponse.json({
      user: {
        email: data.value.email,
        name: data.value.name,
        role: data.value.role,
      },
    });
  } catch {
    return NextResponse.json({
      user: { email: payload.email, name: payload.name, role: payload.role },
    });
  }
}
