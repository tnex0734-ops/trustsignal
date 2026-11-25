import { AlertTriangle, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import type { IndicatorSeverity, RiskLevel } from "@/lib/analysis/types";

interface BadgeStyle {
  label: string;
  classes: string;
  Icon: typeof ShieldCheck;
}

const RISK_STYLES: Record<RiskLevel, BadgeStyle> = {
  "low-signal": {
    label: "Low signal",
    classes: "border-emerald-700/30 bg-emerald-50 text-emerald-950",
    Icon: ShieldCheck,
  },
  "needs-attention": {
    label: "Needs attention",
    classes: "border-amber-700/35 bg-amber-50 text-amber-950",
    Icon: AlertTriangle,
  },
  "high-risk": {
    label: "High risk",
    classes: "border-rose-700/35 bg-rose-50 text-rose-950",
    Icon: ShieldAlert,
  },
};

const INDICATOR_STYLES: Record<IndicatorSeverity, BadgeStyle> = {
  info: {
    label: "Note",
    classes: "border-sky-700/30 bg-sky-50 text-sky-950",
    Icon: Info,
  },
  warning: {
    label: "Warning",
    classes: "border-amber-700/35 bg-amber-50 text-amber-950",
    Icon: AlertTriangle,
  },
  critical: {
    label: "Critical signal",
    classes: "border-rose-700/35 bg-rose-50 text-rose-950",
    Icon: ShieldAlert,
  },
};

export function RiskSeverityBadge({ level }: { level: RiskLevel }) {
  const { label, classes, Icon } = RISK_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${classes}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function IndicatorSeverityBadge({ severity }: { severity: IndicatorSeverity }) {
  const { label, classes, Icon } = INDICATOR_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
