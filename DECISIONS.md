# Architecture Decision Log

Record significant implementation choices here. Each entry should include date, context, options considered, decision, trade-offs and evidence.

## ADR-001 — Local-first analysis for MVP

- **Status:** Accepted (2026-11-25)
- **Context:** Inputs may contain passwords, private messages or potentially malicious URLs.
- **Decision:** Run link and message analysis in the browser; run password strength estimation entirely in the browser. The MVP has no raw-input storage, user accounts or third-party content-processing API.
- **Rationale:** Minimizes data exposure, simplifies the threat model and makes the privacy claim testable.
- **Trade-off:** No live domain reputation, server-side malware scan or breach-password lookup.

## ADR-002 — Deterministic, explainable rules

- **Status:** Accepted (2026-11-25)
- **Context:** A vague AI score is difficult to verify and may create false confidence.
- **Decision:** Use deterministic heuristics with named indicators, clear explanations, tested thresholds and visible limitations.
- **Rationale:** Reproducible tests, transparent user guidance and no need to send user input to an LLM.
- **Trade-off:** Cannot detect every novel scam; rule quality and fixture coverage matter.

## ADR-003 — Modular monolith on Next.js

- **Status:** Accepted (2026-11-25)
- **Context:** Hackathon delivery needs a deployable, maintainable system without unnecessary infrastructure.
- **Decision:** Use Next.js App Router with strict TypeScript, pure domain modules and a minimal health/metadata API.
- **Rationale:** Single deployment target, straightforward Vercel integration and clear test boundaries.
- **Trade-off:** No independent backend service; not required for the MVP's local processing model.

## ADR-004 — Dependency pinning and toolchain compatibility

- **Status:** Accepted (2026-11-25)
- **Context:** `typescript@7.0.2` and `eslint@10.15.0` exist on npm, while `eslint-config-next@16.4.6` depends on `typescript-eslint@8.56.x` (`typescript <6.0.0`) and `eslint-plugin-react` / `eslint-plugin-jsx-a11y` (`eslint ^9`). The local runtime is Node `v22.20.0`, while `.nvmrc` specifies `26`.
- **Decision:** Pin `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `zod@4.6.7`, `lucide-react@1.80.0`, `@zxcvbn-ts/core@4.3.0`, `@zxcvbn-ts/language-common@4.2.0`, `@zxcvbn-ts/language-en@4.1.2`, `typescript@5.9.3`, `eslint@9.39.5`, `eslint-config-next@16.4.6`, `vitest@5.1.1`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`, and `@types/node@22.20.6` with `"engines": { "node": ">=22.0.0" }`.
- **Rationale:** Guarantees deterministic `npm ci` without `--legacy-peer-deps` while maintaining full compatibility with Next.js 16 and Node 22–26.
- **Trade-off:** Defers TypeScript 6/7 adoption until the Next.js ESLint plugin ecosystem supports them cleanly.

## ADR-005 — Guidance API route compatibility (`/api/guides` and `/api/guidance`)

- **Status:** Accepted (2026-11-25)
- **Context:** `ARCHITECTURE.md` and `PRODUCT_REQUIREMENTS.md` specify `GET /api/guides`, whereas the mission specification also lists `GET /api/guidance`.
- **Decision:** Implement a single pure data module (`src/lib/guidance/guides-data.ts`) and expose both `GET /api/guides` (canonical) and `GET /api/guidance` (alias) backed by the exact same shared handler helper.
- **Rationale:** Zero duplicated logic and consistent behavior across both documented paths.
- **Trade-off:** Two thin route files sharing one module.

## ADR-006 — Strict security headers and per-request CSP nonce via `proxy.ts`

- **Status:** Accepted (2026-11-25)
- **Context:** Next.js 16 uses `proxy.ts` as the request-interception convention replacing `middleware.ts`. Avoiding `'unsafe-inline'` for `script-src` strengthens XSS defense-in-depth alongside React text-only rendering.
- **Decision:** Generate a per-request cryptographic CSP nonce in `proxy.ts` (`script-src 'self' 'nonce-...' 'strict-dynamic'`, `connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`) and configure baseline security headers (`X-DNS-Prefetch-Control: off`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, `Strict-Transport-Security`) in `next.config.ts`.
- **Rationale:** Disables DNS prefetching (`X-DNS-Prefetch-Control: off`) so rendered domains never trigger browser DNS lookups, and removes `'unsafe-inline'` from production script CSP.
- **Trade-off:** Pages reading the per-request nonce render dynamically at request time rather than static HTML, which is fast and supported on Vercel.

## ADR-007 — Candidate optimization refactoring, domain boundary cleanup, and Punycode confusable hardening

- **Status:** Accepted on candidate branch `optimization/last-attempt-2026-11-25` (2026-11-25)
- **Context:** Independent code-quality review identified duplicated form/result markup between `LinkCheckForm` and `MessageCheckForm`, runtime UI components importing demo presets from `src/test/fixtures/`, non-null assertion `!` and deep nesting in `url-parser.ts`, duplicated indicator builders (`makeIndicator` / `makeMessageIndicator`), dynamic regex recompilation on the OTP protective guard path, potential list-key collisions on truncated embedded URLs in `RiskResultPanel`, and missing Cyrillic Palochka confusables (`\u04CF` / `\u04C0`) needed for RFC 3492 homograph detection (`xn--80ak6aa92e` -> `аррӏе`).
- **Decision:** Extract `src/lib/analysis/demo-presets.ts` so production modules have zero `@/test/` imports; extract shared `src/components/scanner/ScannerFormShell.tsx`; centralize `createIndicatorFromRule` in `rules-catalogue.ts`; decompose `parseCandidateUrl`, `ruleBrandLookalike`, and `inspectEmbeddedLinks` into small focused helpers; replace the OTP protective regex clone with a static global pattern; use composite index keys in `RiskResultPanel`; add Cyrillic Palochka confusables; and add deterministic unit/integration/E2E branch tests.
- **Rationale:** Improves maintainability, layer isolation, homograph accuracy, and branch coverage (`88.27%` -> `94.10%`, `100%` function coverage) without altering risk weights, UI semantics, dependencies, or privacy invariants.
- **Trade-off:** Modest increase in helper interfaces internal to `src/lib/analysis/` and `src/components/scanner/`, balanced by eliminating >200 lines of duplicated form markup and domain helper boilerplate.
