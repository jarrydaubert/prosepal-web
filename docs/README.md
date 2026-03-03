# Prosepal Web Docs Index

This folder holds execution and quality docs for `prosepal-web`.

Docs are intentionally structured for public readability:
- one canonical source per operational topic
- minimal duplication
- instructions tied to real repo scripts/workflows

## Core docs

- `../README.md`
  Public project overview and contributor entrypoint.
- `../AGENTS.md`
  Operating contract for contributors and coding agents.
- `../SECURITY.md`
  Vulnerability reporting policy.
- `BACKLOG_WEB.md`
  Open backlog only, with explicit Definition of Done per item.
- `guides/OPS_RUNBOOK.md`
  Single source of truth for DevOps, CI/CD, release flow, and operations.
- `guides/MARKETING_SKILLS_RUNBOOK.md`
  Skills sync and maintenance workflow.
- `evidence/`
  Validation artifacts produced by checks and release QA.
- `releases/`
  Versioned release notes.

## Working rule

- Update `guides/OPS_RUNBOOK.md` whenever standards, scope, workflow scripts, deployment behavior, or GitHub policy changes.
- Keep `BACKLOG_WEB.md` as TODO-only (no completed/status sections).
- Keep generator policy and tests aligned (`scripts/generate-*`, `scripts/test-seo-artifacts.js`).
