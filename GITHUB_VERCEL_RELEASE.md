# GitHub + Vercel Release Guide

## Before first push

1. Create a new empty GitHub repository named `trustsignal` (or another final name). Do not publish secrets or generated personal data.
2. Ensure `.gitignore` excludes at least `node_modules`, `.next`, `out`, `coverage`, `playwright-report`, `test-results`, `.env*` except `.env.example`, local logs and OS files.
3. Run `git status` and inspect every staged file.
4. Confirm `.env.example` contains placeholders only and no real token/key.
5. Confirm README installation commands and scripts match the final package.
6. Run the full release gate before the first public push.

## Suggested Git workflow

- `main` — stable submission/deployment branch.
- `feat/<short-name>` — bounded feature work.
- `fix/<short-name>` — focused fixes.
- Commit in logical checkpoints, e.g. `feat: add local URL risk analysis`, `test: cover phishing message indicators`, `security: prevent sensitive input persistence`.
- Avoid one giant commit containing the entire project if there is time to preserve meaningful history.
- Never include `.env.local`, credentials, screenshots with private data or personal test messages.

## Suggested commands

```bash
git init
git add .
git diff --cached
git commit -m "chore: initialize TrustSignal project"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/trustsignal.git
git push -u origin main
```

Replace the placeholder with the actual repository URL. Verify the remote with `git remote -v` before pushing.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Select the detected Next.js framework and default build settings unless the project requires a documented change.
3. Add environment variables only if the final implementation truly requires them. MVP should not need secrets for analysis.
4. Deploy a preview first; test all three flows and `/api/health`.
5. Promote/deploy production only after preview smoke tests pass.
6. Re-run production smoke tests after deployment.

## Production smoke checklist

- [ ] Homepage loads without console errors.
- [ ] Link flow returns expected test result without contacting the candidate URL.
- [ ] Message flow shows triggered indicators and guidance.
- [ ] Password flow works while network inspection shows no password transmission.
- [ ] Mobile width works without horizontal scrolling.
- [ ] Keyboard focus and form labels work.
- [ ] `/api/health` returns status/version metadata only.
- [ ] Response security headers are present.
- [ ] No environment secret is exposed in client bundles or source maps.

## Repository README should include

- Product summary and problem statement.
- Screenshot/demo link.
- Features and challenge mapping.
- Architecture and privacy design.
- Tech stack.
- Local setup and scripts.
- Testing/coverage evidence.
- Known limitations and non-goals.
- Deployment URL.
- License and attributions.

Do not add badges or claim CI/security status until the relevant workflow has run successfully.
