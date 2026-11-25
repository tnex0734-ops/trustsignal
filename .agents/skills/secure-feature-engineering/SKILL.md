---
name: secure-feature-engineering
description: Implements TrustSignal features with privacy-first boundaries, strict TypeScript, bounded input handling and explainable defensive logic. Use for link, message, password, API or security-sensitive feature implementation.
---

# Secure Feature Engineering Skill

1. Read `AGENTS.md`, `THREAT_MODEL.md`, `SECURITY_REQUIREMENTS.md` and relevant product acceptance criteria.
2. Inspect existing architecture and tests; do not replace established patterns without a reason.
3. Separate pure domain logic from components and I/O.
4. Treat all pasted content as untrusted. Validate type, length and scheme before processing.
5. Never fetch/open/preview a candidate URL. Never transmit or persist passwords. Do not log raw input.
6. Use readable, bounded parsing rules; avoid catastrophic regex and unsafe HTML rendering.
7. Provide named indicators, plain explanations, safe next steps and limitations.
8. Add unit tests for normal, negative, malformed and boundary cases before integrating UI.
9. Make the smallest coherent change; run relevant tests, lint and type-check.
10. Report evidence and residual risk. Never claim a control is effective without a test or inspection.
