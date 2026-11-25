# TrustSignal — Last-Attempt Audit & Candidate Release Report

- **Date:** 2026-11-25
- **Repository:** `https://github.com/tnex0734-ops/trustsignal`
- **Candidate Branch:** `optimization/last-attempt-2026-11-25` (Draft PR `#1`: `https://github.com/tnex0734-ops/trustsignal/pull/1`)
- **Verified Candidate Code Commit SHA:** `40156e43dad391227f8617a850c65a0b0135042b` (`40156e4`)

---

## 1. Baseline Commit & Production Deployment Identity

- **Protected Baseline (`main` / `origin/main`):** `81604cd1f9b712265bc0f9671ae06a02a7142662` (`81604cd`)
- **Recoverable Git Backup Bundle:** `../trustsignal-last-attempt-baseline.bundle` (verified via `git bundle verify` — `is okay`, 4 refs at `81604cd1f9b712265bc0f9671ae06a02a7142662`)
- **Production URL:** `https://trustsignal-4b6t.vercel.app/` (left **untouched**; returned `200 OK` on `/`, `/learn`, `/api/health`, `/api/rules`, `/api/guides`, `/api/guidance` and passed `8 / 8` live Playwright smoke checks)
- **Production Deployed Source SHA:** Not directly queryable via local tools (Vercel CLI is not installed or authenticated locally, and `gh api repos/tnex0734-ops/trustsignal/deployments` returned `[]`).

---

## 2. R3 Resolution

**`R3 unresolved — clarification required before any downgrade`**

An exhaustive case-insensitive search across all files in `C:\Users\TNEX\OneDrive\Desktop\HACK2SKILL`, `TrustSignal_Last_Attempt_Optimization_Kit.zip`, `.agents/skills/`, project documentation, `src/`, and `e2e/` for `\bR-?3\b` and `Requirement\s*3` returned zero matches defining `R3`. React (`19.3.1`), Next.js (`16.4.6`), `.nvmrc` (`26`), `engines.node` (`>=22.0.0`), pinned dependencies, and implemented product features were preserved unchanged.

---

## 3. Findings Ranked by Evidence, Score Relevance, and Regression Risk

1. **Rank 1 — Production/Test Boundary Violation & UI Markup Duplication (High Evidence | High Code Quality Impact | Low Regression Risk)**
   - **Finding:** `LinkCheckForm.tsx`, `MessageCheckForm.tsx`, and `PasswordCheckForm.tsx` imported UI sample presets directly from `@/test/fixtures/*`, and `LinkCheckForm` + `MessageCheckForm` duplicated ~200 lines of form header, counter, submit/reset buttons, sample buttons, and result-panel switching.
   - **Fix:** Added `src/lib/analysis/demo-presets.ts` and extracted shared `src/components/scanner/ScannerFormShell.tsx`. Added unit guard asserting zero `@/test/` imports in non-test `src/` files.
2. **Rank 2 — Domain Cohesion, Static Safety, and React Key Stability (High Evidence | High Code Quality Impact | Very Low Regression Risk)**
   - **Finding:** `url-parser.ts` used a non-null assertion (`schemeMatch[1]!`) and a monolithic `parseCandidateUrl` function; `link-rules.ts` and `message-rules.ts` duplicated indicator construction (`makeIndicator` / `makeMessageIndicator`), URL collection loops, and host vs userinfo brand tokenization; `ruleOtpOrCredentialRequest` recompiled `new RegExp(...)` on every protective match; `RiskResultPanel.tsx` keyed embedded link `<li>` items solely on truncated `link.displayUrl`.
   - **Fix:** Added `createIndicatorFromRule` in `rules-catalogue.ts`; factored `parseCandidateUrl` (`hasNonAsciiHost`, `prepareRawUrlInput`, `resolveUrlTarget`, `validateParsedHttpHost`), `tokenizeAuthority` + `authorityMatchesBrandToken`, `matchFirstRulePattern`, `collectBoundedUrls`, `inspectEmbeddedLinks`, and static `PROTECTIVE_OTP_WARNING_GLOBAL_REGEX`; switched `RiskResultPanel` key to `` `${link.displayUrl}-${index}` ``.
3. **Rank 3 — Homograph Confusable Gap & Branch Test Coverage Gaps (High Evidence | High Testing + Defensive Security Precision | Low Regression Risk)**
   - **Finding:** RFC 3492 Apple homograph domain `xn--80ak6aa92e` decodes to `аррӏе` (`\u0430\u0440\u0440\u04CF\u0435`), where Cyrillic small palochka `\u04CF` (`ӏ`) was not in `CONFUSABLE_CHAR_MAP`. Additionally, branch coverage sat at `88.27%` (`444/503`) with uncovered guards/tiers across URL parsing, Punycode multi-character bias adaptation, message protective-warning evasion combinations, password `score === 2` / `score === 3` / date tiers, UI validation states, and strict HTML `<script nonce>` vs CSP header parity in Playwright.
   - **Fix:** Added `["\u04CF", "l"]` and `["\u04C0", "l"]` to `CONFUSABLE_CHAR_MAP` and added targeted unit, integration, and E2E assertions.
