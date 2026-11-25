import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { assessPasswordLocally } from "@/features/password-check/service";
import { MAX_PASSWORD_LENGTH } from "@/lib/analysis/constants";
import { PASSWORD_FIXTURES } from "@/test/fixtures/password-fixtures";

describe("assessPasswordLocally", () => {
  it("evaluates all synthetic password fixtures accurately without exposing raw passwords", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    for (const fixture of PASSWORD_FIXTURES) {
      const assessment = assessPasswordLocally(fixture.sample);
      expect(assessment.status, fixture.id).toBe("assessed");
      expect(assessment.score).toBeDefined();

      if (fixture.expectedMaxScore !== undefined && assessment.score !== undefined) {
        expect(assessment.score, fixture.id).toBeLessThanOrEqual(fixture.expectedMaxScore);
      }
      if (fixture.expectedMinScore !== undefined && assessment.score !== undefined) {
        expect(assessment.score, fixture.id).toBeGreaterThanOrEqual(fixture.expectedMinScore);
      }

      // Privacy invariant: the assessed result object must never echo or serialize the input password.
      const serialized = JSON.stringify(assessment);
      expect(serialized).not.toContain(fixture.sample);
      expect(assessment.limitations.some((l) => l.includes("does NOT check"))).toBe(true);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("identifies keyboard sequences, repetition, and Unicode support explicitly", () => {
    const keyboard = assessPasswordLocally("qwertyuiop123");
    expect(keyboard.detectedPatterns).toContain("Keyboard row or spatial pattern");

    const repeated = assessPasswordLocally("aaaaaaaaaaaa");
    expect(repeated.detectedPatterns).toContain("Repeated characters or repeated segment");

    const unicode = assessPasswordLocally("Canyon☕River⛰️Lantern92!");
    expect(unicode.detectedPatterns).toContain("Includes Unicode / multi-script characters");
    expect(unicode.riskLevel).toBe("low-signal");

    const fair = assessPasswordLocally("OrangeSky7");
    expect(fair.score).toBe(2);
    expect(fair.tier).toBe("fair");
    expect(fair.riskLevel).toBe("needs-attention");

    const strong = assessPasswordLocally("Harbor74Cloud");
    expect(strong.score).toBe(3);
    expect(strong.tier).toBe("strong");

    const withDate = assessPasswordLocally("Blue1998-05-12");
    expect(withDate.detectedPatterns).toContain("Date or year pattern");
  });

  it("handles empty and oversized inputs safely", () => {
    const empty = assessPasswordLocally("");
    expect(empty.status).toBe("empty");

    const oversized = assessPasswordLocally("x".repeat(MAX_PASSWORD_LENGTH + 1));
    expect(oversized.status).toBe("too-long");
  });

  it("isolates @zxcvbn-ts and password service strictly from server API routes", () => {
    const apiDir = path.resolve(process.cwd(), "src/app/api");
    const routeFiles = fs.readdirSync(apiDir, { recursive: true }) as string[];
    for (const relPath of routeFiles) {
      const fullPath = path.join(apiDir, relPath);
      if (fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, "utf8");
        expect(content).not.toContain("zxcvbn");
        expect(content).not.toContain("password-check");
      }
    }
  });
});
