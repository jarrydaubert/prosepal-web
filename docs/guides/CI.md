# CI Guide

Last updated: 2026-02-25.

Repository: public GitHub (`jarrydaubert/prosepal-web`).

## Workflow Inventory

Tracked in-repo workflow:

- `.github/workflows/seo-quality.yml`

Managed via GitHub default setup (dynamic workflow):

- `CodeQL` (security/code scanning)

The web quality workflow runs:

```bash
bun run check
```

And fails if generated SEO artifacts drift from committed files.

## Required Checks On `main`

1. `SEO + QA Gate`
2. `CodeQL`

Branch rules enforce both checks before merge.

## Free-Tier Optimization Choices

Current workflow is tuned for low-cost usage:

1. Path-scoped triggers (runs only when relevant files change).
2. Concurrency cancellation for superseded runs.
3. Single job gate (`bun run check`) instead of multi-job duplication.
4. Tight timeout (`12` minutes).
5. Read-only minimal permissions (`contents: read`).

## Actions Security Baseline

Current GitHub Actions policy is locked down to:

1. Selected actions mode.
2. GitHub-owned actions allowed.
3. Verified-creator actions allowed.
4. SHA pinning required.
5. Default `GITHUB_TOKEN` permission set to `read`.
6. Workflow PR approvals by GitHub Actions disabled.
7. Fork workflow approval policy set to `all_external_contributors`.

Action patterns are intentionally allowlisted in repository settings. Keep the list limited to the actions actually used by current workflows and update it whenever workflow dependencies change.

## Dependency Automation

Dependabot config:

- `.github/dependabot.yml`

Schedules:

1. `npm` weekly.
2. `github-actions` weekly.

## Monthly Governance Audit

At least once per month, verify:

1. Required checks in ruleset still match actual check names.
2. Actions permission mode and allowlist have not drifted.
3. Fork approval policy and token permissions remain restricted.
4. Dependabot PRs are being reviewed/merged regularly.
