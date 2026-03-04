# prosepal-web

Public marketing website repo for [Prosepal](https://www.prosepal.app).  
Stack: static HTML/CSS/JS, script-based generation, Bun runtime, Biome linting, Playwright testing.

## Why this repo is run this way

- We treat this as production software, not "just a static site".
- Content and SEO pages are generated, so regressions can break many pages at once.
- The repository is public, so the workflow and docs are designed to be understandable by external contributors and reviewers.
- We gate merges with automated checks to keep quality consistent and reduce manual QA drift.

## What lives here

- Site templates and pages: `public/`
- Generators and validators: `scripts/`
- Structured content/data inputs: `data/`, `templates/`
- Integration and visual tests: `tests/`

## Local development

```bash
bun install
bun run dev
```

Local server: `http://localhost:3000`

## Quality workflow

Fast pre-PR loop:

```bash
bun run check:fast
```

Full merge gate:

```bash
bun run check
```

Critical browser-smoke subset:

```bash
bun run test:interaction:smoke
```

Repeatability audit for interaction flake detection:

```bash
bun run test:interaction:flake-audit
```

Repeatability audit for visual regression stability:

```bash
bun run test:visual:flake-audit
```

Release QA against live metadata/schema:

```bash
bun run release:qa
```

Prepare release notes:

```bash
bun run release:prepare -- vX.Y.Z
```

## Contribution model

- Branch from `main`.
- Open a PR.
- Merge only after required checks are green.
- No direct pushes to `main`.

## Documentation map

- `AGENTS.md`: contributor and agent operating contract.
- `docs/guides/OPS_RUNBOOK.md`: DevOps and CI/CD source of truth.
- `docs/guides/MARKETING_SKILLS_RUNBOOK.md`: skills sync and maintenance flow.
- `docs/README.md`: documentation index.
- `docs/BACKLOG_WEB.md`: open backlog with explicit Definition of Done.
- `SECURITY.md`: vulnerability reporting policy.
- `LICENSE`: proprietary license.
