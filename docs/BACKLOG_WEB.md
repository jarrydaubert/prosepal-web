# Prosepal Web Backlog (TODO Only)

This backlog contains open work only.
Every row must define a clear, testable Definition of Done.

| ID | Priority | TODO | Definition Of Done |
| --- | --- | --- | --- |
| `WEB-P1-9` | P1 | Add HSTS preload readiness | `Strict-Transport-Security` includes `preload`, hstspreload submission status is documented, and live header check output is recorded. |
| `WEB-P1-12` | P1 | Rotate governance audit token before expiry (May 27, 2026) | `GH_ADMIN_TOKEN` is replaced before **May 27, 2026**, `Monthly Governance Audit` passes on `main` after rotation, and the new expiry date is recorded in ops notes/backlog. |
| `WEB-P2-1` | P2 | Roll out verified social proof | Placeholder social proof is replaced by verified testimonials with source notes. |
| `WEB-P3-3` | P3 | Add sticky-nav anchor offset regression coverage | Add an automated test that clicks `#features`, `#how-it-works`, and `#faq` anchors and verifies section headings are not hidden behind sticky navigation. |
| `WEB-P3-4` | P3 | Extend accessibility baseline checks to generated message pages | `validate-accessibility-regression.js` includes representative `messages/*.html` samples for skip-link and navigation aria-label assertions, with updated evidence output. |
| `WEB-P3-5` | P3 | Extend schema spot-check with field-level assertions | `validate-schema-spotcheck.js` asserts key field values (for example homepage `SoftwareApplication.downloadUrl`, `Organization.logo`, and non-empty `HowTo.step` arrays) in addition to `@type` presence. |
