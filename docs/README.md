# Prosepal Web Docs Index

This folder holds execution and quality docs for the web project.

## Core docs

1. `../README.md`
   - Public root overview (what the repo is, local run, contribution flow).
2. `../AGENTS.md`
   - Canonical operations guide, including skills source and sync process.
3. `../SECURITY.md`
   - Security reporting process and private vulnerability channel.
4. `WEB_REDESIGN_EXECUTION.md`
   - Source of truth for redesign scope, architecture decisions, and Definition of Done.
5. `BACKLOG_WEB.md`
   - TODO-only backlog with explicit Definition of Done per item.
6. `guides/OPS_RUNBOOK.md`
   - Single source of truth for DevOps, CI/CD, release operations, and monthly ops review.
7. `evidence/`
   - Latest release QA evidence outputs (social/schema/canonical, accessibility baseline). For governance/CI usage, treat successful `Monthly Governance Audit` run URL/ID as authoritative evidence.
8. `releases/`
   - Versioned release notes files.

## Working rule

1. Update `WEB_REDESIGN_EXECUTION.md` when standards, thresholds, or scope change.
2. Update `BACKLOG_WEB.md` only for open TODO items (no completed/status sections).
3. Keep SEO artifact policy and tests aligned with generators (`scripts/generate-*` + `scripts/test-seo-artifacts.js`).
4. Keep `guides/OPS_RUNBOOK.md` aligned when workflow scripts, deployment commands, or GitHub policy changes.
