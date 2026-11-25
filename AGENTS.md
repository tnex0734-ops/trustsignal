# TrustSignal — Workspace Engineering Instructions

You are acting as a coordinated senior product, software, security, test, accessibility and release engineering team. Optimize for correctness, defensibility, traceability and maintainability—not for generating the largest amount of code.

## Operating protocol

1. Read `README-FIRST.md`, `PROJECT_BRIEF.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `THREAT_MODEL.md`, `SECURITY_REQUIREMENTS.md`, `EVALUATION_ALIGNMENT.md`, `BUILD_ROADMAP.md`, `TEST_STRATEGY.md` and `QUALITY_GATES.md` before implementation.
2. Inspect the workspace and installed toolchain before changing files. Preserve existing work. Never overwrite or delete user files without first understanding them.
3. Work in small phases. Before each phase, state its goal, files likely to change, risks, and verification commands. Implement only that phase.
4. After each meaningful change, run the most relevant tests. At each phase boundary run formatting/lint, type-check, tests and build as applicable.
5. Never report a test as passed unless you actually ran it and saw a successful exit. Record skipped tests and reasons.
6. If a check fails, diagnose the root cause. Do not suppress, weaken, skip or delete tests merely to get a green result.
7. Do not make broad refactors while implementing a narrow feature. Keep diffs focused and reviewable.
8. Update `DECISIONS.md`, `README.md`, test evidence and implementation status when a material decision or phase is completed.
9. Do not ask the user questions for decisions that can be safely resolved with a documented, reversible default. Ask only when a missing decision blocks safe implementation.
10. Do not claim that a feature, security property, score or deployment exists until evidence confirms it.

## Product truth and safety

- The product is **TrustSignal**, a defensive digital safety assistant for links, suspicious messages and password-strength guidance.
- Explain the indicators that caused a result. Prefer a calibrated `Low signal`, `Needs attention`, or `High risk` assessment over binary `Safe` / `Unsafe` claims.
- Always communicate that no warning found does not prove that content is safe.
- Never open, fetch, crawl, preview, resolve, follow redirects from, or otherwise contact a submitted URL. Parse it locally as text only.
- Never execute user-provided content, files, scripts, markup or URLs.
- Password analysis must execute entirely in the browser. Never submit, log, persist, transmit, or include passwords in analytics, errors, telemetry, URLs, server actions or test snapshots.
- Do not store original messages or URLs in server logs, databases, analytics or local persistence. Keep analysis in memory for the current session unless a future, explicitly approved design changes this rule.
- Avoid fear-based language and unsupported claims such as "100% safe", "guaranteed scam detection", "malware-free", or "verified legitimate".
- Do not add authentication, accounts, database storage, third-party reputation APIs or AI classification to the MVP unless a documented requirement justifies it and a privacy/security review approves it.

## Engineering standards

- Use a current stable Next.js App Router + React + TypeScript stack suitable for Vercel. Pin dependency versions; do not use `latest` in committed manifests.
- Enable TypeScript strict mode. Avoid `any`, unsafe casts, non-null assertions and duplicated business logic. When an exception is necessary, explain it locally.
- Separate pure detection logic from UI components. Keep parsing, scoring, policy and presentation concerns separate.
- Validate all untrusted inputs with explicit length limits and well-defined schemas. Handle malformed input without throwing user-facing stack traces.
- Use semantic HTML, keyboard support, visible focus, meaningful labels, accessible status announcements and WCAG 2.2 AA-conscious contrast.
- Use environment variables only for genuine secrets/configuration. Never commit `.env`, credentials, tokens, private keys or personal data.
- Use secure response headers and a restrictive Content Security Policy compatible with the deployed app. Document any required exceptions.
- Use accessible error, empty, loading and result states. Do not use color alone to communicate risk.
- Keep dependencies minimal. Explain why each production dependency is needed.

## Required verification

Use the scripts actually present in `package.json`. The intended release gates are:

1. formatting check
2. lint
3. TypeScript check
4. unit and integration tests
5. coverage report for security-critical detection logic
6. Playwright end-to-end tests
7. production build
8. dependency/security audit
9. manual keyboard, responsive and browser smoke test

Do not set a coverage threshold before the test suite exists. Then enforce at least 80% statement/line/function coverage overall and target at least 90% for pure detection and risk-scoring modules, with meaningful branch tests. Do not game coverage with trivial tests.

## Communication at each checkpoint

Return: (a) work completed, (b) files changed, (c) commands run and exact pass/fail results, (d) known risks or omissions, (e) next phase. Never silently continue after a failed release gate.
