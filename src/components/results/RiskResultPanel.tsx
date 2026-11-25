import { CheckCircle2, Info, ShieldOff } from "lucide-react";
import { IndicatorCard } from "@/components/results/IndicatorCard";
import { RiskSeverityBadge } from "@/components/ui/SeverityBadge";
import type { ValidAnalysisResult } from "@/lib/analysis/types";

const PANEL_BORDER_MAP = {
  "low-signal": "border-emerald-200 bg-emerald-50/40",
  "needs-attention": "border-amber-300 bg-amber-50/40",
  "high-risk": "border-rose-300 bg-rose-50/40",
} as const;

export function RiskResultPanel({ result }: { result: ValidAnalysisResult }) {
  return (
    <section
      aria-live="polite"
      aria-label="Analysis result"
      className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6"
    >
      <div className={`rounded-xl border p-4 sm:p-5 ${PANEL_BORDER_MAP[result.riskLevel]}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RiskSeverityBadge level={result.riskLevel} />
          <span className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800">
            Heuristic indicator score: {result.heuristicScore} / 100 (not a probability)
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">{result.summary}</h3>

        {result.riskLevel === "low-signal" ? (
          <p className="mt-2 flex items-start gap-2 text-xs font-medium text-slate-800 sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" aria-hidden="true" />
            <span>
              Important: Low signal means no tested warning rules fired. It does not certify this
              {result.kind === "link" ? " website" : " message"} as safe.
            </span>
          </p>
        ) : null}
      </div>

      {result.parsedLink ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900">
              Parsed link details (inspected as text only)
            </h4>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
              <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
              Never opened or fetched
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:text-sm">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <dt className="font-medium text-slate-600">Protocol</dt>
              <dd className="mt-0.5 font-mono font-semibold text-slate-900">
                {result.parsedLink.scheme}
                {result.parsedLink.assumedScheme ? " (assumed)" : ""}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 sm:col-span-2">
              <dt className="font-medium text-slate-600">Destination host</dt>
              <dd className="mt-0.5 break-all font-mono font-semibold text-slate-900">
                {result.parsedLink.hostname}
                {result.parsedLink.port ? `:${result.parsedLink.port}` : ""}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {result.embeddedLinkResults && result.embeddedLinkResults.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Embedded links inspected locally ({result.embeddedLinkResults.length})
          </h4>
          <ul className="mt-3 space-y-2">
            {result.embeddedLinkResults.map((link, index) => (
              <li
                key={`${link.displayUrl}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm"
              >
                <code className="break-all font-mono text-slate-900">{link.displayUrl}</code>
                <span className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                  {link.riskLevel === "invalid" ? "Invalid / blocked" : link.riskLevel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Detected indicators ({result.indicators.length})
        </h4>
        {result.indicators.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {result.indicators.map((indicator) => (
              <IndicatorCard key={indicator.id} indicator={indicator} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            No warning indicators matched our local rule set. Still verify the source independently
            before entering credentials or sending money.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
        <h4 className="text-sm font-bold text-slate-900">Recommended next steps</h4>
        <ul className="mt-2 space-y-2 text-sm text-slate-800">
          {result.nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" aria-hidden="true" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
          Limitations &amp; privacy guarantees
        </h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700 sm:text-sm">
          {result.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
