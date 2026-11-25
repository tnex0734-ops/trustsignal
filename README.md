# TrustSignal

**Stop. Check. Stay Safe.**

> **TrustSignal helps people pause before they click, pay, reply or share a password.**

TrustSignal is a privacy-first defensive security assistant built for the Hack2Skill defensive-security challenge. It helps everyday users inspect unfamiliar links, scam/phishing messages, and weak password patterns with clear, explainable risk signals and immediate protective next steps—without sending private messages, links, or passwords to any server.

---

## Original Challenge Statement

> *"Build a defensive solution that helps protect people, data or systems from threats. The focus is on detecting, preventing and raising awareness about risks such as scams, weak passwords, unsafe links, fake content or emergencies. The solution should keep users safer without harming anyone."*

## Problem & Solution

People receive urgent links and messages daily over SMS, email, and chat apps asking them to click, pay, install an app, or share an OTP/password. Generic warnings rarely explain *why* something looks risky, and pasting sensitive text or passwords into remote scanners introduces new privacy risks.

**TrustSignal** solves this by running deterministic link and message checks plus offline password-strength estimation completely inside the user's browser:

| Challenge Threat | TrustSignal Feature | Defensive Value & Awareness |
|---|---|---|
| Unsafe links & deceptive domains | **Check a link** (`src/lib/analysis/url-parser.ts`, `link-rules.ts`) | Parses URLs as text locally without opening, fetching, or resolving DNS; flags `@` user-info spoofing, IP literals, Punycode/Cyrillic homographs, shorteners, executable `.apk`/`.exe` paths, and brand lookalikes. |
| Scams & phishing messages | **Check a message** (`src/lib/analysis/message-rules.ts`) | Identifies OTP/PIN/password solicitation, remote-access requests (AnyDesk/TeamViewer), APK sideloading, urgent payment/gift-card demands, suspension threats, impersonation, and embedded risky links while suppressing false positives on benign reminders. |
| Weak password patterns | **Check a password** (`src/features/password-check/service.ts`) | Uses offline `@zxcvbn-ts` estimation entirely in browser memory to highlight short length, keyboard walks, repeats, and dictionary words while supporting long Unicode passphrases. |
| Awareness, prevention & emergencies | **Explainable Risk & Safety Guides** (`/learn`, `/api/guides`, `/api/rules`) | Surfaces plain-language evidence, calm next steps, incident recovery guidance if a user already clicked/shared credentials, and explicit non-guarantee limits. |

---

## Implemented Features

1. **Suspicious Link Analyzer**
   - Strict `2,048`-character cap and safe local `URL` parsing without navigation or network requests.
   - Blocks active/non-HTTP schemes (`javascript:`, `data:`, `vbscript:`, `file:`, `ftp:`) with clear guidance.
   - Detects `LINK_USERINFO_CREDENTIALS`, `LINK_IP_ADDRESS_HOST` (IPv4, IPv6, decimal/hex/octal IPs), `LINK_BRAND_LOOKALIKE` (checking both hostnames and `@` user-info against curated official domain roots), `LINK_PUNYCODE_IDN` (including pure RFC 3492 Punycode decoding), `LINK_URL_SHORTENER`, `LINK_INSECURE_HTTP`, `LINK_EXCESSIVE_SUBDOMAINS`, `LINK_SUSPICIOUS_HOST_PATTERN`, `LINK_EXECUTABLE_DOWNLOAD`, `LINK_DECEPTIVE_PATH_QUERY`, and `LINK_OBFUSCATED_CHARACTERS` (zero-width & Bidi overrides).
   - Never renders submitted URLs as clickable `<a>` links.

2. **Scam & Phishing Message Detector**
   - `8,000`-character cap with NFKC + invisible-character normalization (`normalize-text.ts`) and bounded flat regexes.
   - Detects OTP/password requests (with protective anti-scam phrasing guard so notices like *"Never share this OTP"* do not false-positive), remote-access requests, APK sideloading, urgent payment/gift-card/UPI demands, PII requests, account suspension threats, fake prizes, impersonation pressure, and standalone urgency (`Low signal` on its own).
   - Extracts embedded links locally (capped at 10) and inspects them through `analyzeLink()`.

