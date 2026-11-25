import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-7 text-xs text-slate-700 sm:px-6 sm:text-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-900">
            TrustSignal — Privacy-first defensive security assistant
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="font-medium text-sky-900 underline hover:text-sky-700">
              Safety Checker
            </Link>
            <Link href="/learn" className="font-medium text-sky-900 underline hover:text-sky-700">
              Safety Guides &amp; Rules
            </Link>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          TrustSignal parses submitted links locally as text without opening or resolving them,
          processes messages and passwords exclusively in your browser, and never guarantees that an
          item with Low signal is safe.
        </p>
      </div>
    </footer>
  );
}
