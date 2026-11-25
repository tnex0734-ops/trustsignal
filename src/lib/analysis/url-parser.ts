import { MAX_URL_LENGTH } from "./constants";
import { inspectTextObfuscation, stripInvisibleCharacters } from "./normalize-text";
import type { InvalidInputResult } from "./types";

export interface ParsedCandidateUrl {
  ok: true;
  rawTrimmed: string;
  rawHadNonAsciiHost: boolean;
  obfuscationCount: number;
  bidiCount: number;
  assumedScheme: boolean;
  url: URL;
  scheme: "http:" | "https:";
  hostname: string;
  isIpAddress: boolean;
  ipDetail: string | null;
  isPunycode: boolean;
}

export type ParseCandidateUrlResult =
  | ParsedCandidateUrl
  | {
      ok: false;
      invalidResult: InvalidInputResult;
    };

const DANGEROUS_ACTIVE_SCHEMES = new Set([
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
]);

const EXPLICIT_SCHEME_REGEX = /^([a-zA-Z][a-zA-Z0-9+.-]{0,31}):/;
const IPV4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const DECIMAL_IP_REGEX = /^\d{8,10}$/;
const HEX_IP_REGEX = /^0x[0-9a-f]{6,8}$/i;
const OCTAL_IP_REGEX = /^(?:0[0-7]{1,3}\.){3}0[0-7]{1,3}$/;

function buildInvalid(
  reasonCode: InvalidInputResult["reasonCode"],
  title: string,
  explanation: string,
  safeGuidance: string[],
  detectedScheme?: string,
): ParseCandidateUrlResult {
  return {
    ok: false,
    invalidResult: {
      status: "invalid",
      kind: "link",
      reasonCode,
      title,
      explanation,
      safeGuidance,
      ...(detectedScheme ? { detectedScheme } : {}),
    },
  };
}

function isValidIpv4Host(hostname: string): boolean {
  if (!IPV4_REGEX.test(hostname)) {
    return false;
  }
  const octets = hostname.split(".");
  return octets.every((octet) => {
    const value = Number(octet);
    return Number.isInteger(value) && value >= 0 && value <= 255;
  });
}

function classifyIpHost(hostname: string): { isIp: boolean; detail: string | null } {
  const cleanHost =
    hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;

  if (hostname.startsWith("[") && hostname.endsWith("]") && cleanHost.includes(":")) {
    return { isIp: true, detail: "IPv6 address literal" };
  }

  if (isValidIpv4Host(cleanHost)) {
    if (
      cleanHost.startsWith("127.") ||
      cleanHost.startsWith("10.") ||
      cleanHost.startsWith("192.168.") ||
      cleanHost.startsWith("169.254.") ||
      /^172\.(?:1[6-9]|2\d|3[01])\./.test(cleanHost)
    ) {
      return { isIp: true, detail: "Private, loopback, or link-local IPv4 address" };
    }
    return { isIp: true, detail: "Public IPv4 address literal" };
  }

  if (
    DECIMAL_IP_REGEX.test(cleanHost) ||
    HEX_IP_REGEX.test(cleanHost) ||
    OCTAL_IP_REGEX.test(cleanHost)
  ) {
    return { isIp: true, detail: "Obfuscated numeric/hex/octal IP host" };
  }

  return { isIp: false, detail: null };
}

