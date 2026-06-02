# GitHub Policy Drift Audit

Date: 2026-06-02T08:27:44.389Z
Repository: jarrydaubert/prosepal-web

Status: PASS
- PASS: Main branch ruleset (Protect main is active)
- PASS: Branch protection hardening (requires no force-push, no deletion, linear history)
- PASS: Required status checks (found: CI, CodeQL)
- PASS: Actions policy (allowed_actions=selected; sha_pinning_required=true)
- PASS: Workflow token permissions (default=read; can_approve_pr=true)
- PASS: Selected actions allowlist (patterns=5)
- PASS: Fork PR workflow approval policy (approval_policy=all_external_contributors)
- PASS: Private vulnerability reporting (enabled=true)
- PASS: Main ruleset code scanning tools (tools=CodeQL)
- PASS: CodeQL workflow source (.github/workflows/codeql.yml covers javascript-typescript and python)
