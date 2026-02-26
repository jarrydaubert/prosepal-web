# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-1` | P1 | Run accessibility manual regression | Keyboard/focus/manual checks are completed on homepage, messages hub, blog hub, and legal pages with no unresolved critical issues. |
| `WEB-P1-2` | P1 | Enforce Lighthouse budgets | Mobile SEO/performance thresholds are documented and checked by a repeatable command/workflow in release QA. |
| `WEB-P1-5` | P1 | Add monthly GitHub policy drift audit | Monthly checklist verifies ruleset checks, Actions allowlist, fork policy, and token permissions. |
| `WEB-P1-6` | P1 | Tune CI usage budget | CI runtime/storage baseline is documented with retention targets and periodic usage review. |
| `WEB-P1-9` | P1 | Add HSTS preload readiness | `Strict-Transport-Security` includes `preload`, hstspreload submission status is documented, and live header check output is recorded. |
| `WEB-P1-10` | P1 | Add explicit labels for homepage email inputs | Waitlist and tips-popup email inputs have programmatic `<label for>` associations, automated accessibility checks report no missing-label violations, and keyboard/screen-reader spot checks confirm announced field purpose. |
| `WEB-P1-11` | P1 | Add high-value conversion analytics events | Vercel custom events are emitted for key conversion interactions (App Store clicks, waitlist submit success, demo-chip interactions), event names/properties are documented, and events are verified in the analytics dashboard or network traces. |
| `WEB-P2-1` | P2 | Roll out verified social proof | Placeholder social proof is replaced by verified testimonials with source notes. |
| `WEB-P2-2` | P2 | Re-introduce aggregate rating only when ready | `aggregateRating` schema is added only after defined review-volume/verification criteria are met with auditable data. |
| `WEB-P2-3` | P2 | Decide Formspree endpoint strategy for two forms | Either separate Formspree endpoints are implemented for waitlist vs tips popup, or a documented single-endpoint decision with proven source-based filtering and failure handling is added. |
| `WEB-P2-5` | P2 | Verify runtime CSP behavior for Vercel analytics scripts | Browser console checks on production show no CSP violations for analytics/speed-insights, or CSP is updated with least-privilege allow rules and evidence is captured. |
| `WEB-P2-6` | P2 | Standardize responsive breakpoint strategy across page types | Breakpoint strategy is documented and consistently applied across home/content/messages styles without regressions at mobile and desktop reference viewports. |
| `WEB-P2-8` | P2 | Add explicit Permissions-Policy header | Global response headers include a least-privilege `Permissions-Policy` value for this static site, and live header checks confirm it is returned. |
| `WEB-P2-9` | P2 | Define CSP violation reporting strategy | A clear CSP reporting decision is documented and implemented (report endpoint or explicit no-report rationale), with a verification step captured in ops docs. |
| `WEB-P2-10` | P2 | Optimize homepage render-blocking CSS path with measurement | Homepage CSS loading strategy is reviewed and improved with measured Lighthouse/LCP impact, avoiding regressions such as duplicate stylesheet downloads. |
| `WEB-P2-11` | P2 | Align mobile-menu behavior across page types | Secondary-page `mobile-menu.js` behavior matches homepage menu behavior for focus/open/close patterns (including first-link focus and Escape handling) with manual regression checks passing. |
| `WEB-P2-12` | P2 | Tokenize z-index layers across CSS | Shared z-index tokens are defined and used for nav/mobile-menu/modal/skip-link layering across style sheets, and bare z-index integers are removed from maintained theme files. |
| `WEB-P2-13` | P2 | Reduce repeated RGBA literals via shared tokens | Frequently repeated RGBA literals are replaced with shared tokens where appropriate, and style-audit/readability checks confirm reduced duplication without visual regressions. |
| `WEB-P2-14` | P2 | Normalize legal-page social metadata image strategy | Privacy/terms/support pages use a consistent social preview image strategy (dimensions and asset choice documented), and Open Graph previews render consistently across legal pages. |
