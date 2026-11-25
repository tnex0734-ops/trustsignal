# Demo and Submission Evidence Plan

## 3-minute demo sequence

1. **Problem (15 seconds):** "People receive suspicious links and messages every day. TrustSignal helps them identify warning signs before they click, pay or share credentials."
2. **Link check (35 seconds):** Use a synthetic URL fixture designed to trigger a shortener or deceptive-domain indicator. Show the indicator and explain why the app did not open the URL.
3. **Message check (40 seconds):** Paste a synthetic message requesting an OTP and payment. Show the risk signals and the safe next step.
4. **Password check (30 seconds):** Enter a test-only weak sample, then a long unique passphrase. Explain that all password analysis stays in the browser.
5. **Privacy/security (25 seconds):** Show a concise architecture diagram or network panel proving that the candidate URL is not requested and password input is not transmitted.
6. **Engineering proof (25 seconds):** Show passing CI/tests, README, security requirements and deployed app.

Use only synthetic data created for the demo. Never show a real password, real personal message or active malicious website.

## Evidence to capture

- Homepage with the three threat-focused actions.
- Link result showing clear indicators and limitations.
- Message result showing OTP/payment signals.
- Password-strength result (with only synthetic sample input; do not capture typed password value).
- Mobile responsive state.
- CI passing run and test coverage summary.
- GitHub repository and Vercel production URL.

## Submission narrative

**Problem:** People are exposed to unsafe links, phishing messages and weak password habits, often without clear guidance.

**Solution:** TrustSignal provides a privacy-first first-pass safety check with explainable signals and immediate protective guidance.

**Defensive value:** It helps users pause before risky actions, reduces accidental disclosure, and raises awareness of common social-engineering tactics.

**Responsible limitations:** It is a heuristic assistant, not antivirus or a live reputation service. It does not open submitted links, does not transmit passwords, and does not promise that a low-signal result is safe.

## Do not claim

- "Detects every scam".
- "100% safe" or "guaranteed phishing detection".
- "Checks if a password is breached" unless an explicitly reviewed breach-check feature has actually been implemented.
- "Scans malware" or "verifies a site".
- Any evaluation score not provided by the official platform.