function looksLikeHostWithPort(input: string): boolean {
  const colonIdx = input.indexOf(":");
  if (colonIdx <= 0) {
    return false;
  }
  const beforeColon = input.slice(0, colonIdx);
  const afterColon = input.slice(colonIdx + 1);
  const hasHostHint = beforeColon.includes(".") || beforeColon === "localhost";
  return hasHostHint && /^\d{1,5}(?:[/?#]|$)/.test(afterColon);
}

function extractRawHostFragment(rawUrl: string): string {
  const afterProto = rawUrl.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
  const slashIdx = afterProto.search(/[/?#]/);
  const authority = slashIdx === -1 ? afterProto : afterProto.slice(0, slashIdx);
  const atIdx = authority.lastIndexOf("@");
  return atIdx === -1 ? authority : authority.slice(atIdx + 1);
}

function hasNonAsciiHost(rawUrl: string): boolean {
  const rawHost = extractRawHostFragment(rawUrl);
  for (let i = 0; i < rawHost.length; i += 1) {
    if (rawHost.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}

type PreparedUrlInput =
  | { ok: true; cleaned: string; obfuscationCount: number; bidiCount: number }
  | { ok: false; invalid: ParseCandidateUrlResult };

function prepareRawUrlInput(rawInput: string): PreparedUrlInput {
  if (typeof rawInput !== "string") {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Enter a valid web link",
        "The provided input is not valid text.",
        ["Paste a web link starting with https:// or http:// to inspect its structure."],
      ),
    };
  }

  if (rawInput.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      invalid: buildInvalid(
        "too-long",
        "Link exceeds maximum safe length",
        `Links longer than ${MAX_URL_LENGTH} characters are rejected to protect browser performance.`,
        [
          "Check only the primary link without extra trailing message text.",
          "Never open unusually long links containing hidden redirects.",
        ],
      ),
    };
  }

  const obfuscation = inspectTextObfuscation(rawInput);
  const cleaned = stripInvisibleCharacters(rawInput).trim();

  if (cleaned.length === 0) {
    return {
      ok: false,
      invalid: buildInvalid(
        "empty",
        "Paste a link to inspect",
        "Enter a web link above. TrustSignal parses it as text locally and never visits it.",
        ["Paste an http:// or https:// URL to review its domain and path indicators."],
      ),
    };
  }

  if (/[\u0000-\u001F\u007F\s]/.test(cleaned)) {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Link format looks incomplete or invalid",
        "A single web link cannot contain spaces or line breaks. If you pasted a whole message, use Check a message instead.",
        [
          "Switch to Check a message to scan multi-word SMS, email, or chat text.",
          "Or paste only the single web address without spaces.",
        ],
      ),
    };
  }

  return {
    ok: true,
    cleaned,
    obfuscationCount: obfuscation.zeroWidthCount,
    bidiCount: obfuscation.bidiOverrideCount,
  };
}

type ResolvedTargetResult =
  | { ok: true; targetToParse: string; assumedScheme: boolean }
  | { ok: false; invalid: ParseCandidateUrlResult };

function resolveUrlTarget(cleaned: string): ResolvedTargetResult {
  const schemeMatch = EXPLICIT_SCHEME_REGEX.exec(cleaned);
  const matchedSchemeName = schemeMatch?.[1];
  if (!matchedSchemeName || looksLikeHostWithPort(cleaned)) {
    return { ok: true, targetToParse: `https://${cleaned}`, assumedScheme: true };
  }

  const schemeLower = `${matchedSchemeName.toLowerCase()}:`;
  if (DANGEROUS_ACTIVE_SCHEMES.has(schemeLower)) {
    return {
      ok: false,
      invalid: buildInvalid(
        "unsafe-scheme",
        `Blocked non-web scheme (${schemeLower})`,
        `Links beginning with "${schemeLower}" can execute code or open local resources instead of navigating to a normal web page. TrustSignal refuses to open or execute it.`,
        [
          "Do not click, copy into your address bar, or run this input.",
          "Delete the message and warn anyone else who received it.",
        ],
        schemeLower,
      ),
    };
  }

  if (schemeLower !== "http:" && schemeLower !== "https:") {
    return {
      ok: false,
      invalid: buildInvalid(
        "unsupported-scheme",
        `Unsupported link scheme (${schemeLower})`,
        `Only http:// and https:// web links can be inspected by the link analyzer. Scheme "${schemeLower}" triggers external actions or non-web protocols.`,
        [
          "Do not tap unfamiliar app, phone, or file links from unsolicited messages.",
          "If this came inside a suspicious message, inspect the full text under Check a message.",
        ],
        schemeLower,
      ),
    };
  }

  if (!/^https?:\/\//i.test(cleaned)) {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Incomplete HTTP link format",
        "Web links require '://' after http or https (for example, https://example.com).",
        ["Verify whether the link was copied completely without missing characters."],
      ),
    };
  }

  return { ok: true, targetToParse: cleaned, assumedScheme: false };
}

