# CI Control Baseline

Date: 2026-06-02

Status: UPDATED

Current hard gates:

- `CI`: installs from the Bun lockfile, blocks tracked env files, runs `bun run check`, builds the static site, and verifies generated SEO artifacts are committed.
- `CodeQL`: scans JavaScript/TypeScript and Python through `.github/workflows/codeql.yml`.

Current repo controls:

- Dependabot configuration: `.github/dependabot.yml`.
- Secret scanning: repository setting.
- Push protection: repository setting.
- Private vulnerability reporting: repository setting.
- Config shape without secrets: `.env.example`.

Retired workflow docs removed:

- Web Quality / SEO + QA Gate.
- Visual Regression.
- Lighthouse Budget.
- Interaction Flake Audit.
- Visual Flake Audit.
- Governance Audit workflow.
- Release Automation workflow.

Rationale:

AI-assisted code is allowed. Unverified AI-assisted code is not. The repo now uses a small number of hard gates plus security defaults instead of separate workflows for diagnostics, audits, and release ceremony.
