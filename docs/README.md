# Prosepal Web Docs Index

This folder holds execution and quality docs for the web project.

## Core docs

1. `../README.md`
   - Public root overview (what the repo is, local run, contribution flow).
2. `../AGENTS.md`
   - Canonical operations guide, including skills source and sync process.
3. `WEB_REDESIGN_EXECUTION.md`
   - Source of truth for redesign scope, architecture decisions, and Definition of Done.
4. `BACKLOG_WEB.md`
   - SEO/UX backlog with release QA checklist and open items.
5. `guides/DEPLOYMENT.md`
   - Vercel deployment workflow and project-link safety checks.
6. `guides/CI.md`
   - GitHub Actions and Dependabot operating notes for the public repo.
7. `guides/AUTOMATION.md`
   - Current automation coverage, manual release steps, and release sequence.

## Working rule

1. Update `WEB_REDESIGN_EXECUTION.md` when standards, thresholds, or scope change.
2. Update `BACKLOG_WEB.md` when task status changes or release checklist items are revised.
3. Keep SEO artifact policy and tests aligned with generators (`scripts/generate-*` + `scripts/test-seo-artifacts.js`).
4. Keep deployment/CI docs aligned when workflow scripts, Vercel linkage checks, or GitHub workflow behavior changes.
