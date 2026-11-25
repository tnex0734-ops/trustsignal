# Security Review — TrustSignal

- **Review Date:** 2026-11-25
- **Reviewer Role:** Adversarial Application Security Audit
- **Scope:** Full `src/` codebase, `next.config.ts`, `src/proxy.ts`, API routes, client privacy boundaries, CSP/headers, dependencies, and test evidence.

---

## 1. Threat Boundary & Privacy Verification

| Invariant | Verification Method | Evidence | Status |
|---|---|---|---|
| Passwords never leave browser | Source audit + Vitest (`password-service.test.ts`, `workbench.test.tsx`) + Playwright network/storage interception | `@zxcvbn-ts` imported only inside `next/dynamic(..., { ssr: false })` client component; `assessPasswordLocally()` strips password/tokens from output; `0` network, storage, cookie, or URL matches in E2E. | **Verified** |
| Raw URLs & messages never sent to server or third parties | Source audit + Vitest `fetch` spy + Playwright request listener | Zero `fetch`/`XMLHttpRequest` calls made during Link or Message analysis; `/api/*` exposes GET metadata only. | **Verified** |
| Submitted URLs never opened, fetched, resolved, or rendered clickable | Source audit + `X-DNS-Prefetch-Control: off` + Playwright DOM & network checks | Zero `<a href>` elements inside `RiskResultPanel` / `IndicatorCard` / `LinkCheckForm`; DNS prefetch explicitly disabled. | **Verified** |
| XSS & HTML injection payloads remain inert | Static grep across `src/` + React text rendering + Playwright `<script>` & `<img onerror>` tests | Zero occurrences of `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval`, or `new Function` in production source. | **Verified** |
| Malformed, active-scheme & oversized inputs fail closed | Unit & integration boundary tests (`MAX_URL_LENGTH=2048`, `MAX_MESSAGE_LENGTH=8000`, `MAX_PASSWORD_LENGTH=256`) | `javascript:`, `data:`, `vbscript:`, `file:` blocked prior to URL construction; long strings rejected before expensive parsing. | **Verified** |
| API endpoints do not echo user input or leak secrets | Playwright `/api/health?probe=<script>...` check + Zod output schemas | Health endpoint ignores request query/body and sets `Cache-Control: no-store`. | **Verified** |
| Dependency hygiene | `npm audit --omit=dev` and `npm audit` | `0` vulnerabilities reported across 476 installed packages; lockfile pinned. | **Verified** |

---

## 2. Adversarial Findings Discovered & Resolved During Build

1. **[Resolved — High] Punycode Homograph Blind Spot in Brand Lookalike Detection**
   - *Finding:* Initial brand matching inspected `parsed.hostname` directly (`xn--pypal-4ve.example.com`), missing Cyrillic homographs (`pаypal.example.com`) whose non-ASCII character gets displaced into the Punycode suffix.
   - *Fix:* Implemented pure bounded RFC 3492 `decodePunycodeHostname()` in `src/lib/analysis/normalize-text.ts` and normalized decoded labels through homoglyph mapping before brand lookalike matching.
2. **[Resolved — High] Punycode `decodeDigit()` Lower-ASCII Boundary Bug**
   - *Finding:* Boundary unit testing on malformed label `xn--invalid!label.example.com` revealed `cp - 48 < 10` evaluated negative values (ASCII `'!'` = `33`) as valid digits instead of rejecting them.
   - *Fix:* Constrained range checks strictly to `cp >= 48 && cp <= 57` (and equivalent uppercase/lowercase bounds) in `src/lib/analysis/normalize-text.ts`.
3. **[Resolved — Medium] Brand Impersonation via `@` Userinfo Field**
   - *Finding:* `https://paypal.com@login-check.example.com` triggered `LINK_USERINFO_CREDENTIALS` but initially missed `LINK_BRAND_LOOKALIKE` because only `hostname` was checked.
   - *Fix:* Extended `ruleBrandLookalike()` in `src/lib/analysis/link-rules.ts` to inspect `parsed.url.username` against official brand domains.
4. **[Resolved — Medium] False Positive Prevention on Legitimate Bank OTP Warnings**
   - *Finding:* Naive OTP keyword detection could flag real bank alerts (`"Your OTP is 482910. Never share this OTP with anyone."`).
   - *Fix:* Added protective-statement filtering (`PROTECTIVE_OTP_WARNING_REGEX`) in `src/lib/analysis/message-rules.ts` verified by fixture & unit tests.

---

## 3. HTTP Security Headers & CSP

Configured via `src/proxy.ts` (per-request cryptographic nonce) and `next.config.ts`:
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'nonce-<random>' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';` (with `'unsafe-eval'` strictly limited to `NODE_ENV === "development"`).
- `X-DNS-Prefetch-Control`: `off`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Referrer-Policy`: `no-referrer`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Cross-Origin-Opener-Policy`: `same-origin`
- `Cross-Origin-Resource-Policy`: `same-origin`
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains`

*Note on `'unsafe-inline'` in `style-src`:* Retained to ensure compatibility with Next.js/Tailwind style runtime while blocking all script execution without a valid cryptographic nonce.

---

## 4. Residual Risks (Disclosed Openly)

1. Heuristic checks cannot inspect live destination pages, TLS certificates, domain age, or whether a legitimate site has been compromised.
2. Novel social-engineering scripts without matching patterns may classify as `Low signal`—mitigated by mandatory non-proof notices on every result.
3. Offline password estimation cannot verify if a password appeared in external data breaches or was reused across sites.
