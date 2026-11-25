"use client";

import type { FormEvent, ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { InvalidInputAlert } from "@/components/results/InvalidInputAlert";
import { RiskResultPanel } from "@/components/results/RiskResultPanel";
import type { AnalysisResponse } from "@/lib/analysis/types";

export interface SamplePresetOption {
  id: string;
  label: string;
  value: string;
}

interface ScannerFormShellProps {
  inputId: string;
  countId: string;
  helpId: string;
  label: string;
  helpText: string;
  charCount: number;
  maxLength: number;
  submitLabel: string;
  submitIcon: ReactNode;
  samplesHeading: string;
  samples: readonly SamplePresetOption[];
  result: AnalysisResponse | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onSelectSample: (value: string) => void;
  children: ReactNode;
}

/**
 * Shared accessible form shell for Link and Message scanners.
 * Eliminates duplicated counter, action, sample preset, and result switching markup.
 */
export function ScannerFormShell({
  inputId,
  countId,
  helpId,
  label,
  helpText,
  charCount,
  maxLength,
  submitLabel,
  submitIcon,
  samplesHeading,
  samples,
  result,
  onSubmit,
  onReset,
  onSelectSample,
  children,
}: ScannerFormShellProps) {
  const isOverLimit = charCount > maxLength;

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={inputId} className="text-sm font-bold text-slate-900 sm:text-base">
              {label}
            </label>
            <span
              id={countId}
              className={`font-mono text-xs ${
                isOverLimit ? "font-bold text-rose-800" : "text-slate-600"
              }`}
            >
              {charCount} / {maxLength}
            </span>
          </div>

          <p id={helpId} className="mt-1 text-xs text-slate-700 sm:text-sm">
            {helpText}
          </p>

          {children}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-sky-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
          >
            {submitIcon}
            <span>{submitLabel}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {samplesHeading}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {samples.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectSample(preset.value)}
              className="min-h-[38px] cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {result ? (
        result.status === "invalid" ? (
          <InvalidInputAlert result={result} />
        ) : (
          <RiskResultPanel result={result} />
        )
      ) : null}
    </div>
  );
}
