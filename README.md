# prosepal-web

Public marketing website for Prosepal.

## What this repo contains

- Static site files in `public/`
- SEO/message page generators in `scripts/`
- Source content in `data/` and `templates/`

## Local development

```bash
bun install
bun run dev
```

Site runs at `http://localhost:3000`.

## Build and quality

Generate site artifacts:

```bash
bun run build
```

Run the full quality gate:

```bash
bun run check
```

`check` includes generation, linting, metadata tests, SEO artifact tests, validation, and style audit thresholds.

Release QA spot-checks (production metadata/schema):

```bash
bun run release:qa
```

Prepare semantic release notes:

```bash
bun run release:prepare -- vX.Y.Z
```

## Automation

Ops and DevOps process (single source):

- `docs/guides/OPS_RUNBOOK.md`

## Contribution flow

1. Create a branch from `main`.
2. Open a pull request.
3. Ensure required checks pass.
4. Merge via PR (no direct `main` edits).

## Project docs

- `AGENTS.md` - operating doctrine and quality workflow
- `docs/README.md` - docs index
- `docs/WEB_REDESIGN_EXECUTION.md` - implementation standards and definition of done
- `docs/BACKLOG_WEB.md` - active backlog and release QA checklist
- `SECURITY.md` - security reporting policy
- `LICENSE` - proprietary licensing terms (`All rights reserved`)
