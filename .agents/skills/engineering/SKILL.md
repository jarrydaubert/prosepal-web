---
name: engineering
version: 1.1.0
description: Use for engineering reviews, implementation guidance, dependency-upgrade fallout, performance work, script maintenance, generated artifact contracts, static-site reliability, and runtime safety in prosepal-web.
---

# Engineering

Use this skill for broad engineering reviews and implementation guidance. Discover the installed stack from the repo, apply durable web practices, and optimize for shipped correctness first, then performance, then maintainability.

## Operating Rules

- Read `AGENTS.md` first.
- Treat `public/`, `scripts/`, `.agents/skills/`, and docs as product surfaces when they affect SEO, analytics, or contributor workflows.
- Do not present runtime claims as facts unless you ran the relevant command.
- Prefer repo-specific evidence over generic framework advice.
- Keep docs evergreen; open work belongs in `docs/BACKLOG_WEB.md`.

## Stack Discovery

Before version-sensitive work:

- Read `package.json` for scripts, dependencies, and Bun expectations.
- Inspect the target script or public asset before changing behavior.
- Check generated files and their source generator together.
- Treat `AGENTS.md`, `docs/guides/OPS_RUNBOOK.md`, and `docs/BACKLOG_WEB.md` as workflow contracts.

## Prosepal Web Defaults

- Static marketing site with HTML/CSS/JS and generated SEO artifacts.
- Shared CSS tokens are the design source of truth.
- Browser JS should be progressive enhancement and keep no-JS content visible.
- Deterministic generators are preferred for sitemap, robots, llms, schema, and evidence docs.
- Bun is the package/script runner.

## Review Workflow

1. Confirm the actual files and scripts involved.
2. Separate verified findings from inferred risks.
3. Prefer a short list of concrete changes over broad modernization advice.
4. Implement the smallest safe patch.
5. Run the relevant gate.

## Validation

Baseline for code, workflow, or generated-artifact changes:

```bash
bun run check
```

For skills maintenance:

```bash
bun run skills:review
bun run skills:check
```

For dependency changes:

```bash
bun install --frozen-lockfile
bun audit
```

## Key Files

- `AGENTS.md`
- `package.json`
- `public/index.html`
- `public/css/tokens.css`
- `public/js/home-enhancements.js`
- `scripts/`
- `docs/guides/OPS_RUNBOOK.md`
- `docs/BACKLOG_WEB.md`
- `.agents/skills/prosepal-web-context/SKILL.md`
