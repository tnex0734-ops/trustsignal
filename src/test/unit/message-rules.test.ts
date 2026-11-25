import { describe, expect, it, vi } from "vitest";
import { MAX_MESSAGE_LENGTH } from "@/lib/analysis/constants";
import { analyzeMessage, extractCandidateUrls } from "@/lib/analysis/message-rules";
import { MESSAGE_FIXTURES } from "@/test/fixtures/message-fixtures";

describe("analyzeMessage", () => {
  it("evaluates all benign and suspicious message fixtures accurately", () => {
    for (const fixture of MESSAGE_FIXTURES) {
      const result = analyzeMessage(fixture.text);
      expect(result.status, fixture.id).toBe("analyzed");
      if (result.status === "analyzed") {
        expect(result.riskLevel, fixture.id).toBe(fixture.expectedRisk);
        for (const expectedId of fixture.expectedIndicators) {
          expect(
            result.indicators.some((ind) => ind.id === expectedId),
            `${fixture.id} expected ${expectedId}`,
          ).toBe(true);
        }
      }
    }
  });

  it("does not mark 'urgent' alone as needs-attention or high-risk", () => {
    const result = analyzeMessage("Urgent: Please submit your lab assignment before 5 PM.");
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("low-signal");
      expect(result.indicators.map((i) => i.id)).toEqual(["MSG_URGENCY_PRESSURE"]);
    }
  });

  it("does not false-positive legitimate OTP notifications telling users never to share codes", () => {
    const result = analyzeMessage(
      "Your verification OTP is 551029. Do not share this OTP with anyone.",
    );
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("low-signal");
      expect(result.indicators.some((i) => i.id === "MSG_OTP_CREDENTIAL_REQUEST")).toBe(false);
    }
  });

  it("still flags an OTP solicitation even if preceded by a fake anti-scam preamble", () => {
    const result = analyzeMessage(
      "We never ask for your PIN. Now reply with your 6-digit OTP to unlock your account.",
    );
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("high-risk");
      expect(result.indicators.some((i) => i.id === "MSG_OTP_CREDENTIAL_REQUEST")).toBe(true);
    }
  });

  it("treats benign embedded HTTPS links as informational without escalating to warning", () => {
    const result = analyzeMessage(
      "See the updated library schedule at https://www.example.com/schedule before Friday.",
    );
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("low-signal");
      expect(result.indicators.some((i) => i.id === "MSG_EMBEDDED_LINK_INFO")).toBe(true);
    }
  });

  it("handles malformed embedded links inside messages without crashing", () => {
    const result = analyzeMessage("Broken reference link http://[invalid-host in notes.");
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.embeddedLinkResults?.[0]?.riskLevel).toBe("invalid");
    }
  });

  it("detects embedded unsafe schemes and risky links locally without network calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = analyzeMessage("Click javascript:alert(1) or visit https://bit.ly/demo-link");
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("high-risk");
      expect(result.indicators.some((i) => i.id === "MSG_EMBEDDED_RISKY_LINK")).toBe(true);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("detects sensitive PII demands and invisible obfuscation", () => {
    const result = analyzeMessage(
      "Reply with your\u200B\u200B\u200B Aadhaar and credit card number immediately.",
    );
    expect(result.status).toBe("analyzed");
    if (result.status === "analyzed") {
      expect(result.riskLevel).toBe("high-risk");
      expect(result.indicators.some((i) => i.id === "MSG_SENSITIVE_PII_REQUEST")).toBe(true);
      expect(result.indicators.some((i) => i.id === "MSG_OBFUSCATED_TEXT")).toBe(true);
    }
  });

  it("handles empty, oversized, and pathological repeated strings cleanly and rapidly", () => {
    const emptyRes = analyzeMessage("   ");
    expect(emptyRes.status).toBe("invalid");

    const overRes = analyzeMessage("a".repeat(MAX_MESSAGE_LENGTH + 1));
    expect(overRes.status).toBe("invalid");
    if (overRes.status === "invalid") {
      expect(overRes.reasonCode).toBe("too-long");
    }

    const start = performance.now();
    const boundaryRes = analyzeMessage("urgent ".repeat(1100));
    const elapsedMs = performance.now() - start;
    expect(boundaryRes.status).toBe("analyzed");
    expect(elapsedMs).toBeLessThan(200);
  });

  it("caps extracted candidate URLs per message across explicit and bare shorteners", () => {
    const manyLinks = Array.from({ length: 15 }, (_, idx) => `https://example${idx}.com/test`).join(
      " ",
    );
    expect(extractCandidateUrls(manyLinks).length).toBeLessThanOrEqual(10);

    const manyShorteners = Array.from({ length: 14 }, (_, idx) => `bit.ly/sample${idx}`).join(" ");
    expect(extractCandidateUrls(manyShorteners)).toHaveLength(10);
    expect(analyzeMessage(null as unknown as string).status).toBe("invalid");
  });
});
