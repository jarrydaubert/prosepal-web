# Release Automation Evidence

Date: 2026-03-02T12:34:00Z

Status: FAIL
Backlog item: `WEB-P2-15`

What is implemented in-repo:

- `.github/workflows/release-automation.yml` (Release Please workflow)
- `.release-please-config.json`
- `.release-please-manifest.json`
- `OPS_RUNBOOK.md` release checklist updated to automation flow (manual tag and release-note steps removed)

Current blocker:

- `Release Automation` run on `main` failed:
  - Run: `22576115011`
  - URL: `https://github.com/jarrydaubert/prosepal-web/actions/runs/22576115011`
  - Error: `GitHub Actions is not permitted to create or approve pull requests`
- Root cause: repository policy currently disallows Actions-origin PR creation, which `release-please` requires in this configuration.

Pending close condition:

- Record one successful `Release Automation` run on `main` that creates or updates a semantic release/tag and GitHub release notes.

Command to verify once merged:

```bash
gh run list --workflow "Release Automation" --limit 5 --repo jarrydaubert/prosepal-web
gh api repos/jarrydaubert/prosepal-web/releases --jq '.[0] | {tag_name, published_at, html_url}'
```
