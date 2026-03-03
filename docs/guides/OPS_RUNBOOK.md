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
- Hosting path is Vercel origin behind Cloudflare edge.
- Primary local quality gate is `bun run check`.
- SEO generation date source is `PROSEPAL_CONTENT_DATE`.
  Use it when deterministic generator output is needed for review or release prep.

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
- Uploads diagnostics artifacts on failure to speed triage.

`Visual Regression`
- Detects unintended UI drift via snapshots.
- Protects design consistency during content and CSS iteration.

`Lighthouse Budget`
- Guards user-facing quality trends in performance, accessibility, and SEO.
- Keeps quality drift visible over time.

`CodeQL`
- Performs security-oriented static analysis on supported languages in the repo.

`Monthly Governance Audit`
- Audits policy drift, governance token health, and CI usage patterns.
- Prevents silent process erosion and expired-credential surprises.

`Release Automation`
- Handles release PR/version/tag/release-note flow.
- Reduces manual release steps and metadata drift.

`Interaction Flake Audit`
- Re-runs critical browser smoke flows repeatedly.
- Detects non-deterministic behavior before it reaches users.

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

Evidence expectations:
- Validation scripts write/update evidence in `docs/evidence/`.
- For governance controls, use the successful GitHub Actions run on `main` as authoritative evidence.

## Security and governance controls

- Secret scanning enabled.
- Push protection enabled.
- Private vulnerability reporting enabled.
- Security disclosure flow documented in `SECURITY.md`.
- Monthly governance audit maintained and monitored.

Why this matters:
- Public repos need defensive defaults; these controls reduce accidental secret exposure and policy drift risk.

## Monthly operations review

- Run governance audits:

```bash
bun run audit:github:policy
bun run audit:governance:token
bun run audit:ci:usage
```

- Confirm required checks in rulesets still match actual workflows.
- Review dependency automation and pending upgrades.
- Review CI runtime/storage trends and tune workflow behavior where needed.
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
