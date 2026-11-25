"use client";

import { useState, type FormEvent } from "react";
import { MessageSquareWarning, RotateCcw } from "lucide-react";
import { InvalidInputAlert } from "@/components/results/InvalidInputAlert";
import { RiskResultPanel } from "@/components/results/RiskResultPanel";
import { runMessageCheck } from "@/features/message-check/service";
import { MAX_MESSAGE_LENGTH } from "@/lib/analysis/constants";
import type { AnalysisResponse } from "@/lib/analysis/types";
import { UI_MESSAGE_DEMO_PRESETS } from "@/test/fixtures/message-fixtures";

export function MessageCheckForm() {
  const [messageInput, setMessageInput] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(runMessageCheck(messageInput));
  };

  const handleReset = () => {
    setMessageInput("");
    setResult(null);
  };

  const handleSample = (sampleText: string) => {
    setMessageInput(sampleText);
    setResult(runMessageCheck(sampleText));
  };

  const isOverLimit = messageInput.length > MAX_MESSAGE_LENGTH;

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="message-input"
              className="text-sm font-bold text-slate-900 sm:text-base"
            >
              Paste an SMS, email, or chat message
            </label>
            <span
              id="message-char-count"
              className={`font-mono text-xs ${
                isOverLimit ? "font-bold text-rose-800" : "text-slate-600"
              }`}
            >
              {messageInput.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>

          <p id="message-help" className="mt-1 text-xs text-slate-700 sm:text-sm">
            Message text stays completely in your browser memory—nothing is uploaded, logged, or
            saved. Embedded links are inspected without opening them.
          </p>

          <textarea
            id="message-input"
            name="messageInput"
            rows={5}
            autoComplete="off"
            spellCheck={false}
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            placeholder="Paste the suspicious text message, email snippet, or chat request here..."
            aria-describedby="message-help message-char-count"
            className="mt-2.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-sky-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-sky-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
          >
            <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
            <span>Analyze message</span>
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
          Try synthetic examples (suspicious and benign)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {UI_MESSAGE_DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSample(preset.text)}
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
