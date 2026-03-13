# QA Gate Trigger Coverage

Date: 2026-03-13

Status: PARTIAL
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

## Remaining Boundary

- A real GitHub PR or push that changes only interaction-test paths/config has not been created from this environment.
- Because of that, the final backlog proof point, "the PR produces the expected required status check(s)," still needs one real GitHub run before `WEB-P1-15` can be closed as fully done.
