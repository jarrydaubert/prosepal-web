# Ops Runbook (Single Source of Truth)

Scope: lightweight DevOps and release operations for `prosepal-web` (static marketing site).

## 1) Operational Baseline

1. Default branch: `main` (protected).
2. Merge model: PR-only.
3. Required checks: `SEO + QA Gate`, `CodeQL`.
4. Hosting: Vercel origin + Cloudflare edge.
5. Primary local gate: `bun run check`.
6. SEO artifact date source: `PROSEPAL_CONTENT_DATE` (defaults to `2026-02-25`) for deterministic generated outputs.

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
3. Actions policy:
   - selected actions only
   - SHA pinning required
   - read-only default `GITHUB_TOKEN`
   - external contributor workflow approval enabled
4. Dependabot updates:
   - npm weekly
   - GitHub Actions weekly
5. Style audit guardrails:
   - `audit:styles:strict` is part of `bun run check`
   - current `hardcoded-color-rgba` threshold is `<=120`

## 5) Security Controls

1. Secret scanning enabled.
2. Push protection enabled.
3. Private vulnerability reporting enabled.
4. Security reporting policy in root `SECURITY.md`.
5. Proprietary license in root `LICENSE`.

## 6) Release Checklist

1. `bun run check` passes.
2. Required PR checks pass on GitHub.
3. Production preview metadata checks pass:

```bash
bun run release:qa
```

Evidence files are written to:

1. `docs/evidence/social-preview-validation.md`
2. `docs/evidence/schema-spotcheck.md`
3. `docs/evidence/canonical-route-validation.md`

Schema validation runs against local generated HTML scope (homepage, hubs, blog articles, and message detail pages).

4. Prepare release notes:

```bash
bun run release:prepare -- vX.Y.Z
```

5. Create and push semantic tag:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Release note files live in `docs/releases/` (for example `docs/releases/v1.0.0.md`).

6. Conversion event smoke check on preview:
   - verify custom events fire for:
     - `app_store_click`
     - `waitlist_submit_success`
     - `demo_chip_click`

## 7) Monthly Ops Review

1. Confirm required check names still match actual CI contexts.
2. Verify Actions allowlist and token restrictions.
3. Review Dependabot backlog and merge/update policy.
4. Review CI runtime/storage usage and adjust thresholds/retention.
5. Verify style-audit thresholds are still calibrated (no blind spots, no noisy false positives).
