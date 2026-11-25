import { NextResponse } from "next/server";
import { COMMON_ANALYSIS_LIMITATIONS } from "@/lib/analysis/constants";
import { RULE_CATALOGUE } from "@/lib/analysis/rules-catalogue";
import { CATALOG_VERSION, RulesResponseSchema } from "@/lib/validation/schemas";

export function buildRulesPayload() {
  return RulesResponseSchema.parse({
    version: CATALOG_VERSION,
    ruleCount: RULE_CATALOGUE.length,
    limitations: [...COMMON_ANALYSIS_LIMITATIONS],
    rules: RULE_CATALOGUE.map((rule) => ({ ...rule })),
  });
}

/**
 * GET /api/rules
 * Serves the versioned public rule catalogue used by the browser-side analyzers.
 * Accepts no user input.
 */
export async function GET() {
  const payload = buildRulesPayload();
  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
