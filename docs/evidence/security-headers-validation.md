# Security Headers Validation

Date: 2026-03-02T10:02:03Z

Status: FAIL
Targets:
- https://www.prosepal.app/
- https://www.prosepal.app/privacy.html
- https://prosepal.app (redirect)

Deployment context:
- Vercel production deploy: `https://prosepal-oz2iqn4pf-projectnex.vercel.app`
- Aliased by Vercel CLI to: `https://www.prosepal.app`

Live header check output (`curl -I`):
- `https://www.prosepal.app/`
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
- `https://www.prosepal.app/privacy.html`
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
- `https://prosepal.app` (307 redirect)
  - `strict-transport-security: max-age=63072000`
  - `permissions-policy: (missing)`

Checks:
- PASS: Strict-Transport-Security includes `preload` on `www`
- PASS: Permissions-Policy present on `www` and legal page responses
- FAIL: Strict-Transport-Security includes `preload` on apex redirect
- FAIL: Permissions-Policy present on apex redirect response
- PASS: Strict-Transport-Security present on both `www` and apex redirect

Notes:
- Repo config defines both headers in `vercel.json` (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`).
- `bun run vercel:check-link` passes for project `prosepal-web` (`projectId: prj_drrormeL9LQJaIWEmyS1zsfyTb7Q`).
- `vercel domains inspect prosepal.app` returns access denied under current account, so apex redirect policy is likely managed outside this project scope.
- Remaining gap appears limited to apex-domain redirect behavior outside this project’s managed response headers.
