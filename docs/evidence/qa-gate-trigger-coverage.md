# QA Gate Trigger Coverage

Date: 2026-03-14

Status: PASS
Backlog item: `WEB-P1-15`

## Scope

- Ensure the required `Web Quality` workflow can trigger when a PR changes only interaction tests or interaction Playwright config.
- Keep workflow/runbook text aligned with the actual trigger model.

## Repo Changes

- Added `tests/**` to `pull_request` and `push` path filters in `.github/workflows/seo-quality.yml`.
- Added `playwright.interaction.config.js` to `pull_request` and `push` path filters in `.github/workflows/seo-quality.yml`.
- Updated `docs/guides/OPS_RUNBOOK.md` to document that interaction-test-only changes still emit the required `SEO + QA Gate` status check.

## Local Verification

Command:

```bash
bun run check
```

Observed:

- PASS: full local quality gate completed after the trigger/doc updates.
- PASS: interaction suite completed within `bun run check` (`36 passed`).
- PASS: strict style audit remained within configured thresholds.

## GitHub Proof

- Proof PR: `#44` (`chore/qa-gate-proof` -> `fix/backlog-web-editorial-brand-qa`)
  - URL: `https://github.com/jarrydaubert/prosepal-web/pull/44`
- PR diff scope:
  - Changed only `tests/integration/tips-popup.spec.js`
- Observed checks on PR `#44`:
  - `SEO + QA Gate`
  - `Visual Regression`
  - `Vercel`
  - `Vercel Preview Comments`
- `SEO + QA Gate` run emitted from the test-only PR:
  - Workflow: `Web Quality`
  - Run URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/23085045297`
  - Job URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/23085045297/job/67060478702`
  - Observed on 2026-03-14 while the PR contained only a `tests/**` change

## Result

- PASS: `.github/workflows/seo-quality.yml` now covers interaction-test-only changes.
- PASS: a real GitHub PR changing only `tests/**` emitted the expected `SEO + QA Gate` status check.
- PASS: workflow/runbook text already matched the final trigger model.
