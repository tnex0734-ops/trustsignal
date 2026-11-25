export type RiskLevel = "low-signal" | "needs-attention" | "high-risk";

export type IndicatorSeverity = "info" | "warning" | "critical";

export type AnalysisKind = "link" | "message";

export type RuleCategory = "link" | "message" | "password";

export interface RuleDefinition {
  id: string;
  category: RuleCategory;
  title: string;
  severity: IndicatorSeverity;
  weight: number;
  summary: string;
  whyItMatters: string;
  recommendation: string;
}

export interface Indicator {
  id: string;
  title: string;
  severity: IndicatorSeverity;
  weight: number;
  explanation: string;
  recommendation: string;
  evidence?: string;
}

export interface ParsedLinkSummary {
  normalizedUrl: string;
  scheme: "http:" | "https:";
  assumedScheme: boolean;
  hostname: string;
  port: string;
  pathname: string;
  hasQuery: boolean;
  hasUserInfo: boolean;
  isPunycode: boolean;
  isIpAddress: boolean;
}

export interface EmbeddedLinkFinding {
  displayUrl: string;
  riskLevel: RiskLevel | "invalid";
  indicatorIds: string[];
  summary: string;
}

export interface ValidAnalysisResult {
  status: "analyzed";
  kind: AnalysisKind;
  riskLevel: RiskLevel;
  heuristicScore: number;
  summary: string;
  indicators: Indicator[];
  nextSteps: string[];
  limitations: string[];
  parsedLink?: ParsedLinkSummary;
  embeddedLinkResults?: EmbeddedLinkFinding[];
}

export type InvalidReasonCode =
  "empty" | "too-long" | "unsafe-scheme" | "unsupported-scheme" | "malformed";

export interface InvalidInputResult {
  status: "invalid";
  kind: AnalysisKind;
  reasonCode: InvalidReasonCode;
  title: string;
  explanation: string;
  safeGuidance: string[];
  detectedScheme?: string;
}

export type AnalysisResponse = ValidAnalysisResult | InvalidInputResult;

export type PasswordStrengthTier = "very-weak" | "weak" | "fair" | "strong" | "very-strong";

export interface PasswordAssessment {
  status: "empty" | "too-long" | "assessed";
  tier?: PasswordStrengthTier;
  riskLevel?: RiskLevel;
  score?: 0 | 1 | 2 | 3 | 4;
  characterCount?: number;
  detectedPatterns: string[];
  summary: string;
  suggestions: string[];
  limitations: string[];
}
