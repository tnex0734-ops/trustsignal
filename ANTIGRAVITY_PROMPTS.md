# Antigravity Prompt Sequence

Use one prompt at a time. Keep the workspace rules active. Do not paste every phase at once.

---

## Phase 0 — Read, inspect, plan only

**Model:** Gemini 4 Hydrogen — Max (or Orchestrator if available).

```text
Act as the principal engineer and product/security architect for TrustSignal.

Before doing anything, read README-FIRST.md, AGENTS.md, PROJECT_BRIEF.md, PRODUCT_REQUIREMENTS.md, ARCHITECTURE.md, THREAT_MODEL.md, SECURITY_REQUIREMENTS.md, EVALUATION_ALIGNMENT.md, BUILD_ROADMAP.md, TEST_STRATEGY.md and QUALITY_GATES.md.

Inspect the complete workspace, current runtime (Node/npm), existing files, available tools and Antigravity environment. Do not overwrite or delete anything. Do not implement code in this phase.

Deliver:
1. A concise product/technical understanding and challenge-to-feature mapping.
2. The proposed source tree and exact stack/dependency choices, verifying current stable compatibility rather than guessing versions.
3. Trust boundaries, privacy invariants and abuse cases.
4. A phased implementation plan with files, risks, dependencies and exact exit checks.
5. A test matrix covering suspicious, benign, malformed and boundary examples.
6. A checklist mapped to Code Quality, Security, Efficiency, Testing, Accessibility and Problem Statement Alignment.

Identify any contradictions or unsafe assumptions in the starter docs. Make a recommendation and record it in DECISIONS.md only if a decision record can be made without changing application code. Do not inflate scope. Do not claim the app exists or has passed tests. End with the exact first implementation phase and its commands.
```

## Phase 1 — Scaffold and quality foundation

**Model:** Gemini 4 Hydrogen — High.

```text
Implement only Phase 1 from BUILD_ROADMAP.md using the approved Phase 0 plan.

Create a current stable Next.js App Router application with strict TypeScript, responsive base layout, Tailwind, lint/format, Vitest, Testing Library, Playwright, coverage configuration and CI. Add only dependencies justified by the architecture. Pin compatible versions and commit the lockfile. Add the /api/health route returning metadata only. Add security headers and a CSP suitable for the actual app. Create the initial README and scripts.

Do not implement link/message/password detection yet. Do not add authentication, a database, analytics or third-party APIs.

Run clean install, formatting check, lint, type-check, starter tests and production build. Fix root causes of failures. Report exact commands/results and changed files. Stop at the Phase 1 exit gate.
```

## Phase 2 — Detection domain, fixtures and unit tests

**Model:** Gemini 4 Hydrogen — High; use Max if design ambiguity or security-sensitive tradeoffs arise.

```text
Implement only Phase 2 from BUILD_ROADMAP.md. Read the security and threat-model requirements again before coding.

Build pure, typed modules for URL parsing/link indicators, scam-message indicators, risk aggregation and result explanations. Add strict length limits, safe malformed-input behavior and documented heuristic rules. For password strength, use an offline browser-compatible estimator; keep its import isolated to client-side code and never add a server endpoint for it.

Create synthetic fixture sets with both benign and suspicious examples. Every rule must have focused unit tests, including boundaries and false-positive controls. Add tests asserting URL analysis never performs network access and unsupported schemes are never executed or navigated.

Do not build UI in this phase. Do not use an LLM or remote threat-intelligence service. Do not label a score as probability. Document limitations and weights/thresholds in the code or a dedicated rules document.

Run relevant tests, full lint and type-check. Review every regex for pathological behavior. Stop at the Phase 2 exit gate and report exact evidence.
```

## Phase 3 — User journeys and accessible UI

**Model:** Gemini 4 Hydrogen — High.

```text
Implement only Phase 3 from BUILD_ROADMAP.md. Preserve the pure analysis modules; UI must call them through feature services rather than duplicating rules.

Build a clean, trustworthy, responsive product experience with three obvious actions: Check a link, Check a message, Check a password. Each result must display a readable risk level, triggered indicators, plain-language explanations, practical next steps and a visible limitation statement. Keep language calm and non-technical. Avoid presenting low signal as proof of safety.

Add loading, empty, invalid, error and result states; reset behavior; password show/hide; short safety-learning content. Use semantic elements, labels, keyboard operation, visible focus, accessible announcements and non-color-only severity cues. Respect reduced motion. Do not add account sign-in or save raw inputs.

Add component/integration tests for every flow, error state and reset behavior. Test at 320px, 390px, 768px, 1024px and 1440px. Run lint, type-check, tests and production build. Stop at the Phase 3 exit gate.
```