3. **Password Safety Analyzer (Browser-Only)**
   - Code-split via `next/dynamic(..., { ssr: false })` so `@zxcvbn-ts` dictionaries load only when opened and never run on the server.
   - Detects short length, keyboard sequences (e.g., `qwertyuiop123`), repeated characters, dictionary patterns, and date patterns; supports Unicode/emoji passphrases up to `256` code points.
   - Includes accessible Show/Hide toggle, `Clear` button, and automatic state wipe when switching away from the Password tab.
   - Never persists, logs, or returns the password value in results or network requests.

4. **Explainable Risk Intelligence** (`src/lib/analysis/risk.ts`)
   - Calibrated tiers: **Low signal**, **Needs attention**, and **High risk** (plus structured **Invalid input** feedback).
   - Displays non-color-only severity badges (distinct icons + text), plain-language summaries, matched plain-text evidence, and a clearly labeled heuristic score (`0–100`, explicitly marked *not a probability*).
   - Always includes a visible limitations notice explaining that *Low signal* is not proof of safety.

5. **Safety Education & Rule Transparency** (`/learn`)
   - Six practical safety modules + calm emergency steps for users who already clicked or shared credentials + full public inspection of all 26 documented rules.

---

## Architecture

TrustSignal is a **Next.js App Router modular monolith** with strict client/server separation:

```text
Browser (100% Local Analysis)
  ├── Check a link ─────┐
  ├── Check a message ──┼──> src/lib/analysis/* (Pure deterministic rules + RFC 3492 Punycode + risk engine)
  └── Check a password ─┴──> src/features/password-check/service.ts (@zxcvbn-ts offline, lazy-loaded client-only)

Next.js Server / Vercel Edge
  ├── / & /learn (App Router pages + per-request cryptographic CSP nonce via src/proxy.ts)
  ├── GET /api/health    (Service/build/privacy metadata; no-store; ignores query/body)
  ├── GET /api/rules     (Versioned public rule catalogue from src/lib/analysis/rules-catalogue.ts)
  ├── GET /api/guides    (Curated safety lessons & emergency steps from src/lib/guidance/guides-data.ts)
  └── GET /api/guidance  (Alias route sharing exact handler with /api/guides)
```

- **No database, no user accounts, no third-party AI/reputation APIs.**
- **Zero scan-input endpoints:** `Link`, `Message`, and `Password` inputs are never sent to `/api/*`.

---

## Tech Stack (Pinned Versions)

- **Framework & UI:** `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `tailwindcss@4.3.5`, `lucide-react@1.80.0`
- **Language & Validation:** `typescript@5.9.3` (`strict: true`, `noUncheckedIndexedAccess: true`), `zod@4.6.7`
- **Offline Password Estimator:** `@zxcvbn-ts/core@4.3.0`, `@zxcvbn-ts/language-common@4.2.0`, `@zxcvbn-ts/language-en@4.1.2`
- **Testing & QA:** `vitest@5.1.1`, `@vitest/coverage-v8@5.1.1`, `@testing-library/react@16.3.3`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.1`
- **Code Quality:** `eslint@9.39.5` (`eslint-config-next@16.4.6`), `prettier@3.10.1`

---

## Local Setup & Scripts

**Prerequisites:** Node.js `>=22.0.0` (verified locally on `v22.20.0`; `.nvmrc` specifies `26` for CI/LTS) and `npm`.

```bash
# 1. Clean install from lockfile
npm ci

# 2. Run development server
npm run dev

# 3. Run full quality verification (format, lint, typecheck, tests + coverage, build)
npm run verify

# 4. Run Playwright end-to-end, privacy, and axe-core accessibility suite (after build)
npx playwright install chromium
npm run test:e2e
```

### Available `package.json` Scripts

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production Turbopack build
- `npm run start` — Serve production build
- `npm run format` / `npm run format:check` — Prettier formatting
- `npm run lint` — ESLint checks
- `npm run typecheck` — Strict TypeScript check (`tsc --noEmit`)
- `npm run test` / `npm run test:coverage` — Vitest unit & integration suite with V8 coverage
- `npm run test:e2e` — Playwright Chromium E2E, privacy, responsive, and `axe-core` suite
- `npm run verify` — Runs `format:check && lint && typecheck && test:coverage && build`

---

## Environment Configuration

See `.env.example`. TrustSignal MVP requires **zero environment variables or API keys** to run locally or deploy on Vercel. Never commit `.env` or `.env.local` files.

---

## API Documentation

