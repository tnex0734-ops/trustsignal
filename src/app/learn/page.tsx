import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { EmergencyStepsPanel, SafetyGuidesGrid } from "@/components/safety/SafetyGuidesGrid";
import { IndicatorSeverityBadge } from "@/components/ui/SeverityBadge";
import { COMMON_ANALYSIS_LIMITATIONS } from "@/lib/analysis/constants";
import { RULE_CATALOGUE } from "@/lib/analysis/rules-catalogue";

export default function LearnPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg text-sm font-semibold text-sky-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Safety Checker</span>
        </Link>

        <div className="mt-3 flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-sky-900" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Digital Safety Guides &amp; Rule Transparency
          </h1>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 sm:text-base">
          Short, actionable lessons to spot phishing, protect OTPs and passwords, verify links
          independently, and respond calmly if something goes wrong.
        </p>
      </div>

      <section aria-label="Safety lessons">
        <SafetyGuidesGrid />
      </section>

      <div className="mt-8">
        <EmergencyStepsPanel />
      </div>

      <section aria-labelledby="rule-catalogue-heading" className="mt-10">
        <h2 id="rule-catalogue-heading" className="text-xl font-bold text-slate-950">
          Public Detection Rule Catalogue ({RULE_CATALOGUE.length} deterministic rules)
        </h2>
        <p className="mt-1.5 text-sm text-slate-700">
          TrustSignal avoids opaque scores. Every warning indicator below runs locally in your
          browser and is also published as metadata via{" "}
          <code className="font-mono">/api/rules</code>.
        </p>

        <ul className="mt-4 space-y-3">
          {RULE_CATALOGUE.map((rule) => (
            <li
              key={rule.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <IndicatorSeverityBadge severity={rule.severity} />
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                    {rule.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">{rule.title}</h3>
                </div>
                <span className="font-mono text-xs text-slate-600">
                  {rule.id} (weight {rule.weight})
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{rule.whyItMatters}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Important scope &amp; limitations
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700 sm:text-sm">
            {COMMON_ANALYSIS_LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
