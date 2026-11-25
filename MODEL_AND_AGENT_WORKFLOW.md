# Model and Antigravity Workflow

## Primary model

Use **Gemini 4 Hydrogen** as the default implementation model. Prefer it over Gemini 3.8 Flash for this project. Google's Antigravity model documentation describes Hydrogen as the current fast coding/execution model and the blog reports 57% on Terminal-Bench 4.1 compared with 18.2% for Gemini 3.8 Flash. These are vendor-published benchmarks, not a guarantee of this project's score.

## Thinking budget

| Task | Suggested mode |
|---|---|
| First architecture/threat-model plan | Max |
| Main implementation and integration | High |
| Small, well-defined edit or documentation | Medium |
| Security audit, tricky bug, final release audit | Max |

Do not use Max for every trivial edit. Spend deeper reasoning on decisions with high security or architectural cost.

## If comparing with Gemini 3

Antigravity's published selector distinguishes **Gemini 3.8 Flash** from **Gemini 3.1 Pro**. The current documentation lists Gemini 3.8 Flash at Medium and says it is scheduled to leave on November 30, 2026. Gemini 3.1 Pro is listed separately and its availability is Enterprise-only in the documented model table. If the user's selector says a different name, verify the exact label before assuming it is one of these.

There is no direct head-to-head benchmark in the cited Antigravity material for Gemini 4 Hydrogen versus Gemini 3.1 Pro. The recommendation for Hydrogen is based on current Antigravity workflow positioning, its availability, and the published 3.8 Flash comparison—not a claim that every task is universally better.

## Orchestrator

If available, Orchestrator is a good fit for a multi-phase engineering build: the planner explores and writes a plan, while Hydrogen performs edits, builds and tests. Use the strongest planner your plan exposes (for example Carbon or Neon) with Hydrogen as executor. If Orchestrator is unavailable, use Hydrogen directly with the staged prompts in `ANTIGRAVITY_PROMPTS.md`.

## Efficient working loop

1. Plan one bounded phase.
2. Implement only that phase.
3. Run the checks relevant to the change.
4. Inspect the diff and test evidence.
5. Fix root causes before proceeding.
6. Update the decision log and test results.
7. At major milestones, run the complete suite.

Avoid a single mega-prompt, unrelated refactors, repeated full rebuilds after every tiny edit, or treating a successful code generation response as proof that the feature works.

## Official references

- Antigravity model selector and availability: https://antigravity.google/docs/models
- Gemini 4 Hydrogen and Orchestrator announcement (November 12, 2026): https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity
- Antigravity agent skills and `.agents/skills` layout: https://antigravity.google/docs/skills/
- Node.js release schedule: https://nodejs.org/en/about/previous-releases
