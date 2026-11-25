# Product Requirements and Acceptance Criteria

## P0 — Required for submission

### 1. Link Safety Check

**Input:** A URL pasted by the user.

**Behavior:**
- Trim whitespace; enforce a documented maximum length (recommend 2,048 characters).
- Parse with the standard `URL` API inside a guarded function.
- Accept only `http:` and `https:` for analysis; explain unsupported schemes without navigating.
- Detect and explain useful indicators such as insecure HTTP, user-info credentials in the authority, IP-literal host, punycode hostname, known URL shortener domain, excessive subdomain depth, deceptive brand-like host text and suspicious path/query wording.
- Use a transparent, documented weighted score or risk aggregation. Keep every indicator in the result.
- Return `Invalid input`, `Low signal`, `Needs attention`, or `High risk` as appropriate.
- Clearly state that the checker does not open the URL, check the destination's live reputation, or prove safety.

**Acceptance:**
- Invalid and malformed URLs never crash the app.
- `javascript:`, `data:` and other non-HTTP schemes are never navigated or executed.
- URLs containing credentials, IP hosts, punycode and known shorteners trigger the expected indicators.
- A plain HTTPS URL is not labelled guaranteed safe.
- Tests prove that no network request is made during URL analysis.

### 2. Scam / Phishing Message Check

**Input:** User-pasted message text.

**Behavior:**
- Enforce a documented maximum message length (recommend 8,000 characters).
- Analyse locally using a set of readable, testable rules.
- Check for credential/OTP requests, payment or gift-card demands, urgent threats, fake rewards, account suspension pressure, remote-access or APK installation pressure, impersonation language and embedded risky URLs.
- Avoid treating any one phrase as proof of a scam. Combine independent indicators and show the evidence.
- Return a risk band, triggered indicators and next steps.
- Do not upload, persist or log the message text.

**Acceptance:**
- Suspicious and benign fixtures are both included.
- A message containing "urgent" alone must not automatically become high risk.
- An OTP/password request or remote-access request produces a clearly explained warning.
- Embedded URLs are analysed through the local URL module only.
- Oversized input is rejected with a helpful message.

### 3. Password Safety Check

**Input:** Password entered in a password input field.

**Behavior:**
- Estimate strength locally using a maintained offline estimator such as `@zxcvbn-ts/core` and its language dictionaries, or a comparably justified local library.
- Show actionable guidance (length, predictability, common patterns, personal words, repetition and sequences).
- Provide a show/hide control with an accessible label.
- Clear the password from component state when the user resets or leaves the check.
- Never send the password to any server or third-party service.
- Do not claim to know whether a password has appeared in a breach; MVP does not check breach databases.

**Acceptance:**
- Network inspection confirms the password never leaves the browser.
- Password never appears in logs, analytics, URL, localStorage, sessionStorage, cookies or test snapshots.
- Empty input, long input and non-ASCII input are handled safely.
- Strength feedback is not based only on simplistic uppercase/lowercase/digit rules.

### 4. Result and Safety Guidance

Each result must include:
- readable assessment label;
- non-color-only severity cue (icon plus text or text label);
- list of detected signals;
- plain-language explanation for each signal;
- one or more practical next steps;
- limitations statement.

Examples of safe guidance:
- Do not click the link; open the organisation's official app or type its known website manually.
- Never share an OTP, PIN, password or recovery code with someone who contacted you.
- Contact the organisation using a phone number from its official website/card, not the message.
- If credentials were entered, change them from the genuine service and enable MFA; contact the institution if money or banking access is involved.

### 5. Safety Learning

Include short, practical lessons on:
- how phishing works;
- why OTPs and recovery codes must remain private;
- how to identify lookalike domains;
- why HTTPS does not prove a website is legitimate;
- how to create stronger unique passwords;
- what to do after clicking or sharing information.

Do not present unsupported statistics. Use original explanations and link out only to trustworthy official resources if links are added.

### 6. Reliability and privacy

- No sign-up required.
- No database required for MVP.
- Do not persist raw inputs or results containing original text.
- No third-party analytics or content processing by default.
- Provide `/api/health` for service status and app version/build metadata.
- Provide `/api/rules` for the versioned public detection-rule catalogue and `/api/guides` for curated safety guidance.
- These endpoints must return public product metadata only; no scan content is submitted to them.
- Validate response shapes, set appropriate cache headers and cover routes with integration tests.
- Add safe HTTP security headers and a compatible Content Security Policy.

## P1 — Only after all P0 gates pass

- Optional installable PWA, only if it does not weaken security or accessibility.
- Optional export of a redacted explanation report, excluding original input.
- Additional language support with separately reviewed detection fixtures.
- Carefully scoped trusted-resource links.

## Non-functional requirements

- TypeScript strict mode.
- Responsive layout from 320px width upward.
- WCAG 2.2 AA-conscious interaction and contrast.
- Deterministic rules with unit tests.
- Input caps and bounded work to prevent pathological inputs.
- No console errors in core journeys.
- No request is made to the URL being analysed.
- Production build succeeds on Vercel.
