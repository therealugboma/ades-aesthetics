import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(projectRoot);

const baseUrl = (process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const evidencePath = resolve(
  projectRoot,
  "evidence/flows/F2_Booking/runtime-proof.json"
);
const migrationEvidencePath = resolve(
  projectRoot,
  "evidence/flows/F2_Booking/migration-state.json"
);

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    status: response.status,
    body: await response.text(),
  };
}

const booking = await request("/booking");
const adminBoundary = await request("/api/auth/me");
const adminAppointments = await request("/api/appointments");
const invalidCheckout = await request("/api/booking/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
let remoteServices = [];
let remoteSlots = null;
let remoteAdminDenied = false;
let remoteError = "";

if (convexUrl) {
  try {
    const convex = new ConvexHttpClient(convexUrl);
    remoteServices = await convex.query(api.services.list, {});
    if (remoteServices.length > 0) {
      const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      remoteSlots = await convex.query(api.availability.getAvailableSlots, {
        date,
        serviceId: remoteServices[0]._id,
      });
    }
    try {
      await convex.query(api.services.getAll, {
        sessionToken: "runtime-proof-invalid-session",
      });
    } catch {
      remoteAdminDenied = true;
    }
  } catch (error) {
    remoteError = error instanceof Error ? error.message : "Unknown remote error";
  }
} else {
  remoteError = "NEXT_PUBLIC_CONVEX_URL is not configured";
}

const checks = [
  {
    name: "booking page renders",
    passed:
      booking.status === 200 && booking.body.includes("Book Your Appointment"),
    observedStatus: booking.status,
  },
  {
    name: "admin data fails closed without a session",
    passed:
      adminBoundary.status === 401 &&
      adminBoundary.body.includes("Not authenticated"),
    observedStatus: adminBoundary.status,
  },
  {
    name: "admin management APIs reject unauthenticated requests",
    passed:
      adminAppointments.status === 401 &&
      adminAppointments.body.includes("Not authenticated"),
    observedStatus: adminAppointments.status,
  },
  {
    name: "invalid booking checkout returns a safe validation error",
    passed:
      invalidCheckout.status === 400 &&
      invalidCheckout.body.includes("required booking details") &&
      !invalidCheckout.body.toLowerCase().includes("convex") &&
      !invalidCheckout.body.includes(" at "),
    observedStatus: invalidCheckout.status,
  },
  {
    name: "development Convex deployment serves booking data",
    passed: remoteServices.length > 0 && Array.isArray(remoteSlots),
    observedServiceCount: remoteServices.length,
    observedAvailabilityType: Array.isArray(remoteSlots) ? "array" : "unavailable",
  },
  {
    name: "development Convex deployment denies invalid admin sessions",
    passed: remoteAdminDenied,
  },
];

const schema = await readFile(resolve(projectRoot, "convex/schema.ts"));
const schemaSha256 = createHash("sha256").update(schema).digest("hex");
const deploymentOrigin = convexUrl ? new URL(convexUrl).origin : null;
const migrationState = {
  generatedAt: new Date().toISOString(),
  environment: "development",
  deploymentOrigin,
  trackedSchema: "convex/schema.ts",
  schemaSha256,
  appliedSchema: remoteServices.length > 0 && Array.isArray(remoteSlots),
  authorizationBoundaryVerified: remoteAdminDenied,
  migrationLedger: {
    status: "not-applicable",
    reason: "Convex deploys the declarative schema; this project has no migration ledger.",
  },
  openRecoveryFindings: remoteError ? [remoteError] : [],
};
const evidence = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  deploymentOrigin,
  result: checks.every((check) => check.passed) ? "pass" : "failed",
  checks,
  migrationState: {
    status: migrationState.appliedSchema ? "remote-pass" : "failed",
    schemaSha256,
    evidence: "evidence/flows/F2_Booking/migration-state.json",
  },
  paymentPersistence: {
    status: "unverified",
    reason: "No real Paystack transaction was performed.",
  },
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(
  migrationEvidencePath,
  `${JSON.stringify(migrationState, null, 2)}\n`
);

for (const check of checks) {
  console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}`);
}
console.log(`Evidence: ${evidencePath}`);
console.log(`Migration evidence: ${migrationEvidencePath}`);

if (evidence.result !== "pass") process.exitCode = 1;
