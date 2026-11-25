import { NextResponse } from "next/server";
import { APP_VERSION, HealthResponseSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export function buildHealthPayload() {
  return HealthResponseSchema.parse({
    status: "ok",
    service: "trustsignal",
    version: APP_VERSION,
    mode: "local-first-analysis",
    timestamp: new Date().toISOString(),
    privacy: {
      acceptsScanInput: false,
      persistsUserData: false,
      fetchesSubmittedUrls: false,
    },
  });
}

/**
 * GET /api/health
 * Returns static service & privacy capability metadata only.
 * Never reads or echoes query parameters, request headers, or request bodies.
 */
export async function GET() {
  const payload = buildHealthPayload();
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
