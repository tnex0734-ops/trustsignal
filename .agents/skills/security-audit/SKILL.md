---
name: security-audit
description: Performs an adversarial security and privacy review of TrustSignal code, data flows, dependencies, headers and deployment. Use before release or after changes touching input handling, URLs, passwords, APIs or dependencies.
---

# Security Audit Skill

1. Read the threat model and security requirements.
2. Review the full diff and trace each sensitive input from control to output.
3. Verify password values are browser-only and absent from network, storage, logs, analytics and snapshots.
4. Verify raw messages/URLs are not transmitted or persisted.
5. Verify candidate URLs are never fetched, opened, rendered in iframes or used for previews/redirects.
6. Probe XSS-like strings, non-HTTP schemes, malformed URLs, user-info, punycode, Unicode and over-limit inputs.
7. Review all regular expressions and parser work for resource exhaustion.
8. Review CSP, security headers, dependency audit, environment files and client bundles for secrets.
9. Classify findings Critical/High/Medium/Low with file/line, impact, evidence and recommended repair.
10. Add regression tests for confirmed defects. Do not silence findings or weaken tests to get a pass.
11. Distinguish verified controls from assumptions and residual risks.
