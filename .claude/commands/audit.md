---
description: Deep code and UX audit for prosepal-web
argument-hint: [target]
disable-model-invocation: true
---

# /audit - Deep Web Audit

**CRITICAL INSTRUCTIONS:**
- Do NOT persist artifacts to disk.
- Output all findings directly in chat as markdown.
- Do NOT modify code in this command.
- Do not claim "resolved" without file-level evidence.
- Prioritize shipped surfaces over future ideas.

## Usage

```bash
/audit [target]
```

**Targets:**
- `all` - full site audit
- `homepage` - `public/index.html` + home CSS/JS
- `nav` - desktop/mobile nav across all pages
- `forms` - waitlist/tips popup/Formspree flows
- `messages` - messages hub + detail templates/pages
- `blog` - blog hub + article templates
- `seo` - metadata/schema/sitemap/robots/llms
- `performance` - render path, script/font loading
- `a11y` - keyboard/focus/landmarks/contrast patterns
- `scripts` - generation + validation scripts
- `[file path]` - exact file audit

Treat `$ARGUMENTS` as the authoritative scope. If omitted, default to `all`.

## Evidence Standard

Every finding must include:
- file path and line or section
- evidence tag: `Verified`, `Inferred`, or `Unverified`
- concrete impact and recommendation

## Required Output Format

### 1. Scope & Evidence
- Files reviewed
- What was directly inspected vs inferred
- What could not be verified without runtime

### 2. Prioritized Summary
- Stop-ship items (if any)
- Top 5 risks
- Top 5 quick wins

### 3. Findings Table

| Issue | Severity | Location | Evidence | Recommendation |
| --- | --- | --- | --- | --- |

Severity:
- `CRITICAL`: security/privacy/data-loss/legal exposure
- `HIGH`: broken user flow, major UX or SEO damage
- `MEDIUM`: maintainability/testability/perf debt
- `LOW`: polish and consistency

### 4. Non-goals & Assumptions

### 5. Backlog Candidates
- Include only verified P0/P1 items.
- Each item must include a concrete Definition of Done.

## Audit Checklist

### UX & Visual System
- [ ] Hero hierarchy, spacing rhythm, and section breathing room are consistent
- [ ] Navigation alignment, CTA prominence, and hover/focus states are clear
- [ ] Buttons/chips/cards meet contrast and readability expectations
- [ ] Mobile-first behavior remains clean on desktop expansions
- [ ] Styling uses shared tokens/patterns rather than hardcoded drift

### Functional Behavior
- [ ] Mobile menu works on every page type, not only homepage
- [ ] Anchor links account for sticky nav offset
- [ ] Dialogs/popups open/close/focus correctly
- [ ] Waitlist and tips forms show success/error states correctly
- [ ] No misleading CTA labels (for example, demo vs preview wording)

### SEO & Content Integrity
- [ ] Exactly one title, description, canonical per indexable page
- [ ] Open Graph/Twitter metadata present and correct
- [ ] `sitemap.xml`, `robots.txt`, and `llms.txt` match current pages
- [ ] Structured data is valid and not stale

### Performance
- [ ] Avoid blocking scripts above the fold
- [ ] Font loading is intentional and consistent by page type
- [ ] No oversized background effects causing jank
- [ ] Large visual effects degrade gracefully on mobile

### Security & Compliance Signals
- [ ] CSP and security headers are coherent with current integrations
- [ ] Form endpoints are expected and least-privilege
- [ ] No accidental logging of emails or form payloads

### Project Hygiene
- [ ] `bun run check` assumptions align with current code
- [ ] Dead CSS/JS/templates are identified with evidence
- [ ] Docs and backlog statuses reflect current reality
