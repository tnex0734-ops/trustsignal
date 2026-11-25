import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { EMERGENCY_RESPONSE_STEPS, SAFETY_GUIDES } from "@/lib/guidance/guides-data";

export function EmergencyStepsPanel() {
  return (
    <section
      aria-labelledby="emergency-steps-heading"
      className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-800" aria-hidden="true" />
        <div>
          <h2 id="emergency-steps-heading" className="text-lg font-bold text-slate-900">
            Already clicked a link or shared an OTP or password?
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Take these calm, immediate steps to reduce harm and protect your accounts:
          </p>
        </div>
      </div>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-900">
        {EMERGENCY_RESPONSE_STEPS.map((step) => (
          <li key={step} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SafetyGuidesGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {SAFETY_GUIDES.map((guide) => (
        <article
          key={guide.id}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <span className="w-fit rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-900">
            {guide.threatCategory}
          </span>
          <h2 className="mt-2.5 text-lg font-bold text-slate-900">{guide.title}</h2>
          <p className="mt-2 text-sm text-slate-700">{guide.summary}</p>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
              Common warning signs
            </h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {guide.warningSigns.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-sky-900">
              Safer actions
            </h3>
            <ul className="mt-1.5 space-y-1.5 text-sm text-slate-800">
              {guide.safeActions.map((action) => (
                <li key={action} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
