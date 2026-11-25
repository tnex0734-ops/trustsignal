import { describe, expect, it } from "vitest";
import { GET as getGuidance } from "@/app/api/guidance/route";
import { GET as getGuides } from "@/app/api/guides/route";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getRules } from "@/app/api/rules/route";
import { RULE_CATALOGUE } from "@/lib/analysis/rules-catalogue";
import {
  GuidesResponseSchema,
  HealthResponseSchema,
  RulesResponseSchema,
} from "@/lib/validation/schemas";

describe("metadata API routes", () => {
  it("GET /api/health returns valid metadata only", async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const parsed = HealthResponseSchema.parse(await response.json());
    expect(parsed.status).toBe("ok");
    expect(parsed.privacy.acceptsScanInput).toBe(false);
  });

  it("GET /api/rules returns versioned rule catalogue matching shared definitions", async () => {
    const response = await getRules();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("public");

    const parsed = RulesResponseSchema.parse(await response.json());
    expect(parsed.ruleCount).toBe(RULE_CATALOGUE.length);
    expect(parsed.rules.map((r) => r.id)).toEqual(RULE_CATALOGUE.map((r) => r.id));
  });

  it("GET /api/guides and GET /api/guidance return identical validated guidance", async () => {
    const guidesRes = await getGuides();
    const guidanceRes = await getGuidance();

    expect(guidesRes.status).toBe(200);
    expect(guidanceRes.status).toBe(200);

    const guidesJson = GuidesResponseSchema.parse(await guidesRes.json());
    const guidanceJson = GuidesResponseSchema.parse(await guidanceRes.json());
    expect(guidesJson).toEqual(guidanceJson);
    expect(guidesJson.guides).toHaveLength(6);
  });
});
