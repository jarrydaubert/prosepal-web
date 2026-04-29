# Ops Runbook (Single Source of Truth)

Scope: DevOps, CI/CD, release, and operational quality practices for `prosepal-web`.

## Purpose and principles

- Keep production changes safe through repeatable automation.
- Keep releases auditable by requiring PR-based delivery and green checks.
- Keep docs trustworthy by matching instructions to current scripts/workflows.
- Keep this runbook evergreen by documenting process and intent, while leaving tunable thresholds in code/config.

## Operating model

- Default branch is `main`.
- Delivery model is PR-first.
- `main` is protected by rulesets and required checks.
- Repository is public and operated within GitHub free-tier constraints; workflows should minimize wasted minutes and must not rely on privileged secrets in untrusted PR contexts.
- Hosting path is Vercel origin behind Cloudflare edge.
- Primary local quality gate is `bun run check`.
- SEO generation date source is `PROSEPAL_CONTENT_DATE`.
  By default, `bun run generate:site` resolves this from explicit editorial metadata in `data/editorial-metadata.json` plus inline `datePublished`/`dateModified` values on static blog articles.
  Set `PROSEPAL_CONTENT_DATE=YYYY-MM-DD` explicitly only when you need an override.

## Editorial date contract

- Generated message detail pages and metadata-only static pages (`/`, hubs, legal/support pages) source dates from `data/editorial-metadata.json`.
- Static blog articles keep explicit inline `datePublished` and `dateModified` values in the page HTML.
- `public/sitemap.xml` `lastmod` values must resolve from one of those two sources; no global build-date fallback is allowed.
- Missing or invalid editorial dates are build failures, not warning-only conditions.

## Daily engineering flow

- Branch from `main`.
- Iterate with the fast local gate:

```bash
bun run check:fast
```

- Before opening or merging a PR, run the full gate:

```bash
bun run check
```

Why this split exists:
- `check:fast` keeps iteration speed high.
- `check` is the canonical merge-quality contract.

## SERP title guidance

- Keep high-priority page `<title>` tags concise (usually 45-65 characters including brand suffix).
- Preserve intent keywords when shortening titles (do not remove primary query meaning).
- Validation command:

```bash
bun run validate:title:lengths
```

- If priority landing pages change, update target coverage in `scripts/validate-title-lengths.js`.

## Deployment flow

- Confirm quality checks are green.
- Confirm the local Vercel link targets the correct project:

```bash
bun run vercel:check-link
```

- Default production path is merge-to-main.
- Local CLI production deploy is emergency-only and explicitly gated:

```bash
ALLOW_PROD_CLI_DEPLOY=1 bun run deploy:prod
```

Why this policy exists:
- Merge-to-main keeps deploy history reviewable and consistent with CI evidence.
- Emergency CLI deploy remains available for incident response without normalizing bypasses.

## CI/CD map

`Web Quality`
- Runs the full local contract (`bun run check`).
- Catches content, SEO, schema, accessibility, runtime CSP, analytics-event, interaction, and style regressions in one gate.
- Also triggers when only interaction tests or `playwright.interaction.config.js` change, so PRs that modify the required QA surface still emit the required `SEO + QA Gate` status check.
- Uploads diagnostics artifacts on failure to speed triage.

`Visual Regression`
- Detects unintended UI drift via snapshots.
- Protects design consistency during content and CSS iteration.

`Lighthouse Budget`
- Guards user-facing quality trends in performance, accessibility, and SEO.
- Keeps quality drift visible over time.

`CodeQL`
- Runs via GitHub code scanning default setup for this repository; there is currently no in-repo `.github/workflows/codeql*.yml` source of truth.
- Produces the required `CodeQL` check on `main`/PRs and backs the active `code_scanning` ruleset requirement.
- Current live configuration is expected to stay `configured` with supported repo languages and weekly schedule unless the owner intentionally changes GitHub security settings.

