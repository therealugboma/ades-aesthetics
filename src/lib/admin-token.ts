import crypto from "crypto";
import type { NextRequest } from "next/server";

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin";
  sessionToken: string;
  exp: number;
}

function jwtSecret(): string | null {
  const configured = process.env.ADMIN_JWT_SECRET;
  if (configured) return configured;
  return process.env.NODE_ENV === "production"
    ? null
    : "ades-aesthetics-local-development-only";
}

function base64url(data: Buffer | string): string {
  const value = typeof data === "string" ? Buffer.from(data) : data;
  return value.toString("base64url");
}

export function signAdminToken(payload: AdminSessionPayload): string | null {
  const secret = jwtSecret();
  if (!secret) return null;
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = base64url(
    crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  const secret = jwtSecret();
  if (!secret) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest();
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Partial<AdminSessionPayload>;
    if (
      payload.role !== "admin" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.sessionToken !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function adminSessionToken(request: NextRequest): string | null {
  const token = request.cookies.get("admin-token")?.value;
  if (!token) return null;
  return verifyAdminToken(token)?.sessionToken ?? null;
}
