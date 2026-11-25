import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_URL_LENGTH } from "@/lib/analysis/constants";
import { parseCandidateUrl } from "@/lib/analysis/url-parser";

describe("parseCandidateUrl", () => {
  it("parses standard HTTPS URLs safely", () => {
    const parsed = parseCandidateUrl("  https://www.example.com/path?a=1  ");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.scheme).toBe("https:");
      expect(parsed.hostname).toBe("www.example.com");
      expect(parsed.assumedScheme).toBe(false);
      expect(parsed.isIpAddress).toBe(false);
      expect(parsed.isPunycode).toBe(false);
    }
  });

  it("accepts domain-like strings without scheme while flagging assumedScheme", () => {
    const parsed = parseCandidateUrl("bit.ly/3xDemo");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.assumedScheme).toBe(true);
      expect(parsed.hostname).toBe("bit.ly");
    }
  });

  it("blocks dangerous active and local schemes without execution", () => {
    for (const dangerous of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ]) {
      const result = parseCandidateUrl(dangerous);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.invalidResult.reasonCode).toBe("unsafe-scheme");
      }
    }
  });

  it("rejects unsupported non-HTTP schemes cleanly", () => {
    const result = parseCandidateUrl("ftp://files.example.com/archive.zip");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalidResult.reasonCode).toBe("unsupported-scheme");
      expect(result.invalidResult.detectedScheme).toBe("ftp:");
    }
  });

  it("rejects empty, multi-word, malformed, and oversized URLs", () => {
    expect(parseCandidateUrl("   ").ok).toBe(false);
    expect(parseCandidateUrl("hello world not a link").ok).toBe(false);
    expect(parseCandidateUrl("https://[invalid-ipv6").ok).toBe(false);
    expect(parseCandidateUrl("https://example..com").ok).toBe(false);

    const oversized = `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`;
    const tooLong = parseCandidateUrl(oversized);
    expect(tooLong.ok).toBe(false);
    if (!tooLong.ok) {
      expect(tooLong.invalidResult.reasonCode).toBe("too-long");
    }
  });

  it("detects IPv4, IPv6, and obfuscated numeric IP addresses", () => {
    const ipv4 = parseCandidateUrl("http://192.0.2.10/login");
    expect(ipv4.ok).toBe(true);
    if (ipv4.ok) {
      expect(ipv4.isIpAddress).toBe(true);
    }

    const ipv6 = parseCandidateUrl("http://[::1]:8080/admin");
    expect(ipv6.ok).toBe(true);
    if (ipv6.ok) {
      expect(ipv6.isIpAddress).toBe(true);
    }

    const decimalIp = parseCandidateUrl("http://2130706433/login");
    expect(decimalIp.ok).toBe(true);
    if (decimalIp.ok) {
      expect(decimalIp.isIpAddress).toBe(true);
    }
  });

  it("detects Punycode and non-ASCII internationalized hostnames", () => {
    const puny = parseCandidateUrl("https://xn--pypal-4ve.com/login");
    expect(puny.ok).toBe(true);
    if (puny.ok) {
      expect(puny.isPunycode).toBe(true);
    }

    const unicodeHost = parseCandidateUrl("https://p\u0430ypal.com/signin");
    expect(unicodeHost.ok).toBe(true);
    if (unicodeHost.ok) {
      expect(unicodeHost.isPunycode).toBe(true);
      expect(unicodeHost.rawHadNonAsciiHost).toBe(true);
    }
  });

  it("handles hex/octal IP hosts, localhost with port, incomplete schemes, and single-label hosts", () => {
    const hexIp = parseCandidateUrl("http://0x7f000001/login");
    expect(hexIp.ok).toBe(true);
    if (hexIp.ok) {
      expect(hexIp.isIpAddress).toBe(true);
    }

    const octalIp = parseCandidateUrl("http://0177.0.0.1/login");
    expect(octalIp.ok).toBe(true);
    if (octalIp.ok) {
      expect(octalIp.isIpAddress).toBe(true);
    }

    const localhostPort = parseCandidateUrl("localhost:3000/check");
    expect(localhostPort.ok).toBe(true);
    if (localhostPort.ok) {
      expect(localhostPort.assumedScheme).toBe(true);
      expect(localhostPort.hostname).toBe("localhost");
    }

    const missingSlashes = parseCandidateUrl("http:example.com/login");
    expect(missingSlashes.ok).toBe(false);
    if (!missingSlashes.ok) {
      expect(missingSlashes.invalidResult.reasonCode).toBe("malformed");
    }

    const singleLabel = parseCandidateUrl("https://intranet/login");
    expect(singleLabel.ok).toBe(false);
    if (!singleLabel.ok) {
      expect(singleLabel.invalidResult.reasonCode).toBe("malformed");
    }

    expect(parseCandidateUrl(":8080/bad").ok).toBe(false);
    expect(parseCandidateUrl(null as unknown as string).ok).toBe(false);
  });

  it("enforces architectural separation: production source never imports test fixtures", () => {
    const srcRoot = path.resolve(process.cwd(), "src");
    const files = fs.readdirSync(srcRoot, { recursive: true }) as string[];
    for (const relPath of files) {
      if (relPath.startsWith(`test${path.sep}`) || relPath.startsWith("test/")) {
        continue;
      }
      const fullPath = path.join(srcRoot, relPath);
      if (fs.statSync(fullPath).isFile() && /\.(ts|tsx)$/.test(relPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        expect(content, relPath).not.toContain("@/test/");
      }
    }
  });
});
