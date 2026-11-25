import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, getStaticSecurityHeaders } from "@/lib/security/headers";

describe("security headers", () => {
  it("builds strict production CSP with cryptographic nonce and without unsafe-eval", () => {
    const csp = buildContentSecurityPolicy({ nonce: "abc123==", isDevelopment: false });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-abc123==' 'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("includes unsafe-eval only in development mode and omits script unsafe-inline in non-dev fallback", () => {
    const devCsp = buildContentSecurityPolicy({ nonce: "dev123", isDevelopment: true });
    expect(devCsp).toContain("'unsafe-eval'");

    const devNoNonce = buildContentSecurityPolicy({ isDevelopment: true });
    expect(devNoNonce).toContain("'unsafe-inline'");

    const prodNoNonce = buildContentSecurityPolicy({ isDevelopment: false });
    expect(prodNoNonce).toContain("script-src 'self';");
  });

  it("disables DNS prefetching and framing in static security headers", () => {
    const headers = getStaticSecurityHeaders();
    const map = new Map(headers.map((entry) => [entry.key, entry.value]));

    expect(map.get("X-DNS-Prefetch-Control")).toBe("off");
    expect(map.get("X-Frame-Options")).toBe("DENY");
    expect(map.get("X-Content-Type-Options")).toBe("nosniff");
    expect(map.get("Referrer-Policy")).toBe("no-referrer");
    expect(map.get("Strict-Transport-Security")).toContain("max-age=31536000");
  });
});
