import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg text-slate-900 no-underline">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-900 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <span className="block text-base font-bold leading-tight text-slate-900">
              TrustSignal
            </span>
            <span className="block text-xs font-medium text-slate-600">
              Stop. Check. Stay Safe.
            </span>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="min-h-[40px] rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Safety Checker
          </Link>
          <Link
            href="/learn"
            className="min-h-[40px] rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Safety Guides
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/30 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-950">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Browser-Only Analysis</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
