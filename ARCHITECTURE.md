# Technical Architecture

## Recommended stack

- Next.js App Router on the current stable release at implementation time.
- React + TypeScript with `strict: true`.
- Tailwind CSS for styling, with a small token layer and reusable components.
- Zod for runtime validation where data crosses a trust boundary.
- Vitest for unit/integration tests; React Testing Library for component behavior.
- Playwright for end-to-end browser journeys.
- ESLint + Prettier (or one clearly configured formatter/linter toolchain).
- Vercel for deployment.
- Node.js 26 LTS (see `.nvmrc`) and npm for package management unless the existing workspace already standardizes on pnpm.

Pin exact dependency versions in `package.json` and commit the lockfile. Do not choose versions by guessing; inspect current stable compatibility during scaffolding.

## Architecture style

Use a modular monolith. Do not introduce microservices, a database, authentication or queues for an MVP that does not need them.

```text
Browser
  ├── Link Check UI ─────┐
  ├── Message Check UI ──┼──> Pure local analysis modules
  ├── Password Check UI ┘       ├── URL parser + link rules
  │                             ├── Message rules
  │                             ├── Password estimator (offline)
  │                             └── Risk aggregation + explanations
  │
  └── Next.js server-rendered app shell
             ├── GET /api/health (service/build metadata)
             ├── GET /api/rules (versioned public rule catalogue)
             └── GET /api/guides (curated safety guidance)

Vercel: serves server-rendered pages and typed Route Handlers. The API returns public product metadata only; it never accepts scan content. No user-input database.
```

## Suggested source layout

```text
src/
  app/
    layout.tsx
    page.tsx
    learn/page.tsx
    api/health/route.ts
    api/rules/route.ts
    api/guides/route.ts
    globals.css
  components/
    app-shell/
    navigation/
    scanner/
    results/
    safety/
    ui/
  features/
    link-check/
      components/
      schemas.ts
      service.ts
    message-check/
      components/
      schemas.ts
      service.ts
    password-check/
      components/
      service.ts
  lib/
    analysis/
      indicators.ts
      risk.ts
      url-parser.ts
      link-rules.ts
      message-rules.ts
      normalize-text.ts
    validation/
    security/
    constants/
  test/
    fixtures/
    helpers/
    unit/
    integration/
e2e/
  public/
```

The implementation may adjust this layout if there is a clear reason. Avoid making every folder a one-file abstraction; keep the actual project easy to navigate.

## Pure analysis contract

Create a shared typed result such as:

```ts
type RiskLevel = "low-signal" | "needs-attention" | "high-risk";

type Indicator = {
  id: string;
  title: string;
  explanation: string;
  severity: "info" | "warning" | "critical";
  recommendation: string;
};

type AnalysisResult = {
  kind: "link" | "message";
  riskLevel: RiskLevel;
  score: number; // internal heuristic, explicitly not probability
  indicators: Indicator[];
  limitations: string[];
};
```

The final schema should be refined before implementation, not copied blindly. Do not describe the numeric score as a probability or calibrated confidence. Prefer showing risk level and signals prominently; if score appears, label it as a heuristic indicator score.

## Boundaries

- UI components render state and collect input; they do not implement detection rules inline.
- Pure analysis functions accept bounded strings and return serializable typed results.
- Password strength estimator is imported only by client-side code. Add a test or build-time check ensuring no password-bearing request is made.
- The health route must not accept or echo arbitrary user content.
- No URL preview component, link unfurling, screenshot, HEAD request, DNS request, or redirect resolution.
- No raw user input in error messages, observability or analytics.

## Performance

- Rules should be linear or near-linear in input length, with strict input caps.
- Avoid regular expressions with catastrophic backtracking. Prefer bounded, simple patterns and unit tests for pathological inputs.
- Do not load large libraries until the relevant feature is opened if dynamic import provides a meaningful reduction without complicating privacy.
- Keep the initial page lightweight. Avoid unnecessary charting or animation libraries.
- Do not optimize prematurely; use browser/network profiling if measurable performance concerns appear.

## API and deployment

The API surface for MVP should remain small and purposeful:
- `GET /api/health`: status, version and build metadata (no secrets, no user data).
- `GET /api/rules`: versioned public rule metadata used to explain the current local analysis rules.
- `GET /api/guides`: curated safety-learning content and recommended next steps.

Implement typed response schemas, cache headers and route tests. The rules catalogue should have one source of truth shared with the client-side analyzer; do not maintain duplicated rule IDs or explanations. The analysis features run in the browser and do not send candidate content to these endpoints. If later requirements need server-side analysis or a third-party service, pause and update the threat model, privacy notice, consent behavior and tests before adding it.
