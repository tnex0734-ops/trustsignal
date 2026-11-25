import { describe, expect, it, vi } from "vitest";
import { analyzeLink } from "@/lib/analysis/link-rules";
import { LINK_FIXTURES } from "@/test/fixtures/link-fixtures";

describe("analyzeLink", () => {
  it("evaluates all synthetic fixtures deterministically", () => {
    for (const fixture of LINK_FIXTURES) {
      const result = analyzeLink(fixture.url);
      expect(result.status, fixture.id).toBe(fixture.expectedStatus);
      if (result.status === "analyzed" && fixture.expectedRisk) {
        expect(result.riskLevel, fixture.id).toBe(fixture.expectedRisk);
        for (const expectedId of fixture.expectedIndicators ?? []) {
          expect(
            result.indicators.some((ind) => ind.id === expectedId),
            `${fixture.id} expected ${expectedId}`,
          ).toBe(true);
        }
      }
    }
  });

  it("never performs network requests during link analysis", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = analyzeLink("https://paypal.com@evil.example/verify-account");
    expect(result.status).toBe("analyzed");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("triggers individual indicators accurately", () => {
    const subResult = analyzeLink("https://a.b.c.d.example.com/page");
    expect(subResult.status).toBe("analyzed");
    if (subResult.status === "analyzed") {
      expect(subResult.indicators.some((i) => i.id === "LINK_EXCESSIVE_SUBDOMAINS")).toBe(true);
    }

    const portResult = analyzeLink("https://verify-secure.example.xyz:8443/home");
    expect(portResult.status).toBe("analyzed");
    if (portResult.status === "analyzed") {
      expect(portResult.indicators.some((i) => i.id === "LINK_SUSPICIOUS_HOST_PATTERN")).toBe(true);
    }

    const bidiResult = analyzeLink("https://example\u202E.com/file");
    expect(bidiResult.status).toBe("analyzed");
    if (bidiResult.status === "analyzed") {
      expect(bidiResult.riskLevel).toBe("high-risk");
      expect(bidiResult.indicators.some((i) => i.id === "LINK_OBFUSCATED_CHARACTERS")).toBe(true);
    }

    const unicodeHomograph = analyzeLink("https://p\u0430ypal.example.com/otp");
    expect(unicodeHomograph.status).toBe("analyzed");
    if (unicodeHomograph.status === "analyzed") {
      expect(unicodeHomograph.riskLevel).toBe("high-risk");
      expect(unicodeHomograph.indicators.some((i) => i.id === "LINK_PUNYCODE_IDN")).toBe(true);
      expect(unicodeHomograph.indicators.some((i) => i.id === "LINK_BRAND_LOOKALIKE")).toBe(true);
    }

    const longHost = analyzeLink(`https://${"sub-label-".repeat(6)}verify-portal.xyz/home`);
    expect(longHost.status).toBe("analyzed");
    if (longHost.status === "analyzed") {
      expect(longHost.indicators.some((i) => i.id === "LINK_SUSPICIOUS_HOST_PATTERN")).toBe(true);
    }

    const hyphenLure = analyzeLink("https://my-urgent-verify-portal.example.com/home");
    expect(hyphenLure.status).toBe("analyzed");
    if (hyphenLure.status === "analyzed") {
      expect(hyphenLure.indicators.some((i) => i.id === "LINK_SUSPICIOUS_HOST_PATTERN")).toBe(true);
    }

    const passOnlyUserInfo = analyzeLink("https://user:secret@example.org/account");
    expect(passOnlyUserInfo.status).toBe("analyzed");
    if (passOnlyUserInfo.status === "analyzed") {
      expect(passOnlyUserInfo.indicators.some((i) => i.id === "LINK_USERINFO_CREDENTIALS")).toBe(
        true,
      );
    }

    const palochkaHomograph = analyzeLink("https://xn--80ak6aa92e.example/login");
    expect(palochkaHomograph.status).toBe("analyzed");
    if (palochkaHomograph.status === "analyzed") {
      expect(palochkaHomograph.riskLevel).toBe("high-risk");
      expect(palochkaHomograph.indicators.some((i) => i.id === "LINK_PUNYCODE_IDN")).toBe(true);
      expect(palochkaHomograph.indicators.some((i) => i.id === "LINK_BRAND_LOOKALIKE")).toBe(true);
    }
  });

  it("always includes explicit uncertainty limitations even for low-signal HTTPS URLs", () => {
    const result = analyzeLink("https://www.example.com");
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("low-signal");
      expect(result.limitations.some((line) => line.includes("does NOT prove"))).toBe(true);
    }
  });

  it("does not false-positive official brand domains as lookalikes", () => {
    const officialGoogle = analyzeLink("https://accounts.google.com/signin");
    expect(officialGoogle.status).toBe("analyzed");
    if (officialGoogle.status === "analyzed") {
      expect(officialGoogle.riskLevel).toBe("low-signal");
      expect(officialGoogle.indicators.some((i) => i.id === "LINK_BRAND_LOOKALIKE")).toBe(false);
    }
  });
});
