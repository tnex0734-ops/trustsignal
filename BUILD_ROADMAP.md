# Staged Build Roadmap

## Phase 0 — Inspect and plan

**Goal:** Establish the real workspace state and a verifiable plan before changing files.

Deliverables:
- repo/toolchain inspection;
- final architecture and folder structure;
- feature breakdown and dependency choices;
- threat model review;
- acceptance criteria mapped to each visible evaluator category;
- explicit phase exit gates.

Exit gate: plan is complete, no unresolved safety-critical design question remains, and no code has been changed prematurely.

## Phase 1 — Scaffold and engineering foundation

- Create Next.js App Router project with strict TypeScript.
- Configure lint/format, tests, coverage, Playwright and CI.
- Configure base metadata, responsive shell, design tokens and global security headers.
- Add health route.
- Add README, scripts, `.gitignore`, `.env.example` and decision log.

Exit gate: install cleanly from lockfile; lint, type-check, starter tests and production build pass.

## Phase 2 — Detection domain and fixtures

- Define typed `Indicator`, `AnalysisResult` and risk aggregation contract.
- Implement URL parsing and independent link rules as pure functions.
- Implement message rules and URL extraction without network calls.
- Implement an offline password estimator wrapper for browser-only use.
- Create benign, suspicious, malformed and boundary fixtures.
- Add unit tests before connecting UI.

Exit gate: deterministic test matrix passes; inputs are bounded; there is no URL navigation/network behavior; password dependency is client-only.

## Phase 3 — User experience integration

- Build the three primary flows.
- Display risk levels, evidence, explanations, recommended next actions and limitations.
- Add reset behavior and accessible form states.
- Add Learn/Safety Center content.
- Ensure keyboard-only operation and mobile responsiveness.

Exit gate: component/integration tests pass; all core journeys are understandable and accessible; no raw input persistence.

## Phase 4 — Security hardening

- Review trust boundaries and data flow.
- Test XSS strings, invalid schemes, malformed URLs, max input sizes, Unicode and pathological inputs.
- Verify password is absent from network, storage and logs.
- Verify submitted URL is never fetched or opened.
- Review CSP and security headers; audit dependencies.

Exit gate: security checklist complete or every remaining issue documented with a justified release decision.

## Phase 5 — Full testing and accessibility QA

- Unit + integration + E2E coverage.
- Test positive and negative examples.
- Run keyboard and screen reader semantics review.
- Test responsive widths (320, 375/390, 768, 1024, 1440px).
- Test error, empty, loading and result states.
- Remove console warnings and fix regressions.

Exit gate: all required tests pass, coverage thresholds met, no critical accessibility/security issue remains.

## Phase 6 — Release and evidence

- Update final README and architecture/security notes to match actual code.
- Run clean install and full verification.
- Create screenshots and a short reproducible demo script.
- Push clean Git history to GitHub.
- Deploy to Vercel and smoke-test production routes.
- Confirm no `.env`, test secrets or local artifacts entered Git.

Exit gate: production deployment, GitHub repository and submission evidence all match.
