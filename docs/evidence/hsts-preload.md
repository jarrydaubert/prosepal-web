# HSTS Preload Readiness

Date: 2026-03-02T15:26:10Z

Status: PASS
Backlog item: `WEB-P1-9`

Live header checks:

```bash
curl -sS -I https://www.prosepal.app | rg -i "strict-transport-security|permissions-policy|content-security-policy|location"
curl -sS -I https://prosepal.app | rg -i "strict-transport-security|permissions-policy|content-security-policy|location"
```

Observed output:

- `https://www.prosepal.app`
  - `strict-transport-security: max-age=31536000; includeSubDomains; preload`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
- `https://prosepal.app`
  - `location: https://www.prosepal.app/`
  - `strict-transport-security: max-age=63072000`

Submission status check:

```bash
curl -sS "https://hstspreload.org/api/v2/status?domain=prosepal.app"
```

API response snapshot:

```json
{
  "name": "prosepal.app",
  "status": "preloaded",
  "bulk": false,
  "preloadedDomain": "app"
}
```

Conclusion:

- HSTS policy with `preload` is present on canonical `www` response.
- hstspreload status is explicitly documented and currently `preloaded`.
- Live header outputs are recorded in this evidence file.