`Monthly Governance Audit`
- Audits policy drift, governance token health, and CI usage patterns.
- Runs on five paths: manual dispatch, the monthly schedule, a weekly schedule, governance-sensitive PRs to `main`, and governance-sensitive pushes to `main` (`.github/workflows/**`, audit scripts, token-expiry validation, runbook/security policy docs).
- Scheduled/manual runs and corresponding `push` runs on `main` are authoritative for privileged governance enforcement.
- Governance-sensitive `pull_request` runs are review-loop checks for trusted same-repo branches only.
- Secretless public contexts such as fork PRs and Dependabot PRs must emit an explicit skip/notice instead of a misleading failure when `GH_ADMIN_TOKEN` is unavailable; `pull_request_target` is intentionally avoided for privileged governance work on untrusted code.
- `CI usage` evidence is only trustworthy when the audit proves it paginated far enough to cover the full 30-day window; truncation or API failure must leave a visible `FAIL`/`SKIP`, not a partial count.
- Default CI usage thresholds are tuned for the current repo cadence: monthly review threshold `650m`, enforced monthly cap `750m`, `Web Quality` average `3m`, and `CodeQL` average `8m`. Repository variables `GH_CI_MONTHLY_MINUTES_REVIEW`, `GH_CI_MONTHLY_MINUTES_MAX`, `GH_CI_WEB_QUALITY_AVG_MINUTES_MAX`, and `GH_CI_CODEQL_AVG_MINUTES_MAX` can override those values without a code change.
- CI budget overage still records `FAIL` evidence on every path, but only scheduled/manual governance audits enforce that overage as a failing workflow outcome. PR and `push` review-loop runs warn instead so merges are not blocked by a pre-existing monthly budget breach.
- Prevents silent process erosion and expired-credential surprises.

`Release Automation`
- Handles release PR/version/tag/release-note flow.
- Reduces manual release steps and metadata drift.

`Interaction Flake Audit`
- Re-runs critical browser smoke flows repeatedly.
- Detects non-deterministic behavior before it reaches users.

`Visual Flake Audit`
- Re-runs visual snapshots repeatedly with fixed workers.
- Detects intermittent rendering diffs before they become noisy PR failures.

## Release readiness checklist

- Full gate passes locally:

```bash
bun run check
```

- Required GitHub checks are green on the PR.
- Release QA checks pass against production-facing metadata/schema/canonicals:

```bash
bun run release:qa
```

- Accessibility baseline validation passes:

```bash
bun run validate:a11y:baseline
```

- Manual keyboard/focus sanity pass is run for key journeys:

```bash
bun run validate:a11y:manual
```

- Runtime CSP behavior is verified:

```bash
bun run validate:csp:runtime
```

- Conversion event wiring is verified:

```bash
bun run validate:events:conversion
```

- Form endpoint strategy is verified:

```bash
bun run validate:formspree:strategy
```

- Optional repeatability pass for interaction stability:

```bash
bun run test:interaction:flake-audit
```

- Optional repeatability pass for visual snapshot stability:

```bash
bun run test:visual:flake-audit
```

- If an experiment is active, complete experiment governance checks before decisioning:
  - `Assignment consistency`: same user remains in the same variant across reload/session.
  - `Exposure integrity`: each assigned user emits one `experiment_exposure` event per session with matching `experiment_id` and `variant_id`.
  - `Anti-peeking policy`: do not declare winners before the pre-defined minimum sample size and decision window.

Evidence expectations:
- Validation scripts write/update evidence in `docs/evidence/`.
- For governance controls, use the successful GitHub Actions run on `main` as authoritative evidence.

## Tips popup trigger policy

- Trigger channels:
  - Timer trigger after 12s.
  - Exit-intent trigger on top-edge mouseout.
- Timer guardrail:
  - Do not auto-open if the user has active hero conversion intent (recent interaction/focus/input on hero CTA or waitlist surfaces within the suppression window).
- Persistence:
  - Dismiss = suppress for 14 days.
  - Successful popup submit = suppress for 90 days.