function validateParsedHttpHost(parsed: URL):
  | {
      ok: true;
      scheme: "http:" | "https:";
      hostname: string;
      ipDetail: string | null;
      isIp: boolean;
    }
  | { ok: false; invalid: ParseCandidateUrlResult } {
  const scheme =
    parsed.protocol === "http:" ? "http:" : parsed.protocol === "https:" ? "https:" : null;
  if (!scheme) {
    return {
      ok: false,
      invalid: buildInvalid(
        "unsupported-scheme",
        `Unsupported scheme (${parsed.protocol})`,
        "TrustSignal only accepts http:// and https:// links for structural inspection.",
        ["Do not open unfamiliar non-HTTP links."],
        parsed.protocol,
      ),
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Link is missing a domain or host",
        "No valid domain name or IP host was found in the URL.",
        ["Paste the complete link starting with https:// or http://."],
      ),
    };
  }

  const ipCheck = classifyIpHost(hostname);
  if (!ipCheck.isIp && !hostname.includes(".") && hostname !== "localhost") {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Incomplete domain name",
        "A standard web host needs a domain suffix (such as .com or .org) or an IP address.",
        ["Check that the link was not cut off before pasting."],
      ),
    };
  }

  if (hostname.startsWith(".") || hostname.endsWith(".") || hostname.includes("..")) {
    return {
      ok: false,
      invalid: buildInvalid(
        "malformed",
        "Malformed domain dots",
        "The domain contains empty dot segments, which is not a valid host structure.",
        ["Do not trust malformed links; visit the real site manually."],
      ),
    };
  }

  return { ok: true, scheme, hostname, isIp: ipCheck.isIp, ipDetail: ipCheck.detail };
}

export function parseCandidateUrl(rawInput: string): ParseCandidateUrlResult {
  const prepared = prepareRawUrlInput(rawInput);
  if (!prepared.ok) {
    return prepared.invalid;
  }

  const target = resolveUrlTarget(prepared.cleaned);
  if (!target.ok) {
    return target.invalid;
  }

  let parsed: URL;
  try {
    parsed = new URL(target.targetToParse);
  } catch {
    return buildInvalid(
      "malformed",
      "Could not parse this as a web link",
      "The text does not follow a valid web URL structure (for example, https://example.com/path).",
      [
        "Check that you pasted a single link rather than a full paragraph.",
        "If this is an email or SMS message, paste the whole text into Check a message.",
      ],
    );
  }

  const validatedHost = validateParsedHttpHost(parsed);
  if (!validatedHost.ok) {
    return validatedHost.invalid;
  }

  const rawHadNonAsciiHost = hasNonAsciiHost(prepared.cleaned);
  const labels = validatedHost.hostname.split(".");
  const isPunycode = rawHadNonAsciiHost || labels.some((label) => label.startsWith("xn--"));

  return {
    ok: true,
    rawTrimmed: prepared.cleaned,
    rawHadNonAsciiHost,
    obfuscationCount: prepared.obfuscationCount,
    bidiCount: prepared.bidiCount,
    assumedScheme: target.assumedScheme,
    url: parsed,
    scheme: validatedHost.scheme,
    hostname: validatedHost.hostname,
    isIpAddress: validatedHost.isIp,
    ipDetail: validatedHost.ipDetail,
    isPunycode,
  };
}
