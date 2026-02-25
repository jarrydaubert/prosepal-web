# AGENTS.md

## Purpose

Lightweight operating guide for contributors and coding agents in `prosepal-web`.

## Project snapshot

1. Static marketing site (HTML/CSS/JS) with generated SEO artifacts.
2. Hosted on Vercel behind Cloudflare.
3. Public GitHub repo with required CI checks.

## Non-negotiables

1. Run `bun run check` before merge or production deploy.
2. Always run `bun run vercel:check-link` before `vercel` deploy commands.
3. Default production path is merge-to-main; local production CLI deploy is emergency-only:

```bash
ALLOW_PROD_CLI_DEPLOY=1 bun run deploy:prod
```

4. If linked to the wrong Vercel project, relink first:

```bash
vercel link --project prosepal-web
```

## Standard workflow

1. Branch from `main`.
2. Implement change using existing patterns in `public/`, `scripts/`, and tokens.
3. Run relevant checks, then full gate:

```bash
bun run check
```

4. Update docs/backlog when standards, scope, or open TODO items change.
5. Report files changed, commands run, and pass/fail outcomes.

## Definition of done

1. Behavior meets acceptance criteria.
2. Relevant checks pass (or any unrun checks are explicitly stated with reason).
3. Regenerated artifacts are up to date when generators are affected.
4. Documentation and backlog remain consistent with the change.

## Canonical docs

1. `CLAUDE.md`: minimal pointer to this file.
2. `docs/guides/OPS_RUNBOOK.md`: DevOps and release operations source of truth.
3. `docs/BACKLOG_WEB.md`: TODO-only backlog, each item with explicit Definition of Done.
4. `docs/WEB_REDESIGN_EXECUTION.md`: implementation standards and redesign decisions.

## Skills and command sync

1. Skills source: `https://github.com/coreyhaines31/marketingskills` (pinned `v1.2.0`).
2. Local skills path: `.claude/skills/`.
3. Refresh commands:

```bash
scripts/sync-marketing-skills.sh --check
scripts/sync-marketing-skills.sh --sync
scripts/apply-marketing-skill-profile.sh --apply
```

4. Project slash commands are in `.claude/commands/`.
