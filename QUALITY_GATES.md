# Quality Gates — No Phase Is Done Until These Pass

## Gate A — Code quality
- [ ] TypeScript strict mode enabled; no unexplained `any` or unsafe casts.
- [ ] Format check passes.
- [ ] ESLint passes without disabling relevant rules to hide issues.
- [ ] Type-check passes.
- [ ] No duplicated rule logic or business logic embedded in presentation components.
- [ ] Dependency list is minimal and lockfile committed.

## Gate B — Security
- [ ] Password analysis stays entirely client-side.
- [ ] No raw message/URL/password in persistent storage, logs, analytics or server request bodies.
- [ ] Submitted URLs are never fetched, opened, previewed or resolved.
- [ ] Pasted content is rendered as text; XSS payloads remain inert.
- [ ] Inputs are bounded and malformed values are handled.
- [ ] CSP and security headers are verified.
- [ ] Dependency audit reviewed.

## Gate C — Efficiency
- [ ] Input caps applied before analysis.
- [ ] No catastrophic regex patterns.
- [ ] No needless database, auth, microservices or runtime services.
- [ ] Production bundle and browser console reviewed.
- [ ] Performance changes based on measurement, not guesswork.

## Gate D — Testing
- [ ] Unit tests cover each risk indicator.
- [ ] Positive and benign fixtures exist.
- [ ] Boundary and malformed-input tests pass.
- [ ] Integration and E2E user journeys pass.
- [ ] Coverage targets met with meaningful tests.
- [ ] CI is green on a clean install.

## Gate E — Accessibility
- [ ] All controls keyboard accessible.
- [ ] Visible focus states.
- [ ] Accessible names and instructions.
- [ ] Results announced without stealing focus.
- [ ] Color is not the only severity cue.
- [ ] Contrast and text scaling reviewed.
- [ ] Reduced-motion preference respected.
- [ ] 320px/mobile layout does not overflow.

## Gate F — Problem statement alignment
- [ ] Problem statement appears in README and project explanation.
- [ ] Main product actions clearly map to threats named in the challenge.
- [ ] Each scanner demonstrates detection + prevention guidance + awareness.
- [ ] Demo contains benign and suspicious examples.
- [ ] No off-topic feature displaces defensive security.

## Release gate
- [ ] Clean install.
- [ ] Full verification command passes.
- [ ] Production build passes.
- [ ] Git diff and secret scan reviewed.
- [ ] README and screenshots reflect final implementation.
- [ ] GitHub remote and branch confirmed.
- [ ] Vercel production deployment smoke-tested.
- [ ] No claim about score, security guarantee or live detection exceeds evidence.
