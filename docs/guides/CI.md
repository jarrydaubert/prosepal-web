# CI Guide

Last updated: 2026-02-25.

Repository: public GitHub (`jarrydaubert/prosepal-web`).

## Workflow

GitHub Actions workflow:

- `.github/workflows/seo-quality.yml`

It runs the project gate:

```bash
bun run check
```

And fails if generated SEO artifacts drift from committed files.

## Free-Tier Optimization Choices

Current workflow is tuned for low-cost usage:

1. Path-scoped triggers (runs only when relevant files change).
2. Concurrency cancellation for superseded runs.
3. Single job gate (`bun run check`) instead of multi-job duplication.
4. Tight timeout (`12` minutes).
5. Read-only minimal permissions (`contents: read`).

## Dependency Automation

Dependabot config:

- `.github/dependabot.yml`

Schedules:

1. `npm` weekly.
2. `github-actions` weekly.
