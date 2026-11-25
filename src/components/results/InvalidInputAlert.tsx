import { ShieldAlert, Info } from "lucide-react";
import type { InvalidInputResult } from "@/lib/analysis/types";

export function InvalidInputAlert({ result }: { result: InvalidInputResult }) {
  const isBlockedScheme = result.reasonCode === "unsafe-scheme";
  const containerClasses = isBlockedScheme
    ? "border-rose-300 bg-rose-50 text-rose-950"
    : "border-amber-300 bg-amber-50 text-amber-950";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 rounded-2xl border p-5 ${containerClasses}`}
    >
      <div className="flex items-start gap-3">
        {isBlockedScheme ? (
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-800" aria-hidden="true" />
        ) : (
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide">
            {isBlockedScheme ? "Blocked unsafe scheme" : "Input check"}
          </p>
          <h3 className="mt-0.5 text-lg font-bold">{result.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed">{result.explanation}</p>

          {result.safeGuidance.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {result.safeGuidance.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