| Method & Route | Purpose | Cache Header | User Input Accepted? |
|---|---|---|---|
| `GET /api/health` | Service status, version (`1.0.0`), privacy flags | `no-store` | None (ignores query/body) |
| `GET /api/rules` | Versioned (`2026.11.1`) catalog of 26 detection rules | `public, max-age=300, stale-while-revalidate=600` | None |
| `GET /api/guides` | Curated 6 safety guides + emergency steps | `public, max-age=300, stale-while-revalidate=600` | None |
| `GET /api/guidance` | Canonical alias returning identical guidance payload | `public, max-age=300, stale-while-revalidate=600` | None |

---

## Verified Test & Coverage Results

Full details are recorded in [TEST_RESULTS.md](./TEST_RESULTS.md).

- **Unit & Integration Tests (`npm run test:coverage`):** `12` test files passed, `45 / 45` tests passed (`0` skipped).
- **V8 Coverage:** `95.12%` statements (`683/718`), `95.14%` lines (`667/701`), `97.20%` functions (`139/143`), `88.27%` branches (`444/503`) (`src/lib/analysis`: `94.85%` statements / `98.57%` functions; `src/features/password-check/service.ts`: `94.66%` statements / `100%` functions).
- **End-to-End & Accessibility (`npm run test:e2e`):** `8 / 8` Playwright Chromium specs passed, covering link/message/password journeys, network & storage privacy invariants, XSS inertness, keyboard-only operation, responsive `320px`–`1440px` layouts, security headers, and `axe-core` WCAG 2.2 AA scans (`0` violations on `/` and `/learn`).
- **Dependency Audit (`npm audit --omit=dev` and `npm audit`):** `0` known vulnerabilities.

---

## Security & Privacy Practices

See [THREAT_MODEL.md](./THREAT_MODEL.md), [SECURITY_REQUIREMENTS.md](./SECURITY_REQUIREMENTS.md), and [SECURITY_REVIEW.md](./SECURITY_REVIEW.md):

- **Strict Per-Request CSP & Headers:** `src/proxy.ts` generates a cryptographic `x-nonce` per request (`script-src 'self' 'nonce-...' 'strict-dynamic'`, `connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`). `next.config.ts` disables `X-Powered-By`, sets `X-DNS-Prefetch-Control: off`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `Strict-Transport-Security`.
- **Zero Unsafe Rendering:** Zero uses of `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `window.open` across `src/`.
- **Zero Storage / Telemetry:** Inputs are kept exclusively in React memory and cleared on reset or leaving the Password tab.

---

## Known Limitations

- TrustSignal is a **first-pass heuristic assistant**, not antivirus, firewall, or live threat intelligence.
- It does not perform DNS lookups, WHOIS checks, TLS certificate inspection, or destination page scanning.
- **No warning detected (`Low signal`) does not guarantee safety**—a compromised legitimate site or novel social-engineering message can still be dangerous.
- Password evaluation estimates offline guessing resistance only and **does not check breach databases or cross-site password reuse**.

---

## Demo Walkthrough (Synthetic Data Only)

1. **Check a link:** Click *"High-risk example: embedded credentials before @"* (`https://paypal.com@login-check.example.com/verify-account`) -> shows `High risk`, user-info & brand lookalike indicators, and confirms the URL was never opened. Compare with *"Benign example: standard HTTPS page"* -> `Low signal` plus explicit non-proof limitations.
2. **Check a message:** Click *"High-risk example: account suspension + OTP + raw IP link"* -> shows `High risk`, matched evidence snippets, local inspection of `http://192.0.2.45/kyc-login`, and calm recovery steps. Compare with *"Benign control: urgent reminder without scam demand"* -> remains `Low signal`.
3. **Check a password:** Switch to **Check a password**, test `qwertyuiop123` (`High risk` / `Weak` with keyboard-row + dictionary pattern warnings) vs `cobalt-lantern-bicycle-meadow-84` (`Low signal` / `Very strong`), toggle Show/Hide, and click `Clear` (or switch tabs) to observe immediate state wipe.
4. **Safety Guides:** Open `/learn` to inspect the six defensive lessons, emergency response checklist, and all 26 transparent rules.

---

## License & Attributions

- Source code created for the Hack2Skill defensive-security challenge.
- Offline password estimation powered by `@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, and `@zxcvbn-ts/language-en` (MIT).
- Icons provided by `lucide-react` (ISC).
