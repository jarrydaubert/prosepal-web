# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.
Execution order is top-to-bottom.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, repo variable `GH_ADMIN_TOKEN_EXPIRES_ON` is updated to the new expiry (`YYYY-MM-DD`), `Monthly Governance Audit` passes on `main` after rotation, and the new expiry date plus successful run URL/ID are recorded in the closing PR or ops notes. |
| `WEB-P1-17` | P1 | Raise production real-experience score above the warning band | The highest-impact above-the-fold performance bottlenecks on the homepage are reduced enough that production Speed Insights no longer shows a warning-state real experience score for the primary audience window; changes are tied to specific metrics (at minimum LCP/FCP or their current replacement in Vercel reporting), supported by before/after measurements, and `bun run check` passes without regressing analytics, accessibility, or interaction behavior. |
| `WEB-P2-1` | P2 | Roll out verified social proof and trust strip (blocked pending source quotes) | Homepage includes a trust strip near a primary conversion zone (hero or final CTA) with only verifiable proof points; testimonial/review quotes include source notes in docs; unsourced quantitative copy (including unsupported search-volume claims) is removed or replaced with sourced wording; copy and schema validations pass. |
