# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.
Execution order is top-to-bottom.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, repo variable `GH_ADMIN_TOKEN_EXPIRES_ON` is updated to the new expiry (`YYYY-MM-DD`), `Monthly Governance Audit` passes on `main` after rotation (including `governance-token-expiry` evidence), and the new expiry date + successful run URL/ID are recorded in ops notes/backlog. |
| `WEB-P1-14` | P1 | Replace synthetic freshness dates with editorially truthful publish/update signals | Message-page `datePublished`/`dateModified` values and sitemap `lastmod` are derived from explicit per-page editorial metadata (or file-level verified source policy), not global build-date fallbacks; generator scripts document the date-source contract; validation checks fail when required dates are missing/invalid; sample pages and sitemap entries are verified in evidence after regeneration. |
| `WEB-P2-4` | P2 | Run full documentation review with repo owner | All first-party docs (`README.md`, `AGENTS.md`, `docs/**/*.md`, `SECURITY.md`, release notes, and runbooks) are reviewed line-by-line with the owner; outdated or ambiguous claims are updated to match current `prosepal-web` behavior; stack references are explicitly web-only where applicable; commands in docs are spot-validated; and a short review log with date, scope, and decisions is committed under `docs/evidence/`. |
| `WEB-P2-1` | P2 | Roll out verified social proof and trust strip (blocked pending source quotes) | Homepage includes a trust strip near a primary conversion zone (hero or final CTA) with only verifiable proof points; testimonial/review quotes include source notes in docs; unsourced quantitative copy (including unsupported search-volume claims) is removed or replaced with sourced wording; copy and schema validations pass. |
