# Ops Runbook (Single Source of Truth)

Scope: lightweight DevOps and release operations for `prosepal-web` (static marketing site).

## 1) Operational Baseline

1. Default branch: `main` (protected).
2. Merge model: PR-only.
3. Required checks: `SEO + QA Gate`, `CodeQL`.
4. Hosting: Vercel origin + Cloudflare edge.
5. Primary local gate: `bun run check`.

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

3. Use approved production deployment path (defined by `WEB-P0-4` backlog item).

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

## 5) Security Controls

1. Secret scanning enabled.
2. Push protection enabled.
3. Private vulnerability reporting enabled.
4. Security reporting policy in root `SECURITY.md`.
5. Proprietary license in root `LICENSE`.

## 6) Release Checklist

1. `bun run check` passes.
2. Required PR checks pass on GitHub.
3. Schema/social/Lighthouse checks are completed when required by backlog.
4. Release tag + release notes are published (once `WEB-P0-3` is complete).

## 7) Monthly Ops Review

1. Confirm required check names still match actual CI contexts.
2. Verify Actions allowlist and token restrictions.
3. Review Dependabot backlog and merge/update policy.
4. Review CI runtime/storage usage and adjust thresholds/retention.
