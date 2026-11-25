"use client";

import { useState, type FormEvent } from "react";
import { Link2, RotateCcw, SearchCheck } from "lucide-react";
import { InvalidInputAlert } from "@/components/results/InvalidInputAlert";
import { RiskResultPanel } from "@/components/results/RiskResultPanel";
import { runLinkCheck } from "@/features/link-check/service";
import { MAX_URL_LENGTH } from "@/lib/analysis/constants";
import type { AnalysisResponse } from "@/lib/analysis/types";
import { UI_LINK_DEMO_PRESETS } from "@/test/fixtures/link-fixtures";

export function LinkCheckForm() {
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(runLinkCheck(urlInput));
  };

  const handleReset = () => {
    setUrlInput("");
    setResult(null);
  };

  const handleSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    setResult(runLinkCheck(sampleUrl));
  };

  const isOverLimit = urlInput.length > MAX_URL_LENGTH;

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="link-input" className="text-sm font-bold text-slate-900 sm:text-base">
              Paste a suspicious or unfamiliar web link
            </label>
            <span
              id="link-char-count"
              className={`font-mono text-xs ${
                isOverLimit ? "font-bold text-rose-800" : "text-slate-600"
              }`}
            >
              {urlInput.length} / {MAX_URL_LENGTH}
            </span>
          </div>

          <p id="link-help" className="mt-1 text-xs text-slate-700 sm:text-sm">
            TrustSignal inspects the text structure locally in your browser. It never opens,
            fetches, previews, or contacts the link.
          </p>

          <div className="relative mt-2.5">
            <Link2
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              id="link-input"
              name="linkInput"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://example.com/verify"
              aria-describedby="link-help link-char-count"
              className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 font-mono text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-sky-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-sky-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
          >
            <SearchCheck className="h-4 w-4" aria-hidden="true" />
            <span>Analyze link</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Try synthetic examples
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {UI_LINK_DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSample(preset.url)}
              className="min-h-[38px] cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSample("javascript:alert(1)")}
            className="min-h-[38px] cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100"
          >
            Unsafe scheme example: javascript:
          </button>
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
