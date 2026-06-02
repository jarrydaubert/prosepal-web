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
- AI-assisted code is allowed; unverified AI-assisted code is not.
- The GitHub Actions estate is intentionally small: `CI` plus `CodeQL`.
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

`CI`
- Required on PRs and pushes to `main`.
- Installs from `bun.lock` with `bun install --frozen-lockfile`.
- Blocks tracked `.env`, `.env.local`, and `.env.production` files.
- Runs the full local contract (`bun run check`), including generated SEO artifacts, lint, metadata tests, validators, accessibility/CSP/event checks, interaction tests, and strict style audit.
- Runs `bun run build`.
- Fails if generated message pages or SEO artifacts are not committed.

`CodeQL`
- Required on PRs and pushes to `main`.
- Runs from `.github/workflows/codeql.yml`.
- Scans JavaScript/TypeScript and Python with GitHub CodeQL.
- Backs the repository code-scanning requirement.

`Dependabot`
- Configured in `.github/dependabot.yml`.
- Opens weekly grouped PRs for Bun package updates and GitHub Actions updates.

Repository settings, not YAML:
- Secret scanning enabled.
- Push protection enabled.
- Private vulnerability reporting enabled.
- Branch protection/ruleset requires `CI` and `CodeQL`.

Retired from default PR blocking:
- Visual regression snapshots. Run `bun run test:visual` locally when making deliberate visual changes.
- Lighthouse budgets. Use as a diagnostic when performance work needs it, not as a merge blocker.
- Governance audits. Run `bun run audit:github:policy`, `bun run audit:ci:usage`, or `bun run audit:governance:token` manually when repository policy changes.
- Flake audits. Re-run the focused failing Playwright command manually when investigating a known flaky test.
- Release automation. Releases are handled through normal PR merge and Vercel deployment unless versioned release notes are intentionally prepared.

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

- Optional visual snapshot pass when UI changed deliberately:

```bash
bun run test:visual
```

- If an experiment is active, complete experiment governance checks before decisioning:
  - `Assignment consistency`: same user remains in the same variant across reload/session.
  - `Exposure integrity`: each assigned user emits one `experiment_exposure` event per session with matching `experiment_id` and `variant_id`.
  - `Anti-peeking policy`: do not declare winners before the pre-defined minimum sample size and decision window.

Evidence expectations:
- Validation scripts write/update evidence in `docs/evidence/`.
- For CI controls, use the successful `CI` and `CodeQL` runs on the PR or `main` as authoritative evidence.

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
- `.env.example` documents configuration shape without secrets.
- Real production configuration lives in Vercel/GitHub provider settings, not committed files.
- Optional GitHub governance audits are local/manual and never run repository secrets against untrusted PR code.

Why this matters:
- Public repos need defensive defaults; these controls reduce accidental secret exposure and policy drift risk.

## Operations review

- Run governance audits manually when repository settings, Actions policy, or branch protection changes:

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
- Confirm required checks in rulesets still match actual workflows: `CI` and `CodeQL`.
- Confirm secret scanning, push protection, private vulnerability reporting, and Dependabot remain enabled.
- Confirm `docs/evidence/ci-usage-budget.md`, if regenerated, shows page coverage details (`Pages fetched`, `API page size`, `Oldest fetched run updated_at`) and did not silently truncate inside the 30-day window.
- Review dependency automation and pending upgrades.
- Review CI runtime/storage trends and tune workflow behavior where needed.

## Troubleshooting

GitHub API issues during manual audits
- Symptom: governance audit scripts fail due to API connectivity.
- Action:

```bash
gh run list --workflow "CI" --limit 1 --repo jarrydaubert/prosepal-web
```

- If latest `main` `CI` and `CodeQL` runs are successful, use those runs as authoritative and rerun local audits later.

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
  - Rerun the relevant manual audit command and record the result in closing notes.

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
