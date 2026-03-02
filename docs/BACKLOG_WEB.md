# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-9` | P1 | Add HSTS preload readiness | `Strict-Transport-Security` includes `preload`, hstspreload submission status is documented, and live header check output is recorded. |
| `WEB-P2-8` | P2 | Add explicit Permissions-Policy header | Global response headers include a least-privilege `Permissions-Policy` value for this static site, and live header checks confirm it is returned. |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, `Monthly Governance Audit` passes on `main` after rotation, and the new expiry date is recorded in ops notes/backlog. |
| `WEB-P2-10` | P2 | Optimize homepage render-blocking CSS path with measurement | Homepage CSS loading strategy is reviewed and improved with measured Lighthouse/LCP impact, avoiding regressions such as duplicate stylesheet downloads. |
| `WEB-P2-1` | P2 | Roll out verified social proof | Placeholder social proof is replaced by verified testimonials with source notes. |
| `WEB-P2-15` | P2 | Automate release tagging and notes | A release workflow (for example `release-please` or `semantic-release`) automatically creates semantic version tags and GitHub release notes from merged commits on `main`, manual tag/release note steps are removed from `OPS_RUNBOOK.md`, and one successful release workflow run is recorded as evidence. |
| `WEB-P3-5` | P3 | Tune Bun dependency caching in CI | CI workflows cache Bun dependencies in a deterministic way, cache hit behavior is visible in logs, and average runtime for `Web Quality` over recent runs is non-regressive versus baseline. |
| `WEB-P3-7` | P3 | Pilot visual regression checks for marketing layout | A lightweight visual regression workflow (for example Playwright screenshots) runs on PRs for core views (homepage hero + nav on mobile/desktop), baseline images are versioned, and at least one intentional style diff is demonstrated in CI output. |
