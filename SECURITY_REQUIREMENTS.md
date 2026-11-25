# Security Requirements and Review Checklist

## Must-haves

### Data handling
- [ ] Password analysis executes only in browser code.
- [ ] Password values are not written to console, logs, telemetry, URLs, cookies, local/session storage or backend requests.
- [ ] Message and URL inputs are not sent to the server or third parties.
- [ ] No original user input is persisted.
- [ ] Reset clears sensitive component state.
- [ ] Error handling never echoes sensitive input.

### URL handling
- [ ] Use the built-in URL parser; never navigate to the supplied URL.
- [ ] Accept only HTTP/HTTPS for heuristic analysis.
- [ ] Treat unsupported schemes as invalid, not as links to open.
- [ ] Detect user-info, IP-literal host, punycode and known shortener indicators.
- [ ] No fetch, `window.open`, iframe, image beacon, DNS, HEAD or redirect request uses the submitted URL.
- [ ] Avoid claiming HTTPS means trustworthy.

### Rendering and input
- [ ] Render pasted content as text, not HTML.
- [ ] Avoid `dangerouslySetInnerHTML`.
- [ ] Apply input size limits before expensive analysis.
- [ ] Avoid catastrophic-backtracking regex.
- [ ] Use runtime validation for external data and API input.
- [ ] Fail closed for malformed or unsupported input.

### Application and supply chain
- [ ] Security headers and CSP configured for production.
- [ ] Dependency lockfile committed.
- [ ] Dependency audit run and findings resolved or documented.
- [ ] `.env*` excluded; `.env.example` contains placeholders only.
- [ ] No secrets in source, screenshots, fixtures, commits or README.
- [ ] No unnecessary permissions, packages, external scripts or analytics.

## Security acceptance tests

1. A test intercepts browser requests and asserts analysis does not call the candidate URL.
2. Password E2E test intercepts all requests and asserts the entered password never appears in request URLs or bodies.
3. XSS-like message text displays literally and causes no script execution.
4. Invalid/oversized input yields safe, helpful feedback.
5. Health endpoint returns metadata only and does not reflect query/body content.
6. Response headers are present on production routes.
7. No user-input data is written to browser storage.

## Incident guidance shown to users

If the user already shared an OTP/password or entered credentials on a suspicious page, provide calm next steps: use the official service/app to change the password, revoke suspicious sessions where available, enable MFA, contact the bank/service through verified channels if financial information was involved, and report the message to the relevant provider. Avoid victim-blaming.
