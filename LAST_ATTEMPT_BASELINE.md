# TrustSignal — Last Attempt Baseline Record

- **Recorded At:** 2026-11-25
- **Repository:** `https://github.com/tnex0734-ops/trustsignal`
- **Baseline Branch & SHA (`main` / `origin/main`):** `81604cd1f9b712265bc0f9671ae06a02a7142662` (`81604cd`)
- **Recoverable Backup Bundle:** `../trustsignal-last-attempt-baseline.bundle` (verified via `git bundle verify`)
- **Optimization Branch:** `optimization/last-attempt-2026-11-25`
- **Production URL:** `https://trustsignal-4b6t.vercel.app/`
- **Production Deployed Source SHA:** Not directly queryable via local tools (Vercel CLI not installed/authenticated locally; `gh api repos/tnex0734-ops/trustsignal/deployments` returned empty because Vercel GitHub import did not register deployment records there).

## R3 Resolution

- Searched all workspace documentation, starter kits, `.agents/skills/`, `src/`, `e2e/`, and `TrustSignal_Last_Attempt_Optimization_Kit.zip` for `\bR-?3\b` and `Requirement\s*3` (case-insensitive).
- **Result:** `R3 unresolved — clarification required before any downgrade`. No file defines `R3`; React (`19.3.1`), Next.js (`16.4.6`), Node config (`.nvmrc` `26`, `engines` `>=22.0.0`), dependencies, and features remain preserved untouched.

## Baseline Environment & Runtime Alignment

- **Local Node.js:** `v22.20.0`, **npm:** `10.9.3`
- **`.nvmrc`:** `26` (used by GitHub Actions CI `actions/setup-node@v7` and supported as default major on Vercel)
- **GitHub Actions Baseline Run:** `45609948258` on `81604cd` — `completed` (`success`, `1m7s`)

## Baseline Verification Snapshot (Reproduced Cleanly on `81604cd`)

- `npm ci`: `added 469 packages, audited 476 packages`, `0` vulnerabilities
- `npm run format:check`: passed (`exit 0`)
- `npm run lint`: passed (`0` errors, `0` warnings)
- `npm run typecheck`: passed (`0` errors)
- `npm run test:coverage`: `12` test files, `45 / 45` passed (`0` skipped) — `95.12%` statements, `95.14%` lines, `97.20%` functions, `88.27%` branches
- `npm run build`: passed (Next.js `16.4.6` Turbopack)
- `npm run test:e2e` (local): `8 / 8` passed (`11.8s`)
- `npm audit --omit=dev` and `npm audit`: `0` vulnerabilities
- Live Production Playwright Smoke (`PLAYWRIGHT_BASE_URL=https://trustsignal-4b6t.vercel.app npx playwright test`): `8 / 8` passed (`15.7s`), verifying `/`, `/learn`, `/api/health`, `/api/rules`, `/api/guides`, `/api/guidance`, CSP nonces, security headers, privacy invariants, responsive overflow, and `0` `axe-core` WCAG 2.2 AA violations.
