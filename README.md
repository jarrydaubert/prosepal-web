# prosepal-web

Public marketing website repo for [Prosepal](https://www.prosepal.app).  
Stack: static HTML/CSS/JS, script-based generation, Bun runtime, Biome linting, Playwright testing.

## Why this repo is run this way

- We treat this as production software, not "just a static site".
- Content and SEO pages are generated, so regressions can break many pages at once.
- The repository is public, so the workflow and docs are designed to be understandable by external contributors and reviewers.
- AI-assisted code is allowed. Unverified AI-assisted code is not.
- We use a small number of hard gates plus security defaults instead of a noisy workflow estate.

## What lives here

- Site templates and pages: `public/`
- Generators and validators: `scripts/`
- Structured content/data inputs: `data/`, `templates/`
- Integration and optional visual tests: `tests/`

## Local development

```bash
bun install
bun run dev
```

Local server: `http://localhost:3000`

## Quality And Security Workflow

Every PR is expected to pass:

- reproducible install from `bun.lock`
- lint/format checks through Biome
- static/typecheck contract
- generated SEO artifacts
- metadata, schema, accessibility, CSP, analytics, interaction, and style checks
- production build
- GitHub CodeQL security scanning

The required GitHub checks are:

- `CI`
- `CodeQL`

Dependabot monitors Bun dependencies and GitHub Actions in `.github/dependabot.yml`. Secret scanning and push protection are repository settings, not workflow YAML. Production secrets must stay in Vercel/GitHub provider settings and never in committed env files.

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
- Merge only after `CI` and `CodeQL` are green.
- No direct pushes to `main`.
- Use `.env.example` for configuration shape; do not commit real `.env` files.

## Documentation map

- `AGENTS.md`: contributor and agent operating contract.
- `docs/guides/OPS_RUNBOOK.md`: DevOps and CI/CD source of truth.
- `docs/guides/MARKETING_SKILLS_RUNBOOK.md`: skills sync and maintenance flow.
- `docs/README.md`: documentation index.
- `docs/BACKLOG_WEB.md`: open backlog with explicit Definition of Done.
- `SECURITY.md`: vulnerability reporting policy.
- `LICENSE`: proprietary license.
