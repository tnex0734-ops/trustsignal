# TrustSignal — Test Execution & Coverage Results

- **Date:** 2026-11-25
- **Node.js Runtime:** `v22.20.0` (`.nvmrc`: `26`)
- **npm Version:** `10.9.3`
- **Project Root:** `trustsignal-kit`

---

## Quality Gate Command Results

| Check | Command | Result | Details |
|---|---|---|---|
| Formatting | `npm run format:check` | **PASS** | All matched files conform to Prettier style. |
| Linting | `npm run lint` | **PASS** | ESLint 9 (`eslint-config-next/core-web-vitals` + `typescript` + `prettier`) reported 0 errors, 0 warnings. |
| Type Check | `npm run typecheck` | **PASS** | `tsc --noEmit` with strict mode reported 0 errors. |
| Unit & Integration + Coverage | `npm run test:coverage` | **PASS** | `12` test files, `45 / 45` tests passed, `0` skipped. |
| Production Build | `npm run build` | **PASS** | Next.js `16.4.6` (Turbopack) compiled routes `/`, `/learn`, `/api/health`, `/api/rules`, `/api/guides`, `/api/guidance`, and `Proxy`. |
| E2E, Privacy & Accessibility | `npm run test:e2e` | **PASS** | `8 / 8` Playwright Chromium tests passed (`0` skipped). |
| Production Security Audit | `npm audit --omit=dev` | **PASS** | `0` vulnerabilities found. |

---

## Vitest Breakdown (`45 / 45` Passed)

- `src/test/unit/normalize-text.test.ts` — **6 passed** (NFKC normalization, invisible/Bidi detection, homoglyph mapping, emoji-safe truncation, RFC 3492 Punycode decoding & malformed label safety)
- `src/test/unit/url-parser.test.ts` — **7 passed** (HTTPS, missing scheme handling, blocked active schemes `javascript:`/`data:`/`vbscript:`/`file:`, unsupported `ftp:`, malformed/oversized inputs, IPv4/IPv6/decimal IPs, Punycode/Unicode hosts)
- `src/test/unit/link-rules.test.ts` — **5 passed** (all synthetic link fixtures, zero `fetch` assertion, excessive subdomains, suspicious TLD/port, Bidi obfuscation, Cyrillic homograph, official brand allowlist, explicit non-proof limitations)
- `src/test/unit/message-rules.test.ts` — **7 passed** (all synthetic message fixtures, `"urgent"`-alone false-positive guard, `"never share OTP"` false-positive guard, embedded `javascript:` & shortener URLs with zero `fetch`, PII + invisible obfuscation, `8,000`-char pathological latency <200ms, extracted URL cap)
- `src/test/unit/risk.test.ts` — **2 passed** (calibrated threshold boundaries, deduplication, score cap at 100)
- `src/test/unit/rules-catalogue.test.ts` — **2 passed** (26 unique rule IDs, 6 required educational guides)
- `src/test/unit/security-headers.test.ts` — **3 passed** (production nonce CSP, dev vs non-dev fallback, `X-DNS-Prefetch-Control: off`, framing/sniffing headers)
- `src/test/unit/password-service.test.ts` — **4 passed** (all password fixtures, keyboard sequence + repeat + Unicode pattern checks, empty/oversized bounds, raw password non-echoing invariant, API route isolation from `@zxcvbn-ts`)
- `src/test/integration/health-route.test.ts` — **1 passed** (`/api/health` schema & `no-store`)
- `src/test/integration/api-routes.test.ts` — **3 passed** (`/api/health`, `/api/rules`, `/api/guides` + `/api/guidance` parity)
- `src/test/integration/pages-and-shell.test.tsx` — **2 passed** (shell navigation, Home/Learn copy, `End`/`ArrowLeft`/`Home` keyboard tabs, link demo button)
- `src/test/integration/workbench.test.tsx` — **3 passed** (complete Link, Message, and Password UI workflows, XSS inertness, oversized rejection, Show/Hide, Clear, tab-leave password wipe, zero `fetch` calls)

---

## V8 Code Coverage Summary (`coverage/coverage-summary.json`)

| Scope | Statements | Lines | Functions | Branches |
|---|---|---|---|---|
| **All Tracked Files** | **95.12%** (`683/718`) | **95.14%** (`667/701`) | **97.20%** (`139/143`) | **88.27%** (`444/503`) |
| `src/lib/analysis/` (pure detection & risk) | **94.85%** | **94.90%** | **98.57%** | **88.58%** |
| `src/features/password-check/service.ts` | **94.66%** | **94.59%** | **100.00%** | **88.63%** |
| `src/app/api/*`, `lib/security/*`, `lib/validation/*`, `lib/guidance/*` | **100.00%** | **100.00%** | **100.00%** | **100.00%** |

---

## Playwright End-to-End Suite (`8 / 8` Passed, Chromium v1255)

1. Homepage and `/learn` load cleanly (`200 OK`) with `0` console errors, `0` page errors, and verified security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `X-DNS-Prefetch-Control: off`, nonce CSP).
2. `/api/health`, `/api/rules`, `/api/guides`, and `/api/guidance` return valid JSON and ignore arbitrary query parameters without reflection.
3. Link Check flags deceptive `@` credentials (`High risk`, no rendered `<a>` links) and benign HTTPS (`Low signal` + limitations), blocks `javascript:alert(1)`, and makes zero outbound network requests to submitted URLs.
4. Message Check flags phishing OTP + raw IP link (`High risk`), keeps benign `"Urgent"` notice at `Low signal`, and renders `<script>window.__xssExecuted=true</script>` inertly.
5. Password Check evaluates locally, toggles Show/Hide, wipes on Clear and tab switch, and leaks zero occurrences of the entered password across all intercepted requests, `localStorage`, `sessionStorage`, `document.cookie`, and `window.location.href`.
6. Full keyboard-only operation works across tabs (`ArrowRight`, `Tab`, `Enter`).
7. Zero horizontal overflow across `320x568`, `390x844`, `768x1024`, `1024x768`, and `1440x900` on `/` and `/learn`.
8. Automated `@axe-core/playwright` (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) scans pass with `0` violations on both `/` (with active result rendered) and `/learn`.

## Skipped Tests

None (`0` skipped).
