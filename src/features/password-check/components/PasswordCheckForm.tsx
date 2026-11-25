"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Lock, RotateCcw } from "lucide-react";
import { RiskSeverityBadge } from "@/components/ui/SeverityBadge";
import { assessPasswordLocally } from "@/features/password-check/service";
import { MAX_PASSWORD_LENGTH } from "@/lib/analysis/constants";
import { DEMO_PASSWORD_PRESETS } from "@/lib/analysis/demo-presets";
import type { PasswordAssessment, PasswordStrengthTier } from "@/lib/analysis/types";

const TIER_LABEL_MAP: Record<PasswordStrengthTier, string> = {
  "very-weak": "Very weak",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
  "very-strong": "Very strong",
};

export function PasswordCheckForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [assessment, setAssessment] = useState<PasswordAssessment | null>(null);

  const handlePasswordChange = (nextValue: string) => {
    setPassword(nextValue);
    if (nextValue.length === 0) {
      setAssessment(null);
      return;
    }
    setAssessment(assessPasswordLocally(nextValue));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAssessment(assessPasswordLocally(password));
  };

  const handleClear = () => {
    setPassword("");
    setShowPassword(false);
    setAssessment(null);
  };

  const codePointCount = Array.from(password).length;
  const isOverLimit = codePointCount > MAX_PASSWORD_LENGTH;

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="password-input"
              className="text-sm font-bold text-slate-900 sm:text-base"
            >
              Test password or passphrase strength locally
            </label>
            <span
              id="password-char-count"
              className={`font-mono text-xs ${
                isOverLimit ? "font-bold text-rose-800" : "text-slate-600"
              }`}
            >
              {codePointCount} / {MAX_PASSWORD_LENGTH} chars
            </span>
          </div>

          <p id="password-help" className="mt-1 text-xs text-slate-700 sm:text-sm">
            Evaluated 100% offline inside your browser—never sent over the network, stored, or
            logged. Switching tabs or clicking Clear removes it from memory immediately.
          </p>

          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <KeyRound
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="password-input"
                name="passwordInput"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                placeholder="Enter a test password or passphrase..."
                aria-describedby="password-help password-char-count"
                className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 font-mono text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-sky-700"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              {showPassword ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-sky-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>Check password</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Synthetic test samples (never reuse sample passwords on real accounts)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_PASSWORD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePasswordChange(preset.sample)}
              className="min-h-[38px] cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {assessment ? (
        <section
          aria-live="polite"
          aria-label="Password strength assessment"
          className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6"
        >
          {assessment.status === "assessed" && assessment.tier && assessment.riskLevel ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <RiskSeverityBadge level={assessment.riskLevel} />
                  <span className="text-sm font-bold text-slate-900">
                    Strength: {TIER_LABEL_MAP[assessment.tier]} ({assessment.score} / 4)
                  </span>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-800">
                  Length: {assessment.characterCount} chars
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900">{assessment.summary}</h3>

              {assessment.detectedPatterns.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                    Observed patterns
                  </h4>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {assessment.detectedPatterns.map((pattern) => (
                      <li
                        key={pattern}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800"
                      >
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">{assessment.summary}</p>
            </div>
          )}

          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
            <h4 className="text-sm font-bold text-slate-900">How to strengthen your passwords</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-800">
              {assessment.suggestions.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-sky-800"
                    aria-hidden="true"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Local-only limits &amp; privacy note
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700 sm:text-sm">
              {assessment.limitations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
