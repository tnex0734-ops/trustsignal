import { COMMON_ANALYSIS_LIMITATIONS, RISK_THRESHOLDS } from "./constants";
import type {
  AnalysisKind,
  EmbeddedLinkFinding,
  Indicator,
  IndicatorSeverity,
  ParsedLinkSummary,
  RiskLevel,
  ValidAnalysisResult,
} from "./types";

const SEVERITY_ORDER: Record<IndicatorSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

export interface AggregationOptions {
  parsedLink?: ParsedLinkSummary;
  embeddedLinkResults?: EmbeddedLinkFinding[];
}

function deduplicateAndSortIndicators(indicators: readonly Indicator[]): Indicator[] {
  const byId = new Map<string, Indicator>();

  for (const item of indicators) {
    const existing = byId.get(item.id);
    if (!existing || item.weight > existing.weight) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    const weightDiff = b.weight - a.weight;
    if (weightDiff !== 0) {
      return weightDiff;
    }
    return a.id.localeCompare(b.id);
  });
}

function buildSummary(kind: AnalysisKind, riskLevel: RiskLevel, indicators: Indicator[]): string {
  const noun = kind === "link" ? "link" : "message";

  if (riskLevel === "high-risk") {
    return `High-risk warning signs were found in this ${noun}. Pause before clicking, replying, paying, or sharing any code or password.`;
  }

  if (riskLevel === "needs-attention") {
    return `This ${noun} contains signals that need attention (${indicators.length} indicator${indicators.length === 1 ? "" : "s"}). Verify the sender or website through an official source before acting.`;
  }

  if (indicators.length > 0) {
    return `Low signal: only minor informational notes were detected in this ${noun}. That does not prove it is safe—still confirm unfamiliar requests independently.`;
  }

  return `Low signal: no warning rules matched this ${noun}. However, no warning found does not prove the ${noun} is safe or authentic.`;
}

function buildNextSteps(
  kind: AnalysisKind,
  riskLevel: RiskLevel,
  indicators: readonly Indicator[],
): string[] {
  const steps: string[] = [];
  const seen = new Set<string>();

  const pushStep = (step: string) => {
    if (!seen.has(step)) {
      seen.add(step);
      steps.push(step);
    }
  };

  for (const ind of indicators) {
    pushStep(ind.recommendation);
  }

  if (riskLevel === "high-risk") {
    pushStep(
      "If you already shared a password or OTP, change your password immediately from the official app/website, enable MFA, and contact your bank via its official number if money was involved.",
    );
  } else if (riskLevel === "needs-attention") {
    pushStep(
      kind === "link"
        ? "Type the organization's known website address manually or open its official app instead of following this link."
        : "Confirm the message through an independent official contact method before clicking or replying.",
    );
  } else {
    pushStep(
      kind === "link"
        ? "Before signing in or entering personal details, verify the exact domain name in your browser bar."
        : "Even without clear scam phrases, verify unexpected requests for money, logins, or sensitive details independently.",
    );
  }

  return steps.slice(0, 5);
}

/**
 * Calibrated, transparent risk aggregation engine.
 * Combines rule weights with critical-indicator overrides so single weak cues
 * (like "urgent" alone) do not inflate into false-positive high-risk alerts.
 */
export function aggregateAnalysisRisk(
  kind: AnalysisKind,
  rawIndicators: readonly Indicator[],
  options: AggregationOptions = {},
): ValidAnalysisResult {
  const indicators = deduplicateAndSortIndicators(rawIndicators);

  const rawScore = indicators.reduce((total, indicator) => total + indicator.weight, 0);
  const hasCritical = indicators.some((indicator) => indicator.severity === "critical");

  let heuristicScore = Math.min(rawScore, RISK_THRESHOLDS.maxScore);
  if (hasCritical && heuristicScore < RISK_THRESHOLDS.criticalFloorScore) {
    heuristicScore = RISK_THRESHOLDS.criticalFloorScore;
  }

  let riskLevel: RiskLevel;
  if (hasCritical || heuristicScore >= RISK_THRESHOLDS.highRiskMinScore) {
    riskLevel = "high-risk";
  } else if (heuristicScore >= RISK_THRESHOLDS.needsAttentionMinScore) {
    riskLevel = "needs-attention";
  } else {
    riskLevel = "low-signal";
  }

  return {
    status: "analyzed",
    kind,
    riskLevel,
    heuristicScore,
    summary: buildSummary(kind, riskLevel, indicators),
    indicators,
    nextSteps: buildNextSteps(kind, riskLevel, indicators),
    limitations: [...COMMON_ANALYSIS_LIMITATIONS],
    ...(options.parsedLink ? { parsedLink: options.parsedLink } : {}),
    ...(options.embeddedLinkResults && options.embeddedLinkResults.length > 0
      ? { embeddedLinkResults: options.embeddedLinkResults }
      : {}),
  };
}
