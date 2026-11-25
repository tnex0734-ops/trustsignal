import { MAX_EMBEDDED_URLS, MAX_MESSAGE_LENGTH } from "./constants";
import { analyzeLink } from "./link-rules";
import { inspectTextObfuscation, normalizeForMatching, truncateEvidence } from "./normalize-text";
import { aggregateAnalysisRisk } from "./risk";
import { createIndicatorFromRule, getRuleDefinition } from "./rules-catalogue";
import type { AnalysisResponse, EmbeddedLinkFinding, Indicator, InvalidInputResult } from "./types";

const PROTECTIVE_OTP_WARNING_REGEX =
  /\b(?:never|do\s+not|don['’]t|nobody\s+will|will\s+never|never\s+ask(?:\s+you)?\s+(?:for|to\s+share))\b[^.!?\n]{0,60}\b(?:otp|pin|cvv|password|passcode|code)\b/i;

const PROTECTIVE_OTP_WARNING_GLOBAL_REGEX =
  /\b(?:never|do\s+not|don['’]t|nobody\s+will|will\s+never|never\s+ask(?:\s+you)?\s+(?:for|to\s+share))\b[^.!?\n]{0,60}\b(?:otp|pin|cvv|password|passcode|code)\b/gi;

const OTP_SOLICITATION_PATTERNS: readonly RegExp[] = [
  /\b(?:share|send|reply|provide|enter|confirm|tell|give|forward|submit|type|verify)\b[^.!?\n]{0,45}\b(?:otp|one[- ]time\s+(?:passcode|password|code)|verification\s+code|6[- ]digit\s+code|security\s+code|pin|cvv|password|passcode|seed\s+phrase|recovery\s+(?:phrase|code))\b/i,
  /\b(?:otp|one[- ]time\s+(?:passcode|password|code)|verification\s+code|pin|cvv|password|seed\s+phrase|recovery\s+(?:phrase|code))\b[^.!?\n]{0,35}\b(?:required|needed|to\s+(?:cancel|verify|unlock|claim|receive|complete)|below|here)\b/i,
];

const REMOTE_ACCESS_PATTERNS: readonly RegExp[] = [
  /\b(?:anydesk|teamviewer|quicksupport|rustdesk|ultraviewer|screenconnect|supremo|aweray)\b/i,
  /\b(?:install|download|open)\b[^.!?\n]{0,40}\b(?:screen[- ]?shar(?:e|ing)|remote[- ]?(?:access|support|desktop))\b/i,
  /\b(?:read|share|send|give)\b[^.!?\n]{0,35}\b(?:9[- ]digit|remote|support|session)\s*(?:id|code)\b/i,
];

const APK_SIDELOAD_PATTERNS: readonly RegExp[] = [
  /\b[a-z0-9_-]{1,40}\.apk\b/i,
  /\b(?:install|download|update)\b[^.!?\n]{0,40}\b(?:apk|unknown\s+sources|outside\s+(?:the\s+)?play\s+store)\b/i,
];

const URGENT_PAYMENT_PATTERNS: readonly RegExp[] = [
  /\b(?:apple|google\s+play|steam|amazon|razergold)\s+gift\s*cards?\b/i,
  /\b(?:pay|transfer|send)\b[^.!?\n]{0,45}\b(?:crypto|bitcoin|btc|usdt|wallet|wire\s+transfer|processing\s+fee|customs\s+fee|clearance\s+fee|penalty|fine)\b/i,
  /\b(?:enter|type|confirm)\b[^.!?\n]{0,35}\b(?:upi\s+pin|mpin)\b[^.!?\n]{0,35}\b(?:receive|claim|refund|cashback|credit)\b/i,
  /\b(?:approve|accept)\b[^.!?\n]{0,35}\b(?:upi\s+collect|payment\s+request)\b/i,
];

const ACCOUNT_SUSPENSION_PATTERNS: readonly RegExp[] = [
  /\b(?:account|card|sim|kyc|wallet|banking|access|service)\b[^.!?\n]{0,45}\b(?:will\s+be\s+)?(?:suspended|blocked|deactivated|frozen|locked|terminated|closed|disconnected)\b/i,
  /\b(?:kyc\s+(?:expired|pending|suspended|blocked)|pan\s+update\s+mandatory)\b/i,
  /\b(?:arrest\s+warrant|legal\s+action|cyber\s+complaint|court\s+summons)\b[^.!?\n]{0,40}\b(?:unless|within|today|immediately)\b/i,
];

const FAKE_REWARD_PATTERNS: readonly RegExp[] = [
  /\b(?:congratulations|lucky\s+winner|you(?:'ve|\s+have)\s+won|selected\s+as\s+winner)\b/i,
  /\b(?:claim\s+your|unclaimed)\b[^.!?\n]{0,35}\b(?:prize|reward|lottery|grant|cashback|inheritance|bonus)\b/i,
];

const SENSITIVE_PII_PATTERNS: readonly RegExp[] = [
  /\b(?:send|share|enter|provide|verify|update|reply\s+with)\b[^.!?\n]{0,40}\b(?:aadhaar|aadhar|pan\s+card|ssn|social\s+security|passport\s+number|card\s+number|debit\s+card|credit\s+card|bank\s+account\s+number|routing\s+number|expiry\s+date)\b/i,
];

const IMPERSONATION_PATTERNS: readonly RegExp[] = [
  /\b(?:bank\s+(?:fraud|security|support)\s+(?:desk|team|department)|customs\s+(?:officer|department)|cyber\s+cell|tax\s+(?:department|authority)|income\s+tax)\b/i,
  /\b(?:do\s+not\s+tell\s+anyone|keep\s+this\s+confidential|don['’]t\s+inform\s+anyone)\b/i,
  /\b(?:it\s+helpdesk|technical\s+support)\b[^.!?\n]{0,45}\b(?:fix|resolve|issue|mailbox|virus)\b/i,
];

const URGENCY_PRESSURE_PATTERNS: readonly RegExp[] = [
  /\b(?:urgent|act\s+now|act\s+immediately|immediately|final\s+notice|last\s+chance|expires\s+today|within\s+\d+\s+(?:minutes?|hours?))\b/i,
];

// Flat, bounded regexes with zero nested quantifiers for safe URL extraction.
const EXPLICIT_URL_SCAN_REGEX = /\b(?:https?|javascript|data|vbscript|file):[^\s<>"'`]{1,500}/gi;
const BARE_DOMAIN_SCAN_REGEX =
  /\b(?:bit\.ly|tinyurl\.com|t\.co|rb\.gy|cutt\.ly|shorturl\.at|is\.gd|ow\.ly|t\.ly)\/[a-zA-Z0-9_-]{2,80}\b/gi;

function findFirstMatch(text: string, patterns: readonly RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[0]) {
      return match[0];
    }
  }
  return null;
}

function matchFirstRulePattern(
  text: string,
  ruleId: string,
  patterns: readonly RegExp[],
): Indicator | null {
  const matched = findFirstMatch(text, patterns);
  return matched ? createIndicatorFromRule(ruleId, matched) : null;
}

function buildInvalidMessage(
  reasonCode: InvalidInputResult["reasonCode"],
  title: string,
  explanation: string,
  safeGuidance: string[],
): InvalidInputResult {
  return {
    status: "invalid",
    kind: "message",
    reasonCode,
    title,
    explanation,
    safeGuidance,
  };
}

function trimTrailingPunctuation(candidate: string): string {
  return candidate.replace(/[.,;:!?)\]]+$/, "");
}

function collectBoundedUrls(
  text: string,
  pattern: RegExp,
  seen: Set<string>,
  found: string[],
): void {
  const matches = text.match(pattern) ?? [];
  for (const raw of matches) {
    if (found.length >= MAX_EMBEDDED_URLS) {
      return;
    }
    const cleaned = trimTrailingPunctuation(raw);
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      found.push(cleaned);
    }
  }
}

export function extractCandidateUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  collectBoundedUrls(text, EXPLICIT_URL_SCAN_REGEX, seen, found);
  collectBoundedUrls(text, BARE_DOMAIN_SCAN_REGEX, seen, found);
  return found;
}

export function ruleOtpOrCredentialRequest(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, OTP_SOLICITATION_PATTERNS);
  if (!matched) {
    return null;
  }

  // If a protective anti-scam warning is present, check whether an independent solicitation remains outside it.
  if (PROTECTIVE_OTP_WARNING_REGEX.test(normalizedText)) {
    PROTECTIVE_OTP_WARNING_GLOBAL_REGEX.lastIndex = 0;
    const withoutProtective = normalizedText.replace(PROTECTIVE_OTP_WARNING_GLOBAL_REGEX, " ");
    const remainingMatch = findFirstMatch(withoutProtective, OTP_SOLICITATION_PATTERNS);
    return remainingMatch
      ? createIndicatorFromRule("MSG_OTP_CREDENTIAL_REQUEST", remainingMatch)
      : null;
  }

  return createIndicatorFromRule("MSG_OTP_CREDENTIAL_REQUEST", matched);
}

export function ruleRemoteAccessRequest(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(normalizedText, "MSG_REMOTE_ACCESS_REQUEST", REMOTE_ACCESS_PATTERNS);
}

export function ruleApkSideloadRequest(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(normalizedText, "MSG_APK_SIDELOAD_REQUEST", APK_SIDELOAD_PATTERNS);
}

export function ruleUrgentPaymentDemand(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(
    normalizedText,
    "MSG_URGENT_PAYMENT_DEMAND",
    URGENT_PAYMENT_PATTERNS,
  );
}

export function ruleAccountSuspensionThreat(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(
    normalizedText,
    "MSG_ACCOUNT_SUSPENSION_THREAT",
    ACCOUNT_SUSPENSION_PATTERNS,
  );
}

export function ruleFakeRewardOrPrize(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(normalizedText, "MSG_FAKE_REWARD_PRIZE", FAKE_REWARD_PATTERNS);
}

export function ruleSensitivePiiRequest(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(normalizedText, "MSG_SENSITIVE_PII_REQUEST", SENSITIVE_PII_PATTERNS);
}

export function ruleImpersonationPressure(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(
    normalizedText,
    "MSG_IMPERSONATION_PRESSURE",
    IMPERSONATION_PATTERNS,
  );
}

export function ruleUrgencyPressure(normalizedText: string): Indicator | null {
  return matchFirstRulePattern(normalizedText, "MSG_URGENCY_PRESSURE", URGENCY_PRESSURE_PATTERNS);
}

type HighestLinkRisk = "none" | "low-signal" | "needs-attention" | "high-risk" | "invalid";

function inspectEmbeddedLinks(normalizedText: string): {
  embeddedLinkResults: EmbeddedLinkFinding[];
  linkIndicator: Indicator | null;
} {
  const extractedUrls = extractCandidateUrls(normalizedText);
  const embeddedLinkResults: EmbeddedLinkFinding[] = [];
  let highestRisk: HighestLinkRisk = "none";

  for (const candidateUrl of extractedUrls) {
    const linkResult = analyzeLink(candidateUrl);
    if (linkResult.status === "invalid") {
      embeddedLinkResults.push({
        displayUrl: truncateEvidence(candidateUrl),
        riskLevel: "invalid",
        indicatorIds: [linkResult.reasonCode],
        summary: linkResult.title,
      });
      if (linkResult.reasonCode === "unsafe-scheme") {
        highestRisk = "high-risk";
      } else if (highestRisk === "none") {
        highestRisk = "invalid";
      }
      continue;
    }

    embeddedLinkResults.push({
      displayUrl: truncateEvidence(candidateUrl),
      riskLevel: linkResult.riskLevel,
      indicatorIds: linkResult.indicators.map((ind) => ind.id),
      summary: linkResult.summary,
    });

    if (linkResult.riskLevel === "high-risk") {
      highestRisk = "high-risk";
    } else if (linkResult.riskLevel === "needs-attention" && highestRisk !== "high-risk") {
      highestRisk = "needs-attention";
    } else if (linkResult.riskLevel === "low-signal" && highestRisk === "none") {
      highestRisk = "low-signal";
    }
  }

  if (highestRisk === "high-risk" || highestRisk === "needs-attention") {
    const riskyUrls = embeddedLinkResults
      .filter(
        (item) =>
          item.riskLevel === "high-risk" ||
          item.riskLevel === "needs-attention" ||
          item.riskLevel === "invalid",
      )
      .map((item) => `${item.displayUrl} (${item.riskLevel})`)
      .join(", ");

    const baseDef = getRuleDefinition("MSG_EMBEDDED_RISKY_LINK");
    const isHighRisk = highestRisk === "high-risk";
    return {
      embeddedLinkResults,
      linkIndicator: {
        id: baseDef.id,
        title: baseDef.title,
        severity: isHighRisk ? "critical" : "warning",
        weight: isHighRisk ? 45 : baseDef.weight,
        explanation: isHighRisk
          ? `${baseDef.whyItMatters} One or more links inside this message triggered high-risk URL indicators.`
          : baseDef.whyItMatters,
        recommendation: baseDef.recommendation,
        evidence: truncateEvidence(riskyUrls),
      },
    };
  }

  if (embeddedLinkResults.length > 0) {
    return {
      embeddedLinkResults,
      linkIndicator: createIndicatorFromRule(
        "MSG_EMBEDDED_LINK_INFO",
        embeddedLinkResults.map((item) => item.displayUrl).join(", "),
      ),
    };
  }

  return { embeddedLinkResults, linkIndicator: null };
}

/**
 * Pure, deterministic local message analyzer.
 * Never transmits message text to any API and never opens extracted URLs.
 */
export function analyzeMessage(rawInput: string): AnalysisResponse {
  if (typeof rawInput !== "string") {
    return buildInvalidMessage(
      "malformed",
      "Enter message text to inspect",
      "The provided message input is not valid text.",
      ["Paste the SMS, email, or chat message text you received."],
    );
  }

  if (rawInput.length > MAX_MESSAGE_LENGTH) {
    return buildInvalidMessage(
      "too-long",
      "Message exceeds maximum safe length",
      `Messages longer than ${MAX_MESSAGE_LENGTH} characters are rejected to keep browser analysis fast and responsive.`,
      [
        "Paste only the suspicious portion of the email or chat message (up to 8,000 characters).",
        "If it includes a link, you can also inspect that single link under Check a link.",
      ],
    );
  }

  const obfuscation = inspectTextObfuscation(rawInput);
  const normalized = normalizeForMatching(rawInput);

  if (normalized.length === 0) {
    return buildInvalidMessage(
      "empty",
      "Paste a message to inspect",
      "Paste text from an SMS, email, or chat message. Analysis stays in your browser.",
      ["Try one of the sample messages below if you want to see how detection works."],
    );
  }

  const candidateIndicators: Array<Indicator | null> = [
    ruleOtpOrCredentialRequest(normalized),
    ruleRemoteAccessRequest(normalized),
    ruleApkSideloadRequest(normalized),
    ruleUrgentPaymentDemand(normalized),
    ruleSensitivePiiRequest(normalized),
    ruleAccountSuspensionThreat(normalized),
    ruleFakeRewardOrPrize(normalized),
    ruleImpersonationPressure(normalized),
    ruleUrgencyPressure(normalized),
  ];

  if (obfuscation.bidiOverrideCount > 0 || obfuscation.zeroWidthCount >= 3) {
    candidateIndicators.push(
      createIndicatorFromRule(
        "MSG_OBFUSCATED_TEXT",
        `Hidden Unicode control characters (bidi: ${obfuscation.bidiOverrideCount}, zero-width: ${obfuscation.zeroWidthCount})`,
      ),
    );
  }

  const indicators: Indicator[] = [];
  for (const item of candidateIndicators) {
    if (item !== null) {
      indicators.push(item);
    }
  }

  const { embeddedLinkResults, linkIndicator } = inspectEmbeddedLinks(normalized);
  if (linkIndicator) {
    indicators.push(linkIndicator);
  }

  return aggregateAnalysisRisk("message", indicators, {
    embeddedLinkResults,
  });
}
