# Ops Runbook (Single Source of Truth)

Scope: lightweight DevOps and release operations for `prosepal-web` (static marketing site).

## 1) Operational Baseline

1. Default branch: `main` (protected).
2. Merge model: PR-only.
3. Required checks: `SEO + QA Gate`, `CodeQL`.
4. Hosting: Vercel origin + Cloudflare edge.
5. Primary local gate: `bun run check`.
6. SEO artifact date source: `PROSEPAL_CONTENT_DATE` (defaults to `2026-02-25`) for deterministic generated outputs.
7. CI budget targets (30-day window):
   - total workflow runtime <= `180m`
   - `Web Quality` average runtime <= `3m`
   - `CodeQL` average runtime <= `8m`

## 2) Daily Developer Flow

1. Branch from `main`.
2. Make changes.
3. Run:

```bash
bun run check
```

4. Open PR.
5. Merge only when required checks are green.

## 3) Deployment Flow

1. Confirm quality gate passes.
2. Verify correct Vercel project link:

```bash
bun run vercel:check-link
```

3. Production policy:
   - default: Git-based release flow (merge to `main`)
   - local CLI production deploy is blocked unless owner emergency override is explicit:

```bash
ALLOW_PROD_CLI_DEPLOY=1 bun run deploy:prod
```

4. Canonical route policy:
   - legal/support canonical pages remain `.html` paths
   - clean aliases must redirect permanently:
     - `/privacy` -> `/privacy.html`
     - `/terms` -> `/terms.html`
     - `/support` -> `/support.html`

## 4) CI/CD Controls

1. Web quality workflow runs `bun run check`.
2. CodeQL scanning is required on `main`.
3. Lighthouse budget workflow (`Lighthouse Budget`) runs on `main` changes and manual dispatch.
4. Actions policy:
   - selected actions only
   - SHA pinning required
   - read-only default `GITHUB_TOKEN`
   - external contributor workflow approval enabled
5. Dependabot updates:
   - npm weekly
   - GitHub Actions weekly
6. Style audit guardrails:
   - `audit:styles:strict` is part of `bun run check`
   - current `hardcoded-color-rgba` threshold is `<=120`
7. Monthly governance workflow (`Monthly Governance Audit`) runs:
   - GitHub policy drift audit (`bun run audit:github:policy`)
   - CI usage budget audit (`bun run audit:ci:usage`)

## 5) Security Controls

1. Secret scanning enabled.
2. Push protection enabled.
3. Private vulnerability reporting enabled.
4. Security reporting policy in root `SECURITY.md`.
5. Proprietary license in root `LICENSE`.

## 6) Release Checklist

1. `bun run check` passes.
2. Required PR checks pass on GitHub.
3. Accessibility baseline gate passes:

```bash
bun run validate:a11y:baseline
```

4. Production preview metadata checks pass:

```bash
bun run release:qa
```

Evidence files are written to:

1. `docs/evidence/social-preview-validation.md`
2. `docs/evidence/schema-spotcheck.md`
3. `docs/evidence/canonical-route-validation.md`
4. `docs/evidence/accessibility-regression.md`

Schema validation runs against local generated HTML scope (homepage, hubs, blog articles, and message detail pages).

5. Lighthouse budget workflow is green for current `main`:

```bash
gh run list --workflow "Lighthouse Budget" --limit 1 --repo jarrydaubert/prosepal-web
```

6. Prepare release notes:

```bash
bun run release:prepare -- vX.Y.Z
```

7. Create and push semantic tag:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Release note files live in `docs/releases/` (for example `docs/releases/v1.0.0.md`).

8. Conversion event smoke check on preview:
   - verify custom events fire for:
     - `app_store_click`
     - `waitlist_submit_success`
     - `demo_chip_click`

## 7) Monthly Ops Review

1. Run governance audits:

```bash
bun run audit:github:policy
bun run audit:ci:usage
```

2. Confirm required check names still match actual CI contexts.
3. Verify Actions allowlist and token restrictions.
4. Review Dependabot backlog and merge/update policy.
5. Review CI runtime/storage usage and adjust thresholds/retention.
6. Verify style-audit thresholds are still calibrated (no blind spots, no noisy false positives).
