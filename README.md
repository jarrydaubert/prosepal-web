# prosepal-web

Marketing website for [Prosepal](https://prosepal.com) — a live iOS app. Static HTML/CSS/JS site with script-based page generation, Biome for linting, Playwright for quality checks, and a CI gate that runs on every PR.

## What this repo contains

- Static site and page templates in `public/`
- Programmatic SEO and message page generators in `scripts/`
- Source content and structured data in `data/` and `templates/`

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

Run the full quality gate (required before every merge):

```bash
bun run check
```

`check` covers: page generation, Biome linting, metadata tests, SEO artifact validation, broken link checks, and style audit thresholds. All checks must pass — no warnings-as-noise.

Release QA spot-checks against production metadata and schema:

```bash
bun run release:qa
```

Prepare semantic release notes:

```bash
bun run release:prepare -- vX.Y.Z
```

## Contribution flow

1. Branch from `main`.
2. Open a pull request.
3. All required checks must pass before merge.
4. No direct commits to `main`.

## Project docs

- `AGENTS.md` - Operating doctrine and quality workflow
- `docs/guides/OPS_RUNBOOK.md` - Ops and DevOps process (single source of truth)
- `docs/README.md` - Docs index
- `docs/WEB_REDESIGN_EXECUTION.md` - Implementation standards and definition of done
- `docs/BACKLOG_WEB.md` - Active backlog and release QA checklist
- `SECURITY.md` - Security reporting policy
- `LICENSE` - Proprietary (`All rights reserved`)
