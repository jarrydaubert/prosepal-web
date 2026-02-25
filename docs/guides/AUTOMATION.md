# Automation Guide

Last updated: 2026-02-25.

This guide defines what is already automated for `prosepal-web`, what remains manual, and what "fully passing" looks like before release.

## Fully Automated Today

## 1) Local quality gate (`bun run check`)

Runs in a single command:

1. SEO artifact generation (`messages`, `sitemap.xml`, `robots.txt`, `llms.txt`)
2. Linting (Biome)
3. Metadata tests
4. SEO artifact integrity tests
5. Static HTML validation (links/meta/inline-code/sitemap coverage)
6. Style drift audit thresholds

## 2) CI gate on GitHub Actions

Workflow: `.github/workflows/seo-quality.yml`

Automated behavior:

1. Path-filtered execution (runs only when relevant files change)
2. Concurrency cancellation for superseded runs
3. Full `bun run check` gate
4. Fails if generated artifacts are out of sync with committed files

## 3) Security scanning

1. CodeQL scanning
2. Code scanning requirement on protected `main`
3. Secret scanning and push protection (repository/account policy)

## 4) Dependency automation

Dependabot handles:

1. npm dependencies
2. GitHub Actions dependencies

## 5) Branch governance

Protected `main` enforces:

1. PR-based merges
2. Required checks
3. No force-push
4. No deletion
5. Linear history

## Manual Steps Still Required

1. Social preview validator checks (`WEB-P0-1`)
2. Rich Results/schema spot-check in release QA (`WEB-P0-2`)
3. Lighthouse budget run until fully automated (`WEB-P1-2`)
4. Release tagging + GitHub Release notes (`WEB-P0-3`)

## Standard Release Sequence

1. Open PR and pass required checks.
2. Merge to `main`.
3. Run release QA manual checks from backlog.
4. Tag and publish release notes.
5. Deploy using approved production path.
