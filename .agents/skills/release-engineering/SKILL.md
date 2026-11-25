---
name: release-engineering
description: Prepares TrustSignal for GitHub submission and Vercel production deployment. Use when updating README, CI, environment configuration, Git history, deployment or final submission evidence.
---

# Release Engineering Skill

1. Read `GITHUB_VERCEL_RELEASE.md` and `QUALITY_GATES.md`.
2. Confirm actual package scripts and workflow commands agree.
3. Perform a clean dependency install and complete verification suite.
4. Inspect git status, staged diff, ignored files, environment files and secrets.
5. Verify README claims against actual code and captured test evidence.
6. Verify no test fixture, screenshot or demo contains real sensitive data.
7. Confirm the Vercel build configuration and environment variables are minimal.
8. Deploy preview first, smoke-test all three user journeys, then production.
9. Re-check production health, security headers, mobile behavior and privacy.
10. Do not push, commit, publish or deploy without explicit user authorization.
11. Return an evidence-based release report with unresolved issues and rollback considerations.
