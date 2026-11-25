import { MAX_EMBEDDED_URLS, MAX_MESSAGE_LENGTH } from "./constants";
import { analyzeLink } from "./link-rules";
import { inspectTextObfuscation, normalizeForMatching, truncateEvidence } from "./normalize-text";
import { aggregateAnalysisRisk } from "./risk";
import { getRuleDefinition } from "./rules-catalogue";
import type { AnalysisResponse, EmbeddedLinkFinding, Indicator, InvalidInputResult } from "./types";

const PROTECTIVE_OTP_WARNING_REGEX =
  /\b(?:never|do\s+not|don['’]t|nobody\s+will|will\s+never|never\s+ask(?:\s+you)?\s+(?:for|to\s+share))\b[^.!?\n]{0,60}\b(?:otp|pin|cvv|password|passcode|code)\b/i;

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

function makeMessageIndicator(ruleId: string, evidence?: string): Indicator {
  const def = getRuleDefinition(ruleId);
  return {
    id: def.id,
    title: def.title,
    severity: def.severity,
    weight: def.weight,
    explanation: def.whyItMatters,
    recommendation: def.recommendation,
    ...(evidence ? { evidence: truncateEvidence(evidence) } : {}),
  };
}

function findFirstMatch(text: string, patterns: readonly RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[0]) {
      return match[0];
    }
  }
  return null;
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

export function extractCandidateUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  const explicitMatches = text.match(EXPLICIT_URL_SCAN_REGEX) ?? [];
  for (const raw of explicitMatches) {
    const cleaned = trimTrailingPunctuation(raw);
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      found.push(cleaned);
      if (found.length >= MAX_EMBEDDED_URLS) {
        return found;
      }
    }
  }

  const bareShortenerMatches = text.match(BARE_DOMAIN_SCAN_REGEX) ?? [];
  for (const raw of bareShortenerMatches) {
    const cleaned = trimTrailingPunctuation(raw);
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      found.push(cleaned);
      if (found.length >= MAX_EMBEDDED_URLS) {
        return found;
      }
    }
  }

  return found;
}

export function ruleOtpOrCredentialRequest(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, OTP_SOLICITATION_PATTERNS);
  if (!matched) {
    return null;
  }

  // If the only match occurs inside a protective "never share your OTP" statement, suppress false positive.
  const protectiveMatch = PROTECTIVE_OTP_WARNING_REGEX.exec(normalizedText);
  if (protectiveMatch) {
    const withoutProtective = normalizedText.replace(
      new RegExp(PROTECTIVE_OTP_WARNING_REGEX.source, "gi"),
      " ",
    );
    const remainingMatch = findFirstMatch(withoutProtective, OTP_SOLICITATION_PATTERNS);
    if (!remainingMatch) {
      return null;
    }
    return makeMessageIndicator("MSG_OTP_CREDENTIAL_REQUEST", remainingMatch);
  }

  return makeMessageIndicator("MSG_OTP_CREDENTIAL_REQUEST", matched);
}

export function ruleRemoteAccessRequest(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, REMOTE_ACCESS_PATTERNS);
  return matched ? makeMessageIndicator("MSG_REMOTE_ACCESS_REQUEST", matched) : null;
}

export function ruleApkSideloadRequest(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, APK_SIDELOAD_PATTERNS);
  return matched ? makeMessageIndicator("MSG_APK_SIDELOAD_REQUEST", matched) : null;
}

export function ruleUrgentPaymentDemand(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, URGENT_PAYMENT_PATTERNS);
  return matched ? makeMessageIndicator("MSG_URGENT_PAYMENT_DEMAND", matched) : null;
}

export function ruleAccountSuspensionThreat(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, ACCOUNT_SUSPENSION_PATTERNS);
  return matched ? makeMessageIndicator("MSG_ACCOUNT_SUSPENSION_THREAT", matched) : null;
}

export function ruleFakeRewardOrPrize(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, FAKE_REWARD_PATTERNS);
  return matched ? makeMessageIndicator("MSG_FAKE_REWARD_PRIZE", matched) : null;
}

export function ruleSensitivePiiRequest(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, SENSITIVE_PII_PATTERNS);
  return matched ? makeMessageIndicator("MSG_SENSITIVE_PII_REQUEST", matched) : null;
}

export function ruleImpersonationPressure(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, IMPERSONATION_PATTERNS);
  return matched ? makeMessageIndicator("MSG_IMPERSONATION_PRESSURE", matched) : null;
}

export function ruleUrgencyPressure(normalizedText: string): Indicator | null {
  const matched = findFirstMatch(normalizedText, URGENCY_PRESSURE_PATTERNS);
  return matched ? makeMessageIndicator("MSG_URGENCY_PRESSURE", matched) : null;
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
      makeMessageIndicator(
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

  // Analyze embedded URLs locally using the pure URL analyzer (zero network requests).
  const extractedUrls = extractCandidateUrls(normalized);
  const embeddedLinkResults: EmbeddedLinkFinding[] = [];
  let highestLinkSeverity: "none" | "low-signal" | "needs-attention" | "high-risk" | "invalid" =
    "none";

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
        highestLinkSeverity = "high-risk";
      } else if (highestLinkSeverity === "none") {
        highestLinkSeverity = "invalid";
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
      highestLinkSeverity = "high-risk";
    } else if (linkResult.riskLevel === "needs-attention" && highestLinkSeverity !== "high-risk") {
      highestLinkSeverity = "needs-attention";
    } else if (linkResult.riskLevel === "low-signal" && highestLinkSeverity === "none") {
      highestLinkSeverity = "low-signal";
    }
  }

  if (highestLinkSeverity === "high-risk" || highestLinkSeverity === "needs-attention") {
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
    const isHighRiskLink = highestLinkSeverity === "high-risk";
    indicators.push({
      id: baseDef.id,
      title: baseDef.title,
      severity: isHighRiskLink ? "critical" : "warning",
      weight: isHighRiskLink ? 45 : baseDef.weight,
      explanation: isHighRiskLink
        ? `${baseDef.whyItMatters} One or more links inside this message triggered high-risk URL indicators.`
        : baseDef.whyItMatters,
      recommendation: baseDef.recommendation,
      evidence: truncateEvidence(riskyUrls),
    });
  } else if (embeddedLinkResults.length > 0) {
    indicators.push(
      makeMessageIndicator(
        "MSG_EMBEDDED_LINK_INFO",
        embeddedLinkResults.map((item) => item.displayUrl).join(", "),
      ),
    );
  }

  return aggregateAnalysisRisk("message", indicators, {
    embeddedLinkResults,
  });
}