- Measurement:
  - Keep `tips_popup_open`, `tips_popup_dismiss`, and popup submit events wired in analytics checks.
- Test override:
  - Integration tests may set `window.__prosepalPopupDelayMs` to shorten timer waits; production behavior remains 12s.

Why this policy exists:
- It protects first-session conversion flow from interruption while preserving newsletter capture opportunities for disengaging visitors.

## Security and governance controls

- Secret scanning enabled.
- Push protection enabled.
- Private vulnerability reporting enabled.
- Security disclosure flow documented in `SECURITY.md`.
- Monthly governance audit maintained and monitored.
- Privileged governance automation never runs repository secrets against untrusted PR code.

Why this matters:
- Public repos need defensive defaults; these controls reduce accidental secret exposure and policy drift risk.

## Monthly operations review

- Run governance audits:

```bash
bun run audit:github:policy
bun run audit:governance:token
bun run audit:ci:usage
```

- Verify crawler policy and generated robots output are still aligned:

```bash
bun run validate:robots:policy
```

- Reconfirm `docs/guides/AI_CRAWLER_POLICY.md` assumptions (discovery goals vs training opt-out stance) still match current growth priorities.
- Confirm required checks in rulesets still match actual workflows.
- Confirm GitHub default code scanning is still configured for `CodeQL` and still matches the `main` ruleset requirement.
- Confirm `docs/evidence/ci-usage-budget.md` shows page coverage details (`Pages fetched`, `API page size`, `Oldest fetched run updated_at`) and did not silently truncate inside the 30-day window.
- If governance-sensitive files changed, confirm `Monthly Governance Audit` ran on the shorter review-loop path (PR to `main`) and, after merge, on the corresponding `push` to `main`.
- Review dependency automation and pending upgrades.
- Review CI runtime/storage trends and tune workflow behavior where needed.
- If the monthly total stays above the review threshold, inspect the largest workflows first (`Lighthouse Budget`, `Web Quality`, and other high-frequency PR checks) before raising the cap again.
- Record latest successful governance run URL/ID when closing governance backlog work.

## Troubleshooting

GitHub API issues during audits
- Symptom: governance audit scripts fail due to API connectivity.
- Action:

```bash
gh run list --workflow "Monthly Governance Audit" --limit 1 --repo jarrydaubert/prosepal-web
```

- If latest `main` run is successful, use that run as authoritative and rerun local checks later.

Stale local evidence files
- Symptom: evidence files show skip states or old timestamps after transient failures.
- Action: rerun release/validation commands, then commit refreshed evidence.

Stale local Git index lock
- Symptom: local `git add`, `git commit`, or `git rebase --continue` fails with `.git/index.lock`.
- Action:
  - Verify no other `git` process or editor prompt is still active.
  - If no live `git` process is holding the repo, remove the stale `.git/index.lock` file and rerun the command.
  - Avoid overlapping local mutating `git` commands; run `git add`, `git commit`, and `git rebase --continue` sequentially.
  - If local signing or editor hooks are hanging, rerun explicitly with the intended editor/signing settings rather than starting a second `git` command in parallel.

Governance token expiry or permission failure
- Symptom: monthly governance workflow fails token checks or GitHub API access.
- Action:
  - Rotate `GH_ADMIN_TOKEN` with the required repo permissions.
  - Update `GH_ADMIN_TOKEN_EXPIRES_ON`.
  - Rerun `Monthly Governance Audit` and record the successful run URL/ID.

Production rollback
- Symptom: production regression after deploy.
- Action:
  - Roll back/promote last known good deployment in Vercel.
  - Re-verify headers/canonical behavior immediately:

```bash
curl -sS -I https://www.prosepal.app | rg -i "strict-transport-security|permissions-policy|content-security-policy|location"
curl -sS -I https://prosepal.app | rg -i "strict-transport-security|permissions-policy|location"
```

- Escalate to apex-domain owner/Cloudflare admin if redirect-layer headers differ from expected policy.
