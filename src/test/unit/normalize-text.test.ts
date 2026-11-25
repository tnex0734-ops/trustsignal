import { describe, expect, it } from "vitest";
import {
  decodePunycodeHostname,
  hasNonAsciiCharacters,
  inspectTextObfuscation,
  normalizeConfusableAscii,
  normalizeForMatching,
  stripInvisibleCharacters,
  truncateEvidence,
} from "@/lib/analysis/normalize-text";

describe("normalize-text", () => {
  it("detects and strips zero-width and bidi override characters", () => {
    const obfuscated = "https://\u200Bexample\u202E.com\uFEFF";
    const stats = inspectTextObfuscation(obfuscated);
    expect(stats.zeroWidthCount).toBe(2);
    expect(stats.bidiOverrideCount).toBe(1);
    expect(stripInvisibleCharacters(obfuscated)).toBe("https://example.com");
  });

  it("normalizes NFKC compatibility forms and collapses whitespace", () => {
    expect(normalizeForMatching("  ＨＴＴＰＳ  ｕｒｇｅｎｔ   OTP  ")).toBe("HTTPS urgent OTP");
  });

  it("maps Cyrillic, Greek, and leetspeak homoglyphs to canonical ASCII", () => {
    expect(normalizeConfusableAscii("p\u0430yp\u04301")).toBe("paypai".replace("i", "l"));
    expect(normalizeConfusableAscii("g00gle")).toBe("google");
    expect(normalizeConfusableAscii("arnazon")).toBe("amazon");
  });

  it("detects non-ASCII code units accurately", () => {
    expect(hasNonAsciiCharacters("example.com")).toBe(false);
    expect(hasNonAsciiCharacters("p\u0430ypal.com")).toBe(true);
  });

  it("truncates long evidence strings safely without splitting emojis", () => {
    const longText = "🔐".repeat(60);
    const truncated = truncateEvidence(longText, 20);
    expect(Array.from(truncated).length).toBe(20);
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("decodes valid Punycode hostnames and preserves malformed labels safely", () => {
    expect(decodePunycodeHostname("xn--pypal-4ve.example.com")).toBe("p\u0430ypal.example.com");
    expect(decodePunycodeHostname("xn--invalid!label.example.com")).toBe(
      "xn--invalid!label.example.com",
    );
  });
});
