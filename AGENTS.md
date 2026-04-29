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

## Definition of ready

- Problem or opportunity is explicit enough to review.
- Scope is narrow enough for one reviewable change.
- Primary files/systems and verification path are known.
- External blockers or approvals are resolved or clearly called out.

## Definition of done

- Behavior meets acceptance criteria.
- Relevant checks pass, or any unrun checks are explicitly called out with reason.
- Regenerated artifacts are current when generators are affected.
- Documentation and backlog stay consistent with the change.

## Canonical docs

- `CLAUDE.md`: minimal pointer.
- `docs/guides/OPS_RUNBOOK.md`: DevOps and release operations source of truth.
- `docs/BACKLOG_WEB.md`: TODO-only backlog with explicit Definitions of Ready and Done.
- `docs/guides/SKILLS_AND_COMMANDS.md`: installed commands and agents-native skills guide.
- `docs/guides/MARKETING_SKILLS_RUNBOOK.md`: skills sync, validation, review, and upgrade workflow.

## Skills and command sync

- Skills source: `https://github.com/coreyhaines31/marketingskills` (pinned `v1.9.0`).
- Local skills path: `.agents/skills/`.
- Shared product context: `.agents/product-marketing-context.md`.
- Shared project constraints: `.agents/skills/prosepal-web-context/SKILL.md`.
- Canonical profiles:
  - `.agents/skills/.profiles/upstream-marketing-skills.txt`
  - `.agents/skills/.profiles/prosepal-web-keep.txt`
- Maintenance commands:

```bash
bun run skills:review
bun run skills:check
bun run skills:sync
```

- Upgrade preview for a new tag:

```bash
scripts/sync-marketing-skills.sh --check --tag vX.Y.Z --commit <full_commit_sha>
```

- Project slash commands are in `.claude/commands/`.

## Skills reference

Skills are agents-native in Prosepal:
- upstream marketing skills stay close to upstream
- Prosepal-specific rules stay centralized in `prosepal-web-context`
- usage dates live in `.agents/skills/RUN_HISTORY.md`
- source and inclusion policy live in `.agents/skills/VERSIONS.md`

Core local skills:
- `prosepal-web-context` — Prosepal web UX, CRO, SEO, analytics, and style constraints.
- `engineering` — static-site engineering, scripts, generated artifacts, dependencies, and performance.
- `frontend-design` — polished, non-generic UI direction and implementation.
- `accessibility` — WCAG 2.2 AA audits and remediation.
- `codebase-cleanup-sweep` — broad repo cleanup and housekeeping.
- `design-an-interface` — compare module/script/interface options before implementation.
- `prd-to-issues` — break plans into vertical, reviewable slices.
- `tdd` — red/green/refactor workflow for regression-safe changes.
