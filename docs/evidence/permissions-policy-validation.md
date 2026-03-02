# Permissions-Policy Validation

Date: 2026-03-02T11:08:52Z

Status: PASS
Backlog item: `WEB-P2-8`

Targets:

- `https://www.prosepal.app/`
- `https://www.prosepal.app/privacy.html`

Live header check output (`curl -I`):

- `https://www.prosepal.app/`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload`
- `https://www.prosepal.app/privacy.html`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload`

Checks:

- PASS: global site responses include least-privilege `Permissions-Policy` value.
- PASS: live header checks confirm `Permissions-Policy` is returned on homepage and legal page responses.

Notes:

- `vercel.json` defines `Permissions-Policy: camera=(), microphone=(), geolocation=()` for `/(.*)`.
- Apex redirect response (`https://prosepal.app`) currently omits `Permissions-Policy`; that redirect policy is tracked separately under HSTS preload readiness (`WEB-P1-9`) because it is managed outside app response headers.
