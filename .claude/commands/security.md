---
description: Security-focused review for prosepal-web
argument-hint: [scope]
disable-model-invocation: true
---

# /security - Security Review

**CRITICAL INSTRUCTIONS:**
- Output findings in chat only.
- Do not claim secure/pass without evidence.
- Every finding needs impact + repro path.

## Usage

```bash
/security
/security headers
/security forms
/security csp
/security [file-path]
```

Treat `$ARGUMENTS` as scope. If omitted, run full sweep.

## Evidence Standard

Every finding must include:
- location (`vercel.json`, HTML, JS, script)
- evidence snippet/pattern
- exploit or abuse path
- remediation guidance

## Step 0: Attack Surface Inventory

Document:
- Public pages and downloadable assets
- Client-side forms and endpoints
- External scripts/services (analytics, Formspree, App Store links)
- Security header policy in `vercel.json`

## Checklist

### Headers & Policy
- [ ] CSP is explicit and least-privilege for current integrations
- [ ] `X-Content-Type-Options`, `Referrer-Policy`, frame protections are set
- [ ] `Strict-Transport-Security` policy is present and sane

### Form & Input Abuse
- [ ] Form endpoints are expected and not stale
- [ ] Client-side validation avoids obvious malformed input
- [ ] No email or PII leakage through console logs
- [ ] Error messaging avoids enumeration signals where possible

### Frontend Injection Risks
- [ ] No unsafe inline scripts/styles introduced unintentionally
- [ ] Generated HTML escapes dynamic content in templates/scripts
- [ ] No dangerous HTML injection sinks without sanitization

### Supply Chain & Build Scripts
- [ ] Build/validation scripts do not execute untrusted input blindly
- [ ] Dependencies are minimal for static site needs

## Useful Search Patterns

```bash
rg "Content-Security-Policy|Strict-Transport|Referrer-Policy|X-Content-Type-Options" vercel.json public/
rg "formspree|fetch\(|XMLHttpRequest|navigator.sendBeacon" public/js public/*.html
rg "console\.log|console\.error" public/js scripts
rg "innerHTML|outerHTML|insertAdjacentHTML" public/js scripts
```

## Required Output Format

### 1. Scope & Surfaces Reviewed
### 2. Top Risks (prioritized)
### 3. Findings Table

| Issue | Severity | Location | Evidence | Recommendation |
| --- | --- | --- | --- | --- |

### 4. Deferred/Unverified Checks