4. **Informational Infra Finding (Low Actionability Within Repo):**
   - `tnex0734-ops/trustsignal` currently has 4 Vercel project GitHub integrations (`trustsignal-4b6t`, `trustsignal`, `trustsignal-hecm`, `engine`). Only `trustsignal-4b6t` built cleanly on PR `#1`; the other three sibling Vercel projects failed in Vercel dashboard configuration (outside repository files).

---

## 4. Changes Made and Why

- `src/lib/analysis/demo-presets.ts` *(new)* — Moves UI preset data out of `src/test/fixtures/` into `src/lib/analysis/`.
- `src/components/scanner/ScannerFormShell.tsx` *(new)* — Shared accessible form shell preserving all IDs, `aria-describedby` bindings, focus states, and styling across `LinkCheckForm` and `MessageCheckForm`.
- `src/features/link-check/components/LinkCheckForm.tsx`, `src/features/message-check/components/MessageCheckForm.tsx`, `src/features/password-check/components/PasswordCheckForm.tsx` — Consume `ScannerFormShell` and `DEMO_*_PRESETS`.
- `src/components/results/RiskResultPanel.tsx` — Prevents React key collisions when distinct long URLs share a truncated prefix (`key={`${link.displayUrl}-${index}`}`).
- `src/lib/analysis/rules-catalogue.ts` — Adds `createIndicatorFromRule` shared builder.
- `src/lib/analysis/url-parser.ts` — Removes `!` non-null assertion and decomposes `parseCandidateUrl` into single-purpose helpers.
- `src/lib/analysis/link-rules.ts` — Uses `createIndicatorFromRule`, extracts `tokenizeAuthority` and `authorityMatchesBrandToken`.
- `src/lib/analysis/message-rules.ts` — Uses `createIndicatorFromRule`, extracts `matchFirstRulePattern`, `collectBoundedUrls`, `inspectEmbeddedLinks`, and replaces runtime `new RegExp` with `PROTECTIVE_OTP_WARNING_GLOBAL_REGEX`.
- `src/lib/analysis/normalize-text.ts` — Adds Cyrillic Palochka confusables `\u04CF` and `\u04C0` -> `l`.
- `src/test/fixtures/{link,message,password}-fixtures.ts` — Removes unused `UI_*_DEMO_PRESETS` exports.
- `src/test/unit/{url-parser,link-rules,message-rules,normalize-text,password-service}.test.ts` & `src/test/integration/workbench.test.tsx` — Covers architecture import guard, Palochka Punycode homograph, RFC 3492 multi-char `adaptBias`, malformed/non-string/IP/single-label URL branches, protective-warning + OTP evasion, benign/malformed link handling, `score === 2` / `3` / date password tiers, and UI empty/preset/clear branches.
- `e2e/trustsignal.spec.ts` — Extracts `assertNonceScriptCsp` helper and verifies every rendered `<script nonce="...">` tag matches the response CSP header nonce on `/` and `/learn` with zero script `'unsafe-inline'`.
- `README.md`, `DECISIONS.md` (`ADR-007`), `TEST_RESULTS.md`, `LAST_ATTEMPT_BASELINE.md` — Documents verified candidate numbers and ADR without altering historical baseline records.

---

## 5. Changes Deliberately Rejected and Why

- **Downgrading React (`19.3.1`), Next.js (`16.4.6`), `.nvmrc` (`26`), or dependencies for `R3`:** Rejected — `R3` has no specification in any workspace artifact; clean `npm ci` passes with 0 vulnerabilities.
- **Adjusting detection weights or scoring thresholds (`risk.ts`):** Rejected — All calibrated benign controls (`Urgent: meeting...`, `"never share OTP"`, official brand domains) and high-risk phishing fixtures classify accurately without false positives.
- **Modifying `.github/workflows/ci.yml`:** Rejected — GitHub token lacks `workflow` scope and CI already runs cleanly on Draft PR `pull_request` to `main`.
- **Changing visual layout, palette, or branding copy:** Rejected — Accessibility, responsiveness (`320px`–`1440px`), and clarity already score `100`.

---

## 6. Test and Audit Commands, Exact Results, Dates, and Runtime Versions

