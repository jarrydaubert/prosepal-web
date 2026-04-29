# Marketing Skills Runbook

## Purpose

Operational guide for maintaining the local marketing skills setup in `prosepal-web`.

## Current Standard

1. Source repo: `https://github.com/coreyhaines31/marketingskills`
2. Install path: `.agents/skills/`
3. Product context path: `.agents/product-marketing-context.md`
4. Pinned tag: set in `scripts/sync-marketing-skills.sh` (`UPSTREAM_REF`)
5. Canonical trackers:
   - `.agents/skills/VERSIONS.md` for upstream provenance and inclusion policy
   - `.agents/skills/RUN_HISTORY.md` for installed-skill source, last-run history, and short purpose notes

## Repo-Fit Upgrade Gate

Before changing the pin, review whether new upstream skills or tool docs improve the actual `prosepal-web` working surface:

1. Prefer additions that support the live site, App Store acquisition path, CRO, content/SEO, analytics, lifecycle messaging, or growth operations already present in this repo.
2. Avoid growing the trigger surface with skills for channels or motions we are not actively operating yet.
3. Treat App Store and mobile-growth additions as potentially in-scope for this project because the site already routes to the App Store.
4. Treat community-led growth or broad partner-ecosystem additions as opt-in unless there is active work in the repo that would benefit from them.
5. Do not update the default pin until the release notes, local preview check, and final installed-skill set all agree.

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

2. Review the upstream release notes and decide what is relevant to `prosepal-web` before syncing:
   - new skills
   - new tool integrations
   - skill behavior changes that could change trigger quality or local context usage

3. If acceptable, sync directly to that tag:

```bash
scripts/sync-marketing-skills.sh --sync --tag vX.Y.Z --commit <full_commit_sha>
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

4. If this should become the new default pin, update `UPSTREAM_REF` in:
   - `scripts/sync-marketing-skills.sh`
   - `AGENTS.md` (Skills source pin text)

5. Verify final state:
   - `.agents/skills/.sources/marketingskills.json` contains the new ref/commit.
   - `.agents/skills/VERSIONS.md` contains the same ref/commit.
   - `.agents/skills/RUN_HISTORY.md` still matches the installed skill set.
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
