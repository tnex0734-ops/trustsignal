# Project Brief — TrustSignal

## One-line product

**TrustSignal helps people pause before they click, pay, reply or share a password.**

## Challenge fit

The challenge asks for a defensive solution that protects people, data or systems by detecting, preventing and raising awareness about threats such as scams, weak passwords, unsafe links, fake content or emergencies—without harming anyone.

TrustSignal directly addresses three of the named threat classes:

- unsafe links and deceptive domains;
- scam and phishing messages;
- weak or reused-looking password patterns (strength guidance only; no password reuse database).

It does so through explainable analysis and safer next steps.

## User problem

People receive messages and links through SMS, email and chat apps. They often need to decide quickly whether a message is trying to steal credentials, money, OTPs or account access. Existing advice is scattered, and generic warnings rarely explain what signal the user should look for.

## Target users

- Students and young adults who receive frequent promotional, delivery, banking and campus messages.
- Everyday smartphone and internet users who are not security experts.
- Families helping less technical relatives assess suspicious messages.

## Product promise

Give a quick, understandable first-pass assessment, explain the observed warning signs, and recommend a safe next action—without requiring the user to disclose a password or visit a suspicious link.

## Core experience

1. User chooses **Check a link**, **Check a message**, or **Check a password**.
2. TrustSignal analyses the input locally using documented, deterministic rules and (for passwords) a local strength estimator.
3. The result shows an assessment, each triggered indicator, why it matters, and a practical next step.
4. The user can read a short safety guide and retry with another input.

## Differentiation

- Privacy by design: analysis runs in the browser; no password or message content is sent to the app server.
- Explainable: every triggered signal is named and described; no opaque "AI says dangerous" score.
- Safe by default: submitted links are parsed but never visited.
- Honest uncertainty: the product makes no guarantee that a low-signal result is safe.
- Measurable: curated benign and suspicious fixtures create repeatable demonstrations and tests.

## Product principles

1. Protect the user, not the platform's engagement metrics.
2. Minimize data collection.
3. Explain before alarming.
4. Avoid false certainty.
5. Make the safe next step easier than the risky action.
6. Accessibility is a product requirement, not a polish phase.

## MVP scope

### In scope

- URL parsing and rule-based link-risk indicators.
- Message scanning for phishing/scam language and embedded URLs.
- Local password-strength estimation and actionable suggestions.
- Result explanations, severity labels and safety guidance.
- A small safety-learning section with examples.
- Responsive, accessible web app.
- Health endpoint and production deployment checks.
- Automated unit, integration and end-to-end tests.

### Explicitly out of scope for MVP

- Opening or crawling URLs.
- Live malware scanning, antivirus, DNS reputation or certificate validation.
- Claims of detecting all scams, all deepfakes or all fake content.
- User accounts, password storage, account recovery or authentication.
- Storing message contents, URLs or passwords.
- Sending content to an LLM or third-party classification API.
- Sending alerts to emergency services or tracking a user's location.
- Financial, legal or law-enforcement decisions.

## Success measures

Measure actual product quality, not vanity metrics:

- All documented test fixtures produce expected indicators and risk bands.
- No password or raw message/URL content appears in network requests, logs, storage or telemetry.
- All core journeys complete with keyboard and screen-reader-compatible semantics.
- The app is usable at mobile, tablet and desktop widths.
- A first-time user can understand the result and a safe next step without security jargon.
- All release gates pass and the production demo is repeatable.
