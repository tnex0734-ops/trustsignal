"use client";

import { useState, type FormEvent } from "react";
import { MessageSquareWarning } from "lucide-react";
import { ScannerFormShell } from "@/components/scanner/ScannerFormShell";
import { runMessageCheck } from "@/features/message-check/service";
import { MAX_MESSAGE_LENGTH } from "@/lib/analysis/constants";
import { DEMO_MESSAGE_PRESETS } from "@/lib/analysis/demo-presets";
import type { AnalysisResponse } from "@/lib/analysis/types";

const MESSAGE_SAMPLE_OPTIONS = DEMO_MESSAGE_PRESETS.map((preset) => ({
  id: preset.id,
  label: preset.label,
  value: preset.text,
}));

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

  return (
    <ScannerFormShell
      inputId="message-input"
      countId="message-char-count"
      helpId="message-help"
      label="Paste an SMS, email, or chat message"
      helpText="Message text stays completely in your browser memory—nothing is uploaded, logged, or saved. Embedded links are inspected without opening them."
      charCount={messageInput.length}
      maxLength={MAX_MESSAGE_LENGTH}
      submitLabel="Analyze message"
      submitIcon={<MessageSquareWarning className="h-4 w-4" aria-hidden="true" />}
      samplesHeading="Try synthetic examples (suspicious and benign)"
      samples={MESSAGE_SAMPLE_OPTIONS}
      result={result}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onSelectSample={handleSample}
    >
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
    </ScannerFormShell>
  );
}
