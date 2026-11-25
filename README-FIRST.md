# TrustSignal — Hack2Skill Build Kit

> **Purpose:** A complete, staged Antigravity build brief for a defensive digital-safety product.
>
> **Important:** This ZIP is the engineering starter kit and agent instruction pack. It is not a claim that the application has already been implemented, tested, scored, or deployed. Antigravity should create the application in this folder by following the phases below.

## Start here

1. Extract this folder into a new, empty Antigravity workspace. Keep the `.agents` directory and `AGENTS.md` at the workspace root.
2. Open the folder in Antigravity.
3. Select **Gemini 4 Hydrogen**. Use **Max** for the first planning pass and final security/release audits; use **High** for implementation; use **Medium** for small, well-defined edits.
4. If your account has **Orchestrator**, use it for the full multi-step build, with the strongest available planner and Gemini 4 Hydrogen as executor.
5. Paste **Phase 0** from `ANTIGRAVITY_PROMPTS.md`. Do not ask the agent to build everything in one message.
6. Complete each phase in order. Do not begin the next phase until the current phase's acceptance criteria and quality gates pass.

## Files to read first

- `AGENTS.md` — persistent engineering rules for the whole workspace.
- `PROJECT_BRIEF.md` — product idea, users, scope and outcomes.
- `PRODUCT_REQUIREMENTS.md` — requirements and acceptance criteria.
- `ARCHITECTURE.md` — proposed technical design and trust boundaries.
- `THREAT_MODEL.md` and `SECURITY_REQUIREMENTS.md` — security boundaries and non-negotiable rules.
- `EVALUATION_ALIGNMENT.md` — mapping to the six evaluation labels visible in the reference screenshot.
- `BUILD_ROADMAP.md` — phased implementation plan.
- `TEST_STRATEGY.md` and `QUALITY_GATES.md` — verification requirements.
- `ANTIGRAVITY_PROMPTS.md` — copy/paste prompts in execution order.
- `MODEL_AND_AGENT_WORKFLOW.md` — recommended model, thinking budget and staged agent workflow.
- `GITHUB_VERCEL_RELEASE.md` — repository and deployment checklist.

## Product decision

Build **TrustSignal**, an explainable, privacy-first digital safety assistant. Its core features are:

1. Suspicious link analysis.
2. Scam/phishing message analysis.
3. Local password-strength guidance.
4. Practical next-step safety guidance.

The app must not claim to detect every scam, certify a link as safe, or replace professional security services. The MVP must not fetch or open submitted links and must never send a password, message or candidate URL to a server. The Next.js backend serves versioned public rule metadata, safety guidance and health information; it does not accept scan content.

## What the reference screenshot means

The supplied score image belongs to another team's project. Treat it only as a visual reference for the category names: Code Quality, Security, Efficiency, Testing, Accessibility, and Problem Statement Alignment. It is **not** the user's score, a baseline for TrustSignal, or proof of the evaluator's exact scoring weights.

## Done means

The project is only ready to submit when the app works locally, all required quality gates pass, the demo paths are repeatable, the README reflects the final implementation, GitHub contains the intended source, and the Vercel production deployment has been smoke-tested.
