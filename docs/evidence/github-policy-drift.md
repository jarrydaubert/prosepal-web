# GitHub Policy Drift Audit

Date: 2026-04-16T08:53:40.194Z
Repository: jarrydaubert/prosepal-web

Status: PASS
- PASS: Main branch ruleset (Protect main is active)
- PASS: Branch protection hardening (requires no force-push, no deletion, linear history)
- PASS: Required status checks (found: CodeQL, SEO + QA Gate)
- PASS: Actions policy (allowed_actions=selected; sha_pinning_required=true)
- PASS: Workflow token permissions (default=read; can_approve_pr=true)
- PASS: Selected actions allowlist (patterns=5)
- PASS: Fork PR workflow approval policy (approval_policy=all_external_contributors)
- PASS: Private vulnerability reporting (enabled=true)
- PASS: Main ruleset code scanning tools (tools=CodeQL)
- PASS: GitHub default CodeQL setup (state=configured; languages=actions, javascript, javascript-typescript, python, typescript; schedule=weekly)