- **Execution Date:** 2026-11-25
- **Local Toolchain:** Node `v22.20.0`, npm `10.9.3` (`.nvmrc`: `26` in GitHub Actions CI)
- **Pinned Versions (`package.json`):** `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `zod@4.6.7`, `@zxcvbn-ts/core@4.3.0`, `typescript@5.9.3`, `eslint@9.39.5`, `prettier@3.10.1`, `vitest@5.1.1`, `@vitest/coverage-v8@5.1.1`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`

All commands below were executed on the candidate tree immediately prior to commit `40156e43dad391227f8617a850c65a0b0135042b` and exited with code **`0`**:

| Command | Result | Exit Code | Notes |
|---|---|---|---|
| `npm ci` | `added 469 packages, audited 476 packages` | `0` | Expected deprecation notice on `eslint@9.39.5` (pinned for `eslint-config-next@16.4.6` compatibility) |
| `npm run format:check` | Passed | `0` | All matched files conform to Prettier code style |
| `npm run lint` | Passed | `0` | `0` errors, `0` warnings |
| `npm run typecheck` | Passed | `0` | Strict TypeScript `tsc --noEmit` |
| `npm run test:coverage` | `12` files, `50 / 50` passed (`0` skipped) | `0` | V8: `98.61%` stmts, `98.71%` lines, `100.00%` funcs, `94.10%` branches |
| `npm run build` | Passed | `0` | Next.js `16.4.6` Turbopack build (`/`, `/learn`, `/api/health`, `/api/rules`, `/api/guides`, `/api/guidance`, `Proxy`) |
| Local `next start -p 3105` smoke | Passed (`200 OK` all 6 routes) | `0` | Verified HTML/JSON content types, `Cache-Control`, `X-DNS-Prefetch-Control: off`, `DENY`, `nosniff`, `no-referrer`, HSTS, CSP nonce matching all SSR `<script nonce>` tags (`12/12` on `/`, `10/10` on `/learn`), zero `'unsafe-inline'` in `script-src` |
| `npm run test:e2e` | `8 / 8` passed (`0` skipped) | `0` | Playwright Chromium (`10.3s`), incl. `@axe-core/playwright` (`0` WCAG 2.2 AA violations) and keyboard navigation |
| `npm audit --omit=dev` | `0` vulnerabilities | `0` | Clean |
| `npm audit` | `0` vulnerabilities | `0` | Clean |
| `git diff --check` | Passed (zero whitespace errors) | `0` | Standard Windows LF/CRLF warnings only |

---

## 7. Baseline vs Candidate Quality Comparison

| Metric / Signal | Baseline (`81604cd`) | Candidate (`40156e4`) | Change |
|---|---|---|---|
| Unit & Integration Tests | `45 / 45` (`0` skipped) | `50 / 50` (`0` skipped) | **+5 tests** |
| Statement Coverage (All Files) | `95.12%` (`683/718`) | **`98.61%` (`712/722`)** | **+3.49 pp** |
| Line Coverage (All Files) | `95.14%` (`667/701`) | **`98.71%` (`694/703`)** | **+3.57 pp** |
| Function Coverage (All Files) | `97.20%` (`139/143`) | **`100.00%` (`149/149`)** | **+2.80 pp (`100%`)** |
| Branch Coverage (All Files) | `88.27%` (`444/503`) | **`94.10%` (`447/475`)** | **+5.83 pp** |
| `src/lib/analysis/` Coverage | `94.85%` stmts / `88.58%` branches | **`97.95%` stmts / `94.80%` branches** | **+3.10 / +6.22 pp** |
| `password-check/service.ts` | `94.66%` stmts / `88.63%` branches | **`100.00%` stmts / `95.45%` branches** | **+5.34 / +6.82 pp** |
| Production imports from `@/test/` | `3` component files | **`0`** (enforced by test) | **Eliminated** |
| Palochka homograph (`аррӏе` / `xn--80ak6aa92e`) | Missed (`ӏ` unmapped) | **Detected as `apple` lookalike** | **Hardened** |
| Playwright E2E + Axe WCAG 2.2 AA | `8 / 8` passed | `8 / 8` passed + `<script nonce>` CSP check | **Strengthened** |
| Dependency Vulnerabilities | `0` (`audit` & `audit --omit=dev`) | `0` (`audit` & `audit --omit=dev`) | **Maintained** |

---

## 8. Protected Category Regression Evidence

