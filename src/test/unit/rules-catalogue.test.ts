import { describe, expect, it } from "vitest";
import { getRuleDefinition, RULE_CATALOGUE } from "@/lib/analysis/rules-catalogue";
import { buildGuidesPayload } from "@/lib/guidance/guides-data";

describe("rules catalogue and guidance data", () => {
  it("defines unique rule IDs and resolves every rule via getRuleDefinition", () => {
    const ids = RULE_CATALOGUE.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(getRuleDefinition(id).id).toBe(id);
    }
    expect(() => getRuleDefinition("NON_EXISTENT_RULE")).toThrow();
  });

  it("provides all six required educational safety modules", () => {
    const guides = buildGuidesPayload();
    expect(guides.guides).toHaveLength(6);
    expect(guides.emergencySteps.length).toBeGreaterThanOrEqual(4);
  });
});
