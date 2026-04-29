---
name: codebase-cleanup-sweep
description: "Use when the user wants a broad repo cleanup or quality pass: deduplicate code, remove verified unused files, check generated artifacts, clean stale docs, consolidate scripts, reduce weak CSS/JS patterns, and remove low-signal comments or AI slop."
metadata:
  version: 1.0.0
  source: local
---

# Codebase Cleanup Sweep

Run a conservative cleanup pass focused on reviewable improvements.

## Ground Rules

1. Read `AGENTS.md` first.
2. Preserve generated SEO artifacts unless you regenerate them through the repo scripts.
3. Do not delete files based on tool output alone; confirm references with `rg`.
4. Keep evergreen docs free of stale progress notes; open work belongs in `docs/BACKLOG_WEB.md`.
5. Do not revert unrelated user changes.

## Workstreams

Cover these explicitly when relevant:

1. Duplicate or obsolete scripts.
2. Unused CSS, JS, HTML, or docs.
3. Stale generated artifacts or evidence docs.
4. Weak style-system patterns such as hardcoded colors that should be tokens.
5. Legacy `.claude` or old skills-path references.
6. Dependency and lockfile hygiene.
7. Low-signal comments, TODOs, and stale breadcrumbs.

## Helpful Commands

```bash
git status --short --branch
rg -n "TODO|FIXME|XXX|HACK|deprecated|legacy|temporary|workaround" public scripts docs .agents
rg -n "\.claude/product-marketing-context\.md|\.claude/skills" .agents scripts docs AGENTS.md
bun run skills:check
bun run check
```

Use additional targeted commands only after reading the relevant local scripts.

## Validation

For repo-health changes, run:

```bash
bun run skills:check
bun run check
```

If a check cannot run, state that clearly and explain the remaining risk.

## Output

Return implemented changes, commands run, pass/fail results, and any follow-up that needs a separate decision.
