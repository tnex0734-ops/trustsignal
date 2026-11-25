---
name: test-engineering
description: Designs and implements meaningful unit, integration, end-to-end, privacy and accessibility tests for TrustSignal. Use when creating features, fixing regressions or preparing evaluation/release evidence.
---

# Test Engineering Skill

1. Derive tests from acceptance criteria and threat cases, not from implementation details alone.
2. Test pure detection rules independently, one indicator at a time.
3. Include benign counterexamples to guard against false positives.
4. Cover invalid, boundary, Unicode, oversized and pathological inputs.
5. Add integration tests for user-visible explanation, reset and validation behavior.
6. Add Playwright journeys for link, message and password checks.
7. Intercept requests/storage to enforce privacy invariants.
8. Add keyboard and automated accessibility tests; include a manual checklist for what automation cannot verify.
9. Aim for >=80% overall statements/lines/functions and >=90% for pure detection modules only after tests are meaningful; review branch coverage and uncovered code.
10. Run the tests and report exact totals. Never claim unrun checks passed, and never remove a meaningful test just to obtain green CI.
