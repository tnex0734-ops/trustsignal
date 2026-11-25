# Threat Model

## Assets to protect

- User passwords typed into the password checker.
- User-pasted messages and URLs.
- User understanding and decisions based on analysis results.
- App integrity, deployment secrets and source repository.

## Trust boundaries

1. Untrusted text pasted by a user enters browser input controls.
2. The client-side parser and detection engine process that text.
3. UI renders detection explanations.
4. Next.js server routes serve pages and health metadata only.
5. Vercel build/deployment environment contains deployment configuration, not user secrets.

## Threats and mitigations

| Threat | Impact | Mitigation | Verification |
|---|---|---|---|
| Password exfiltration | Credential compromise | Password scoring stays client-side; no request, logs, persistence or analytics | Browser network inspection; source and E2E tests |
| Raw message/URL leakage | Privacy harm | Local processing; no content persistence or telemetry | Inspect storage/network; code review |
| Malicious URL navigation | Tracking, exploit or unwanted content load | Parse as text; never open, fetch, preview or redirect | Mock fetch/network; tests assert no navigation/request |
| XSS through pasted text | Script execution | Render as text; never use unsafe HTML; sanitize any future rich content | XSS payload tests |
| Malformed/oversized input | Crash or resource exhaustion | Strict input limits; guarded parsers; bounded regexes | Boundary and fuzz-like tests |
| False negative | User trusts a dangerous item | Limitations shown on every result; low-signal is not "safe"; layered indicators | Copy review and E2E assertion |
| False positive | User ignores useful service or panics | Explain signals; calibrated language; test benign fixtures | Fixture suite and usability review |
| Weak rule coverage | Missed threat patterns | Documented heuristics, tests, explicit non-coverage statement | Test matrix and README |
| Dependency compromise | Supply-chain risk | Minimal pinned dependencies, lockfile, audit, CI | `npm audit` and CI |
| Misconfigured headers | Browser-side attack surface | CSP, HSTS in production, `X-Content-Type-Options`, referrer policy, frame restriction | Header smoke test |
| Secret committed | Account or deployment compromise | `.env.example` only, ignore `.env*`, secret scanning | Git diff and repository secret scan |

## Abuse cases to test

- User pastes `javascript:alert(1)`.
- User pastes a URL with username/password user-info.
- User pastes a malformed URL, Unicode domain or punycode label.
- User pastes a URL that is itself an internal IP address.
- User pastes enormous text or strings with pathological repeated characters.
- Message contains benign urgency (e.g. a genuine class deadline) without credential/payment request.
- Message contains OTP request, payment demand and a link.
- Password includes emoji, Unicode, whitespace or a very long passphrase.
- User uses browser back/forward or resets the form while a result is displayed.

## Residual risks

- Heuristic checks cannot know whether a real website or sender is compromised.
- A malicious message may contain no recognizable signals.
- A benign message may contain language that resembles a scam.
- Without live threat intelligence, the product cannot check domain reputation, active malware, certificate state or destination behavior.

Make these limitations visible in the product and README. Never convert a residual risk into a hidden assumption.
