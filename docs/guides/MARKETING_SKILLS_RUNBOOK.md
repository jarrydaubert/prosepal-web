# Marketing Skills Runbook

## Purpose

Operational guide for maintaining the agents-native skills setup in `prosepal-web`.

## Current Standard

1. Source repo: `https://github.com/coreyhaines31/marketingskills`
2. Install path: `.agents/skills/`
3. Product context path: `.agents/product-marketing-context.md`
4. Project constraints skill: `.agents/skills/prosepal-web-context/SKILL.md`
5. Pinned tag: set in `scripts/sync-marketing-skills.sh` (`UPSTREAM_REF`)
6. Canonical profiles:
   - `.agents/skills/.profiles/upstream-marketing-skills.txt`
   - `.agents/skills/.profiles/prosepal-web-keep.txt`
7. Canonical trackers:
   - `.agents/skills/VERSIONS.md` for upstream provenance and inclusion policy
   - `.agents/skills/RUN_HISTORY.md` for installed-skill source, last-run history, and short purpose notes

## Layering Model

- Upstream methodology lives in `.agents/skills/*/SKILL.md`.
- Shared product context lives in `.agents/product-marketing-context.md`.
- Shared repo/project constraints live in `.agents/skills/prosepal-web-context/SKILL.md`.
- Upstream skills should stay close to upstream; Prosepal-specific behavior is centralized instead of duplicated in every synced skill.
- We do not maintain duplicate "vanilla + custom" skill files side-by-side.

## Maintenance Commands

```bash
bun run skills:review
bun run skills:check
bun run skills:sync
```

`skills:review` checks the latest upstream tag and reports new skills, changed installed skills, changed excluded skills, and upstream changelog entries.

`skills:check` compares the local pin with the configured upstream ref and validates the installed setup.

`skills:sync` syncs the pinned upstream profile, applies the local keep profile, and validates the result.

## Repo-Fit Upgrade Gate

Before changing the pin, review whether new upstream skills improve the actual `prosepal-web` working surface:

1. Prefer additions that support the live site, App Store acquisition path, CRO, content/SEO, analytics, lifecycle messaging, mobile growth, or repo operations.
2. Avoid growing the trigger surface with channels or motions that are not useful to Prosepal.
3. Treat App Store, mobile-growth, community, visual asset, and video additions as in-scope when they support the consumer app funnel.
4. Do not update the default pin until the review output, local preview check, installed-skill set, and docs agree.

## Future Version Upgrade Workflow

1. Review the latest upstream state:

```bash
bun run skills:review
```

2. Preview a specific tag if needed:

```bash
scripts/sync-marketing-skills.sh --check --tag vX.Y.Z --commit <full_commit_sha>
```

3. If accepted, update the default pin in `scripts/sync-marketing-skills.sh`, then run:

```bash
bun run skills:sync
```

4. Verify final state:
   - `.agents/skills/.sources/marketingskills.json` contains the new ref/commit.
   - `.agents/skills/VERSIONS.md` contains the same ref/commit.
   - `.agents/skills/RUN_HISTORY.md` matches the installed skill set.
   - `scripts/validate-marketing-skills-setup.sh` passes.

## Local Customizations That Must Persist

These are enforced during `scripts/sync-marketing-skills.sh --sync` and validation:

1. Remove legacy `.claude` fallback wording inside skill docs.
2. Ensure upstream skills that read `.agents/product-marketing-context.md` also load `.agents/skills/prosepal-web-context/SKILL.md`.
3. Keep `product-marketing-context` instructions aligned to `.agents`-only usage.
4. Preserve local workflow skills listed in `.agents/skills/.profiles/prosepal-web-keep.txt`.
5. Regenerate `.agents/skills/VERSIONS.md` from the actual synced/install state.

## Manual Sync Commands

```bash
scripts/sync-marketing-skills.sh --sync
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```
