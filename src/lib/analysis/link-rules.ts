import { BRAND_PATTERNS, HIGH_ABUSE_TLDS, KNOWN_URL_SHORTENERS } from "./constants";
import { decodePunycodeHostname, normalizeConfusableAscii } from "./normalize-text";
import { aggregateAnalysisRisk } from "./risk";
import { createIndicatorFromRule } from "./rules-catalogue";
import { parseCandidateUrl, type ParsedCandidateUrl } from "./url-parser";
import type { AnalysisResponse, Indicator } from "./types";

const EXECUTABLE_PATH_REGEX = /\.(?:apk|exe|msi|scr|bat|cmd|vbs|ps1|dmg)(?:$|[?#])/i;
const OPEN_REDIRECT_PARAM_NAMES = new Set([
  "redirect",
  "redirect_uri",
  "redirect_url",
  "next",
  "url",
  "target",
  "return",
  "returnurl",
  "return_url",
  "dest",
  "destination",
  "continue",
]);

const HIGH_RISK_PATH_TOKENS = [
  "otp",
  "kyc",
  "suspend",
  "suspended",
  "unlock",
  "claim-prize",
  "claimprize",
  "claim-reward",
  "seed-phrase",
  "recovery-phrase",
  "verify-account",
  "update-billing",
  "refund-claim",
];

const AUTH_PATH_TOKENS = ["login", "signin", "sign-in", "account", "auth"];

const SUSPICIOUS_HOST_LURE_TOKENS = [
  "verify",
  "secure",
  "login",
  "signin",
  "update",
  "kyc",
  "suspend",
  "support",
  "wallet",
  "billing",
  "reward",
  "claim",
  "unlock",
  "alert",
];

interface AuthorityTokens {
  rawLower: string;
  segments: string[];
  joined: string;
}

function tokenizeAuthority(rawValue: string, decodePunycode: boolean): AuthorityTokens {
  const rawLower = rawValue.toLowerCase();
  if (!rawLower) {
    return { rawLower: "", segments: [], joined: "" };
  }
  const decoded = decodePunycode ? decodePunycodeHostname(rawLower) : rawLower;
  const normalized = normalizeConfusableAscii(decoded);
  const segments = normalized.split(/[.-]/).filter((part) => part.length > 0);
  return { rawLower, segments, joined: segments.join("") };
}

function authorityMatchesBrandToken(
  authority: AuthorityTokens,
  rawToken: string,
  normalizedToken: string,
): boolean {
  if (!authority.rawLower) {
    return false;
  }
  if (authority.segments.some((seg) => seg === normalizedToken)) {
    return true;
  }
  return (
    normalizedToken.length >= 5 &&
    (authority.joined.includes(normalizedToken) || authority.rawLower.includes(rawToken))
  );
}

function isOfficialDomainForBrand(hostname: string, officialRoots: readonly string[]): boolean {
  return officialRoots.some((root) => hostname === root || hostname.endsWith(`.${root}`));
}

export function ruleUserInfoInAuthority(parsed: ParsedCandidateUrl): Indicator | null {
  if (!parsed.url.username && !parsed.url.password) {
    return null;
  }
  return createIndicatorFromRule(
    "LINK_USERINFO_CREDENTIALS",
    `Authority specifies user credentials before @${parsed.hostname}`,
  );
}

export function ruleIpAddressHost(parsed: ParsedCandidateUrl): Indicator | null {
  if (!parsed.isIpAddress) {
    return null;
  }
  const detail = parsed.ipDetail ?? "Numeric IP host";
  return createIndicatorFromRule("LINK_IP_ADDRESS_HOST", `${detail}: ${parsed.hostname}`);
}

export function rulePunycodeOrIdn(parsed: ParsedCandidateUrl): Indicator | null {
  if (!parsed.isPunycode) {
    return null;
  }
  const decodedHost = decodePunycodeHostname(parsed.hostname);
  const detail = parsed.rawHadNonAsciiHost
    ? `Non-ASCII host normalized to ${parsed.hostname} (decoded: ${decodedHost})`
    : `Punycode domain: ${parsed.hostname} (decoded: ${decodedHost})`;
  return createIndicatorFromRule("LINK_PUNYCODE_IDN", detail);
}

export function ruleKnownUrlShortener(parsed: ParsedCandidateUrl): Indicator | null {
  for (const shortener of KNOWN_URL_SHORTENERS) {
    if (parsed.hostname === shortener || parsed.hostname.endsWith(`.${shortener}`)) {
      return createIndicatorFromRule("LINK_URL_SHORTENER", `Shortener domain: ${shortener}`);
    }
  }
  return null;
}

export function ruleInsecureHttpScheme(parsed: ParsedCandidateUrl): Indicator | null {
  if (parsed.scheme !== "http:") {
    return null;
  }
  return createIndicatorFromRule("LINK_INSECURE_HTTP", "Uses unencrypted http:// scheme");
}

export function ruleAssumedScheme(parsed: ParsedCandidateUrl): Indicator | null {
  if (!parsed.assumedScheme) {
    return null;
  }
  return createIndicatorFromRule(
    "LINK_ASSUMED_SCHEME",
    "No http:// or https:// prefix was included in the input",
  );
}

export function ruleObfuscatedCharacters(parsed: ParsedCandidateUrl): Indicator | null {
  if (parsed.bidiCount === 0 && parsed.obfuscationCount === 0) {
    return null;
  }
  return createIndicatorFromRule(
    "LINK_OBFUSCATED_CHARACTERS",
    `Hidden control characters detected (bidi: ${parsed.bidiCount}, zero-width: ${parsed.obfuscationCount})`,
  );
}

export function ruleExcessiveSubdomains(parsed: ParsedCandidateUrl): Indicator | null {
  if (parsed.isIpAddress) {
    return null;
  }
  const rawLabels = parsed.hostname.split(".");
  const effectiveLabels = rawLabels[0] === "www" ? rawLabels.slice(1) : rawLabels;
  if (effectiveLabels.length < 4) {
    return null;
  }
  return createIndicatorFromRule(
    "LINK_EXCESSIVE_SUBDOMAINS",
    `${effectiveLabels.length} domain labels: ${parsed.hostname}`,
  );
}

export function ruleBrandLookalike(parsed: ParsedCandidateUrl): Indicator | null {
  if (parsed.isIpAddress) {
    return null;
  }

  const hostAuthority = tokenizeAuthority(parsed.hostname, true);
  const userInfoAuthority = tokenizeAuthority(parsed.url.username, false);

  for (const entry of BRAND_PATTERNS) {
    if (isOfficialDomainForBrand(hostAuthority.rawLower, entry.officialRoots)) {
      continue;
    }

    for (const token of entry.lookalikeTokens) {
      const normalizedToken = normalizeConfusableAscii(token);
      const matchedUserInfo = authorityMatchesBrandToken(userInfoAuthority, token, normalizedToken);
      const matchedHost = authorityMatchesBrandToken(hostAuthority, token, normalizedToken);

      if (matchedHost || matchedUserInfo) {
        const evidenceText = matchedUserInfo
          ? `Userinfo "${userInfoAuthority.rawLower}" mimics "${entry.brand}" while redirecting to "${parsed.hostname}"`
          : `Host "${parsed.hostname}" resembles "${entry.brand}" without matching official domains (${entry.officialRoots.join(", ")})`;
        return createIndicatorFromRule("LINK_BRAND_LOOKALIKE", evidenceText);
      }
    }
  }

  return null;
}

export function ruleSuspiciousHostPatterns(parsed: ParsedCandidateUrl): Indicator | null {
  if (parsed.isIpAddress) {
    return null;
  }

  const reasons: string[] = [];
  const labels = parsed.hostname.split(".");
  const tld = labels[labels.length - 1] ?? "";

  if (parsed.url.port && parsed.url.port !== "80" && parsed.url.port !== "443") {
    reasons.push(`non-standard port :${parsed.url.port}`);
  }

  if (parsed.hostname.length > 60) {
    reasons.push(`unusually long hostname (${parsed.hostname.length} chars)`);
  }

  const maxHyphens = labels.reduce((max, label) => {
    const count = label.split("-").length - 1;
    return Math.max(max, count);
  }, 0);

  if (maxHyphens >= 3) {
    reasons.push(`multiple hyphens in domain label (${maxHyphens})`);
  }

  const nonTldText = labels.slice(0, -1).join(".");
  const matchedLures = SUSPICIOUS_HOST_LURE_TOKENS.filter((token) => nonTldText.includes(token));

  if (matchedLures.length >= 2) {
    reasons.push(`multiple security-lure terms in host (${matchedLures.slice(0, 3).join(", ")})`);
  } else if (matchedLures.length === 1 && (HIGH_ABUSE_TLDS.has(tld) || maxHyphens >= 2)) {
    reasons.push(
      `lure term "${matchedLures[0]}" paired with ${HIGH_ABUSE_TLDS.has(tld) ? `.${tld} TLD` : "hyphenated host"}`,
    );
  }

  if (reasons.length === 0) {
    return null;
  }

  return createIndicatorFromRule("LINK_SUSPICIOUS_HOST_PATTERN", reasons.join("; "));
}

export function ruleDeceptivePathOrQuery(parsed: ParsedCandidateUrl): Indicator[] {
  const results: Indicator[] = [];
  const pathPlusSearch = `${parsed.url.pathname}${parsed.url.search}`;
  const lowerPath = parsed.url.pathname.toLowerCase();
  const lowerCombined = pathPlusSearch.toLowerCase();

  if (EXECUTABLE_PATH_REGEX.test(lowerPath)) {
    results.push(
      createIndicatorFromRule(
        "LINK_EXECUTABLE_DOWNLOAD",
        `Direct installer/executable path: ${parsed.url.pathname}`,
      ),
    );
  }

  const suspiciousFindings: string[] = [];

  for (const [key, value] of parsed.url.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    const lowerVal = value.trim().toLowerCase();
    if (
      OPEN_REDIRECT_PARAM_NAMES.has(lowerKey) &&
      (lowerVal.startsWith("http://") ||
        lowerVal.startsWith("https://") ||
        lowerVal.startsWith("//"))
    ) {
      suspiciousFindings.push(`redirect parameter "${key}"`);
    }
  }

  for (const token of HIGH_RISK_PATH_TOKENS) {
    if (lowerCombined.includes(token)) {
      suspiciousFindings.push(`path/query token "${token}"`);
      break;
    }
  }

  if (suspiciousFindings.length > 0) {
    results.push(
      createIndicatorFromRule("LINK_DECEPTIVE_PATH_QUERY", suspiciousFindings.join("; ")),
    );
    return results;
  }

  const matchedAuth = AUTH_PATH_TOKENS.find((token) => lowerPath.split(/[/_-]+/).includes(token));
  if (matchedAuth) {
    results.push(
      createIndicatorFromRule("LINK_AUTH_PATH_NOTICE", `Path references "${matchedAuth}"`),
    );
  }

  return results;
}

/**
 * Pure, deterministic local URL analyzer.
 * Never opens, fetches, preloads, or resolves DNS for submitted URLs.
 */
export function analyzeLink(rawInput: string): AnalysisResponse {
  const parsedResult = parseCandidateUrl(rawInput);
  if (!parsedResult.ok) {
    return parsedResult.invalidResult;
  }

  const candidateRules: Array<Indicator | null> = [
    ruleObfuscatedCharacters(parsedResult),
    ruleUserInfoInAuthority(parsedResult),
    ruleIpAddressHost(parsedResult),
    ruleBrandLookalike(parsedResult),
    rulePunycodeOrIdn(parsedResult),
    ruleKnownUrlShortener(parsedResult),
    ruleInsecureHttpScheme(parsedResult),
    ruleExcessiveSubdomains(parsedResult),
    ruleSuspiciousHostPatterns(parsedResult),
    ruleAssumedScheme(parsedResult),
  ];

  const indicators: Indicator[] = [];
  for (const item of candidateRules) {
    if (item !== null) {
      indicators.push(item);
    }
  }
  indicators.push(...ruleDeceptivePathOrQuery(parsedResult));

  return aggregateAnalysisRisk("link", indicators, {
    parsedLink: {
      normalizedUrl: parsedResult.url.href,
      scheme: parsedResult.scheme,
      assumedScheme: parsedResult.assumedScheme,
      hostname: parsedResult.hostname,
      port: parsedResult.url.port,
      pathname: parsedResult.url.pathname,
      hasQuery: parsedResult.url.search.length > 0,
      hasUserInfo: Boolean(parsedResult.url.username || parsedResult.url.password),
      isPunycode: parsedResult.isPunycode,
      isIpAddress: parsedResult.isIpAddress,
    },
  });
}