- **Security:** Strictly hardened (`0` network calls to inspected URLs, `0` storage/cookie password leaks, `0` `dangerouslySetInnerHTML`, `0` `'unsafe-inline'` in `script-src`, `<script nonce>` verified matching per-request header nonce on `/` and `/learn`, Palochka homograph caught cleanly).
- **Efficiency:** Improved (`parseCandidateUrl` + `inspectEmbeddedLinks` decomposed cleanly; OTP protective guard no longer allocates `new RegExp(...)` per call; zero duplicate form rendering bundles).
- **Accessibility:** Unchanged at `100` (`0` violations across `axe-core` WCAG 2.2 AA on `/` and `/learn`; preserved exact `id`, `htmlFor`, `aria-describedby`, keyboard tab navigation, `min-h-[44px]` hit targets, and `320px`–`1440px` zero horizontal overflow).
- **Problem Alignment:** Unchanged (`Low signal` explicitly states non-proof limitations; zero offensive/intrusive probes; clear calm safe-action checklist maintained).

---

## 9. Candidate Branch & Commit SHA

- **Branch:** `optimization/last-attempt-2026-11-25` (pushed to `origin/optimization/last-attempt-2026-11-25`)
- **Verified Code & Test Commit SHA:** `40156e43dad391227f8617a850c65a0b0135042b`
- **Pull Request:** `https://github.com/tnex0734-ops/trustsignal/pull/1` (Draft PR targeting `main`)

---

## 10. GitHub Actions Run & Result

- **Workflow:** `.github/workflows/ci.yml` (`CI`)
- **Run ID:** `45617449588` (`https://github.com/tnex0734-ops/trustsignal/actions/runs/45617449588`)
- **Trigger:** `pull_request` on commit `40156e43dad391227f8617a850c65a0b0135042b` (Node `26`)
- **Result:** **`completed` / `success`** (`1m21s`)

---

## 11. Vercel Preview Deployment & Source SHA

- **Project:** `trustsignal-4b6t` (`prj_m6wGvtT592QYoLkLru7CM2Gu7yIw`)
- **Deployment:** `4AvmbRKWXNBg9is87oEBkqtaKi4S` (`https://vercel.com/taushikok-3989s-projects/trustsignal-4b6t/4AvmbRKWXNBg9is87oEBkqtaKi4S`) — GitHub commit status **`success` (`Deployment has completed`)** on commit `40156e43dad391227f8617a850c65a0b0135042b`
- **Preview URL:** `https://trustsignal-4b6t-git-optimizati-e0aba1-taushikok-3989s-projects.vercel.app`
- **Live HTTP Verification Status on Preview URL:** Blocked unauthenticated — external fetch to `/api/health` returned `200` with `<title>Login – Vercel</title>` due to Vercel Deployment Protection (Vercel Authentication SSO enabled on Preview deployments). Local production server (`next start -p 3105`) verified the identical commit build across all 6 routes.

---

## 12. Production Status

- **`main` Branch:** Unchanged at `81604cd1f9b712265bc0f9671ae06a02a7142662`.
- **Live Production (`https://trustsignal-4b6t.vercel.app/`):** Unchanged and operational (`200 OK`, `8 / 8` Playwright live smoke checks passing). No merge, push to `main`, or production alias promotion has been executed.

---

## 13. Remaining Blockers and Limitations

1. **`R3` Undefined:** Exact meaning of `R3` remains unresolved (`R3 unresolved — clarification required before any downgrade`).
2. **Vercel Preview SSO Gate & Missing Local Vercel Auth:** Vercel CLI is not installed or authenticated locally, and the generated Vercel Preview URL requires Vercel SSO authentication, blocking automated unauthenticated Playwright/smoke checks against the remote Preview host directly.
3. **Legacy Unconfigured Vercel Webhook Siblings:** Three separate Vercel projects attached to the repository (`trustsignal`, `engine`, `trustsignal-hecm`) reported failed preview statuses on PR `#1` while the active `trustsignal-4b6t` deployment succeeded (`Ready`).

---

## 14. Recommendation

**Conditioned Recommendation: Proceed to promotion of `optimization/last-attempt-2026-11-25` to `main` ONLY after human sign-off on two gates; otherwise preserve the verified `81604cd` production deployment (`https://trustsignal-4b6t.vercel.app/`):**

1. Confirm whether `R3` requires any constraint change (currently unresolved; zero changes made to runtime/dependency stack).
2. Sign in to the active Vercel Preview deployment (`https://trustsignal-4b6t-git-optimizati-e0aba1-taushikok-3989s-projects.vercel.app`) as `taushikok-3989s-projects` owner to spot-check the live Preview behind Vercel SSO (and optionally detach the 3 unused failed Vercel projects from GitHub if desired).

All local verification gates (`npm ci`, Prettier, ESLint, strict TypeScript, `50/50` Vitest tests, `98.61%` statements / `100%` functions / `94.10%` branches, `next build`, `next start` smoke test, `8/8` Playwright + axe-core WCAG 2.2 AA, `0` npm vulnerabilities) and GitHub Actions CI run `45617449588` passed cleanly on commit `40156e43dad391227f8617a850c65a0b0135042b` with zero regressions.
