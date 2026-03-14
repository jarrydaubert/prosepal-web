# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.
Execution order is top-to-bottom.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, repo variable `GH_ADMIN_TOKEN_EXPIRES_ON` is updated to the new expiry (`YYYY-MM-DD`), `Monthly Governance Audit` passes on `main` after rotation (including `governance-token-expiry` evidence), and the new expiry date + successful run URL/ID are recorded in ops notes/backlog. |
| `WEB-P1-17` | P1 | Raise production real-experience score above the warning band | The highest-impact above-the-fold performance bottlenecks on the homepage are reduced enough that production Speed Insights no longer shows a warning-state real experience score for the primary audience window; changes are tied to specific metrics (at minimum LCP/FCP or their current replacement in Vercel reporting), documented with before/after evidence, and `bun run check` passes without regressing analytics, accessibility, or interaction behavior. |
| `WEB-P2-4` | P2 | Run full documentation review with repo owner | All first-party docs (`README.md`, `AGENTS.md`, `docs/**/*.md`, `SECURITY.md`, release notes, and runbooks) are reviewed line-by-line with the owner; outdated or ambiguous claims are updated to match current `prosepal-web` behavior; stack references are explicitly web-only where applicable; commands in docs are spot-validated; and a short review log with date, scope, and decisions is committed under `docs/evidence/`. |
| `WEB-P2-1` | P2 | Roll out verified social proof and trust strip (blocked pending source quotes) | Homepage includes a trust strip near a primary conversion zone (hero or final CTA) with only verifiable proof points; testimonial/review quotes include source notes in docs; unsourced quantitative copy (including unsupported search-volume claims) is removed or replaced with sourced wording; copy and schema validations pass. |
| `WEB-P3-1` | P3 | Reduce governance-policy drift detection lag | `Monthly Governance Audit` also runs on a shorter review loop for governance-sensitive changes (for example on `main` after workflow/policy-script edits, or at least weekly), the runbook documents the new cadence/trigger, and a successful run on the new trigger path is recorded in evidence or ops notes. |
