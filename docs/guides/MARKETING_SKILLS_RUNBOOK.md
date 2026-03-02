# Marketing Skills Runbook

## Purpose

Operational guide for maintaining the local marketing skills setup in `prosepal-web`.

## Current Standard

1. Source repo: `https://github.com/coreyhaines31/marketingskills`
2. Install path: `.agents/skills/`
3. Product context path: `.agents/product-marketing-context.md`
4. Pinned tag: set in `scripts/sync-marketing-skills.sh` (`UPSTREAM_REF`)

## Normal Maintenance

```bash
scripts/sync-marketing-skills.sh --check
scripts/sync-marketing-skills.sh --sync
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

## Future Version Upgrade Workflow

1. Preview the new release without changing the pin:

```bash
scripts/sync-marketing-skills.sh --check --tag vX.Y.Z --commit <full_commit_sha>
```

2. If acceptable, sync directly to that tag:

```bash
scripts/sync-marketing-skills.sh --sync --tag vX.Y.Z --commit <full_commit_sha>
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

3. If this should become the new default pin, update `UPSTREAM_REF` in:
   - `scripts/sync-marketing-skills.sh`
   - `AGENTS.md` (Skills source pin text)

4. Verify final state:
   - `.agents/skills/.sources/marketingskills.json` contains the new ref/commit.
   - `.agents/skills/VERSIONS.md` contains the same ref/commit.
   - `scripts/validate-marketing-skills-setup.sh` passes.

## Local Customizations That Must Persist

These are enforced automatically during `scripts/sync-marketing-skills.sh --sync`:

1. Remove legacy `.claude` fallback wording inside skill docs.
2. Ensure skills that read `.agents/product-marketing-context.md` also load `.agents/skills/prosepal-web-context/SKILL.md`.
3. Keep `product-marketing-context` instructions aligned to `.agents`-only usage.
4. Preserve local custom skill `prosepal-web-context` (excluded from rsync delete path).
5. Regenerate `.agents/skills/VERSIONS.md` from the actual synced/install state.

## Fast Health Check

```bash
bun run skills:check
```

## One-Command Refresh

```bash
bun run skills:sync
```
