"use client";

import { useState, type FormEvent } from "react";
import { Link2, SearchCheck } from "lucide-react";
import { ScannerFormShell } from "@/components/scanner/ScannerFormShell";
import { runLinkCheck } from "@/features/link-check/service";
import { MAX_URL_LENGTH } from "@/lib/analysis/constants";
import { DEMO_LINK_PRESETS } from "@/lib/analysis/demo-presets";
import type { AnalysisResponse } from "@/lib/analysis/types";

const LINK_SAMPLE_OPTIONS = DEMO_LINK_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  value: preset.url,
}));

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

  return (
    <ScannerFormShell
      inputId="link-input"
      countId="link-char-count"
      helpId="link-help"
      label="Paste a suspicious or unfamiliar web link"
      helpText="TrustSignal inspects the text structure locally in your browser. It never opens, fetches, previews, or contacts the link."
      charCount={urlInput.length}
      maxLength={MAX_URL_LENGTH}
      submitLabel="Analyze link"
      submitIcon={<SearchCheck className="h-4 w-4" aria-hidden="true" />}
      samplesHeading="Try synthetic examples"
      samples={LINK_SAMPLE_OPTIONS}
      result={result}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onSelectSample={handleSample}
    >
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
    </ScannerFormShell>
  );
}
