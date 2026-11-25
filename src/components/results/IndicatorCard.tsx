import { IndicatorSeverityBadge } from "@/components/ui/SeverityBadge";
import type { Indicator } from "@/lib/analysis/types";

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <IndicatorSeverityBadge severity={indicator.severity} />
          <h4 className="text-sm font-semibold text-slate-900 sm:text-base">{indicator.title}</h4>
        </div>
        <span className="font-mono text-xs text-slate-600">{indicator.id}</span>
      </div>

      {indicator.evidence ? (
        <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
          <span className="font-semibold text-slate-900">Matched signal: </span>
          <code className="break-all font-mono text-slate-900">{indicator.evidence}</code>
        </p>
      ) : null}

      <p className="mt-2.5 text-sm text-slate-700">{indicator.explanation}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">
        <span className="text-sky-900">Safer action: </span>
        {indicator.recommendation}
      </p>
    </li>
  );
}
