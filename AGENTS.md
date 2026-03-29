# AGENTS.md

## Purpose

Operating guide for contributors and coding agents in `prosepal-web`.

## Project snapshot

- Static marketing site (HTML/CSS/JS) with generated SEO artifacts.
- Hosted on Vercel behind Cloudflare.
- Public GitHub repo with enforced CI checks.

## Operating principles

- Prefer deterministic automation over manual "spot checks".
- Keep docs aligned with code so external contributors can trust what they read.
- Optimize for safe, reviewable changes: PR flow, clear gates, reproducible commands.
- Treat content, SEO, and analytics correctness as first-class product behavior.

## Verification

- Do not present guesses as facts.
- Verify files, commands, and behavior before claiming they exist or passed.
- If something is uncertain or unverified, say so clearly.

## Non-negotiables

- Run `bun run check` before merge or production deploy.
- Run `bun run vercel:check-link` before any `vercel` deploy command.
- Default production path is merge-to-main; local production CLI deploy is emergency-only:

```bash
ALLOW_PROD_CLI_DEPLOY=1 bun run deploy:prod
```

- If linked to the wrong Vercel project, relink first:

```bash
vercel link --project prosepal-web
```

## Standard workflow

- Branch from `main`.
- Implement change using existing patterns in `public/`, `scripts/`, and design tokens.
- Run relevant checks, then the full gate:

```bash
bun run check
```

- Update docs/backlog when standards, scope, or open TODO items change.
- Report files changed, commands run, and pass/fail outcomes.

## Definition of done

- Behavior meets acceptance criteria.
- Relevant checks pass, or any unrun checks are explicitly called out with reason.
- Regenerated artifacts are current when generators are affected.
- Documentation and backlog stay consistent with the change.

## Canonical docs

- `CLAUDE.md`: minimal pointer.
- `docs/guides/OPS_RUNBOOK.md`: DevOps and release operations source of truth.
- `docs/BACKLOG_WEB.md`: TODO-only backlog with explicit Definition of Done.
- `docs/guides/MARKETING_SKILLS_RUNBOOK.md`: skills sync, validation, and upgrade workflow.

## Skills and command sync

- Skills source: `https://github.com/coreyhaines31/marketingskills` (pinned `v1.5.0`).
- Local skills path: `.agents/skills/`.
- Refresh commands:

```bash
scripts/sync-marketing-skills.sh --check
scripts/sync-marketing-skills.sh --sync
scripts/apply-marketing-skill-profile.sh --apply
scripts/validate-marketing-skills-setup.sh
```

- Upgrade preview for a new tag:

```bash
scripts/sync-marketing-skills.sh --check --tag vX.Y.Z --commit <full_commit_sha>
```

- Project slash commands are in `.claude/commands/`.
