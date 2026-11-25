import { NextResponse } from "next/server";
import { buildGuidesPayload } from "@/lib/guidance/guides-data";

export function handleGuidesRequest() {
  const payload = buildGuidesPayload();
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}

/**
 * GET /api/guides
 * Serves curated public safety education and incident response guidance.
 */
export async function GET() {
  return handleGuidesRequest();
}
