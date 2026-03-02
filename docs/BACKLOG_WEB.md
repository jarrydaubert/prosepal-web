# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-9` | P1 | Add HSTS preload readiness | `Strict-Transport-Security` includes `preload`, hstspreload submission status is documented, and live header check output is recorded. |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, `Monthly Governance Audit` passes on `main` after rotation, and the new expiry date is recorded in ops notes/backlog. |
| `WEB-P2-1` | P2 | Roll out verified social proof | Placeholder social proof is replaced by verified testimonials with source notes. |
| `WEB-P2-17` | P2 | Expand visual regression coverage beyond homepage | Visual regression suite includes at least one blog page and one message-detail page baseline in addition to homepage, and CI evidence is recorded. |
| `WEB-P2-19` | P2 | Add Playwright interaction coverage for critical homepage/content flows | Add automated interaction tests for mobile nav open/close + focus return (homepage and one non-home page), demo chip keyboard navigation (Arrow/Home/End), and waitlist submit success/error UI states with mocked Formspree responses. |
| `WEB-P2-20` | P2 | Add tips popup lifecycle and focus-trap tests | Add automated tests that verify popup Tab trapping, Escape/overlay dismiss behavior, and localStorage-based re-open suppression windows for dismiss (~14 days) and submit (~90 days). |
| `WEB-P2-22` | P2 | Align public marketing claims with verifiable sources | Quantified claims used in public copy (for example occasions/relationships/supporter counts) are either backed by a documented source (`docs/evidence/marketing-claims.md`) or updated/removed, and any count tied to generated content is validated against `data/messages-pages.json`. |
| `WEB-P3-1` | P3 | Tighten CSP `img-src` allowlist | Remove `https://api.producthunt.com` from CSP `img-src` unless actively used, then re-verify runtime CSP evidence. |
| `WEB-P3-2` | P3 | Standardize global nav CTA label | Main nav CTA text is consistent across homepage and content pages (`Download` vs `Get the App`) with one canonical label documented and applied. |
| `WEB-P3-3` | P3 | Add sticky-nav anchor offset regression coverage | Add an automated test that clicks `#features`, `#how-it-works`, and `#faq` anchors and verifies section headings are not hidden behind sticky navigation. |
| `WEB-P3-4` | P3 | Extend accessibility baseline checks to generated message pages | `validate-accessibility-regression.js` includes representative `messages/*.html` samples for skip-link and navigation aria-label assertions, with updated evidence output. |
| `WEB-P3-5` | P3 | Extend schema spot-check with field-level assertions | `validate-schema-spotcheck.js` asserts key field values (for example homepage `SoftwareApplication.downloadUrl`, `Organization.logo`, and non-empty `HowTo.step` arrays) in addition to `@type` presence. |
