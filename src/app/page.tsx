import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, ShieldOff } from "lucide-react";
import { EmergencyStepsPanel } from "@/components/safety/SafetyGuidesGrid";
import { TrustSignalWorkbench } from "@/features/workbench/TrustSignalWorkbench";

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-800/20 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-950">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            TrustSignal helps people pause before they click, pay, reply or share a password.
          </span>
        </p>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          Check suspicious links, scam messages and password strength before you act.
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
          Get a calm, explainable first-pass safety check. See exactly which warning signals
          triggered and what to do next—without sending your messages or passwords to any server.
        </p>

        <ul className="mt-5 grid grid-cols-1 gap-2.5 text-xs font-medium text-slate-800 sm:grid-cols-3 sm:text-sm">
          <li className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <ShieldOff className="h-4 w-4 shrink-0 text-sky-900" aria-hidden="true" />
            <span>Links parsed as text—never visited</span>
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <Lock className="h-4 w-4 shrink-0 text-sky-900" aria-hidden="true" />
            <span>Messages &amp; passwords stay in browser</span>
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sky-900" aria-hidden="true" />
            <span>Clear explanations, no fake safety claims</span>
          </li>
        </ul>
      </section>

      <TrustSignalWorkbench />

      <div className="mt-10 space-y-6">
        <EmergencyStepsPanel />

        <section
          aria-labelledby="learn-banner-heading"
          className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
        >
          <div>
            <h2 id="learn-banner-heading" className="text-lg font-bold text-slate-900">
              Want to recognize phishing and lookalike domains faster?
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Read six short practical safety guides and inspect the public detection rule catalog.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <span>Open Safety Guides</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