## Phase 4 — Security hardening

**Model:** Gemini 4 Hydrogen — Max.

```text
Perform Phase 4 from BUILD_ROADMAP.md as an adversarial security engineer. Read THREAT_MODEL.md and SECURITY_REQUIREMENTS.md. Do not add features.

Inspect the code and test:
- password non-transmission and non-persistence;
- raw message/URL non-transmission and non-persistence;
- no submitted URL fetch, DNS lookup, preview, iframe, redirect or navigation;
- XSS-like pasted text rendered inert;
- malformed, unsupported and oversized inputs;
- Unicode/punycode and user-info URL cases;
- pathological input performance and regular expressions;
- health endpoint data exposure;
- CSP/security headers and dependency audit.

Add regression tests for every defect found. Never fix issues by weakening tests, suppressing warnings or hiding the result. If a requirement cannot be verified, state that clearly. Run the full quality suite and provide a concise security findings report with severity, evidence, fix and residual risk. Stop at the Phase 4 exit gate.
```

## Phase 5 — Test engineering and accessibility QA

**Model:** Gemini 4 Hydrogen — Max for audit; High for repairs.

```text
Implement Phase 5 from BUILD_ROADMAP.md. Act as an independent test lead; do not assume the implementation is correct because previous phases passed.

Review coverage against TEST_STRATEGY.md. Add missing unit, integration and Playwright tests for all three flows, benign and suspicious examples, invalid input, limits, reset, keyboard-only use, responsive behavior and privacy invariants. Add axe-based automated accessibility checks where practical, then perform a manual semantic/keyboard review. Check focus order, visible focus, accessible names, status announcements, contrast, zoom/text resizing, reduced motion and mobile overflow.

Target >=80% overall statements/lines/functions and >=90% for pure detection/risk modules, with meaningful branch tests. Do not add superficial tests or exclude important code to inflate coverage. Fix console errors, hydration warnings and flaky tests.

Run all checks from a clean install. Update TEST_RESULTS.md with versions, exact commands, test counts, coverage and skipped tests. Stop at the Phase 5 exit gate.
```

## Phase 6 — Final release review and evidence

**Model:** Gemini 4 Hydrogen — Max (or Orchestrator if available).

```text
Complete Phase 6 from BUILD_ROADMAP.md. Act as an independent release manager and skeptical evaluator.

Compare the actual implementation with PROJECT_BRIEF.md, PRODUCT_REQUIREMENTS.md, EVALUATION_ALIGNMENT.md and QUALITY_GATES.md. Do not assume a requirement is satisfied; locate code and test evidence. Identify missing or misleading claims. Update README.md so it documents the implemented product, architecture, privacy boundaries, setup, scripts, tests, limitations, screenshots/demo, deployment and challenge alignment. Add TEST_RESULTS.md and SECURITY_REVIEW.md based only on checks actually performed.

Review git status/diff, secrets, environment files, license/attribution for dependencies and assets, build output, accessibility and Vercel behavior. Ensure the GitHub Actions workflow matches real package scripts and lockfile. Do not commit or push without my explicit instruction.

Run clean install, format check, lint, type-check, all tests, coverage, dependency audit and production build. Produce a final release checklist with exact pass/fail evidence and unresolved issues. Do not claim a score or guarantee a maximum evaluation result.
```

---

## Follow-up prompt — Fix one failing gate without regressions

```text
Investigate the failing check below. First reproduce it and identify the root cause. Make the smallest safe change. Add or update a regression test. Do not disable tests, lower coverage thresholds, silence lint/type rules or refactor unrelated modules. Re-run the failing check and the relevant regression suite, then run lint, type-check and production build. Report exact commands and results.

Failure output:
[PASTE OUTPUT]
```

## Follow-up prompt — Review a diff before merging

```text
Review the current git diff as an independent senior reviewer. Prioritize correctness, security, privacy, accessibility, edge cases, performance and alignment with requirements. Return findings ordered Critical/High/Medium/Low with file and line references. Do not rewrite code yet. Distinguish confirmed bugs from suggestions. After I approve fixes, implement only the confirmed issues and add regression tests.
```
