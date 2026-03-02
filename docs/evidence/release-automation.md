# Release Automation Evidence

Date: 2026-03-02T11:12:00Z

Status: SKIP
Backlog item: `WEB-P2-15`

What is implemented in-repo:

- `.github/workflows/release-automation.yml` (Release Please workflow)
- `.release-please-config.json`
- `.release-please-manifest.json`
- `OPS_RUNBOOK.md` release checklist updated to automation flow (manual tag and release-note steps removed)

Pending close condition:

- Record one successful `Release Automation` run on `main` that creates or updates a semantic release/tag and GitHub release notes.

Command to verify once merged:

```bash
gh run list --workflow "Release Automation" --limit 5 --repo jarrydaubert/prosepal-web
gh api repos/jarrydaubert/prosepal-web/releases --jq '.[0] | {tag_name, published_at, html_url}'
```
