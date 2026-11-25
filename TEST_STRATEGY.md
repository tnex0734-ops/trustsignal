# Test Strategy

## Testing pyramid

### Unit tests — largest layer

Pure functions and rules:
- URL normalization/parsing.
- One test per detection indicator.
- Risk aggregation boundaries.
- Message pattern detection.
- Password estimator output mapping (do not snapshot the raw password).
- Input limits and Unicode normalization.
- Rule catalogue versioning and response schema.
- Safety-guide response schema and required content sections.

### Integration tests

- Form input -> analysis service -> result component.
- Multiple indicators are rendered with explanations.
- Reset clears the current input and result.
- Unsupported input yields accessible feedback.
- Password input is not submitted to server.

### End-to-end tests

1. Check a known suspicious URL and see specific indicators.
2. Check a benign URL and see calibrated low-signal language plus limitations.
3. Check a phishing message requesting OTP and see warning/guidance.
4. Check a benign message and ensure it is not automatically high risk.
5. Check weak and long passphrase examples; confirm client-side behavior.
6. Complete the flows using keyboard only.
7. Resize to mobile and ensure controls/results remain usable.
8. Intercept network/storage and verify privacy invariants.

## Required fixture categories

- Benign link: normal HTTPS domain and ordinary path.
- Suspicious link: user-info, IP literal, punycode, shortener, deceptive host and unsafe scheme.
- Benign message: normal delivery/class/appointment notice without credential/payment request.
- Suspicious message: OTP/password request, urgent payment, fake reward, remote access/APK install, account suspension threat.
- Boundary inputs: empty, whitespace, exact max length, over max length, Unicode, long repeated strings and malformed URLs.
- Passwords: short common-looking sample, keyboard sequence, repeated characters, long unique passphrase and Unicode passphrase.

Use invented examples and reserved/example domains where possible. Never add real personal data or active malicious URLs to fixtures.

## Coverage

- First establish meaningful tests; do not chase a numeric coverage percentage with superficial assertions.
- Enforce >=80% statements, lines and functions overall once the suite is stable.
- Target >=90% for pure detection/risk modules.
- Branch coverage must exercise every important severity boundary and invalid-input branch.
- Review uncovered lines rather than excluding files casually.

## Tooling

Recommended: Vitest + `@vitest/coverage-v8`, React Testing Library, `@testing-library/user-event`, Playwright and axe-core integration for browser accessibility scans.

## Test evidence

Keep `TEST_RESULTS.md` updated with date, commit, runtime/tool versions, commands, pass/fail counts, coverage and any skipped tests. Include screenshots only where they demonstrate a user-visible flow; never capture entered passwords or private user content.
