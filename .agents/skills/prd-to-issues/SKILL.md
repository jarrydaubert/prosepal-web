---
name: prd-to-issues
description: "When the user wants to break a PRD into execution-ready work items. Also use when converting feature plans into vertical slices with dependencies, acceptance criteria, and testing requirements."
metadata:
  version: 1.0.0
  source: mattpocock/skills@8e51ff7 (adapted for prosepal-web)
---

# PRD To Issues

Convert a PRD into thin, independently shippable vertical slices.

## Workflow

1. Read the PRD end-to-end and capture user stories, constraints, success criteria, and out-of-scope work.
2. Map layers touched: content, static HTML, CSS, JS enhancement, generators, analytics, SEO artifacts, docs, and tests.
3. Split into vertical slices that leave the site in a working state.
4. Define dependencies and acceptance criteria with observable behavior.
5. Add or update backlog entries only where the repo tracks open work.

## Prosepal Web Context

- Default open-work tracker is `docs/BACKLOG_WEB.md`.
- Prefer one reviewable change at a time.
- Avoid horizontal tickets like "CSS only" unless explicitly requested.
- Acceptance criteria should include the relevant validation command, usually `bun run check`.
- Update docs/runbooks when workflow or maintenance contracts change.

## Output

For each issue/slice, include title, scope, blockers, acceptance criteria, validation, and whether it is ready now or blocked.
