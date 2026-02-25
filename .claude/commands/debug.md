---
description: Systematic debugging session for prosepal-web
argument-hint: [issue description]
disable-model-invocation: true
---

# /debug - Debug Session

**CRITICAL INSTRUCTIONS:**
- Do not jump to fixes before reproducible evidence.
- Output investigation and root-cause flow directly in chat.
- Keep hypotheses ranked by likelihood.

## Usage

```bash
/debug mobile menu not opening on privacy page
/debug hero spacing collapses on ultrawide screens
/debug waitlist form submits but no success state
```

Treat `$ARGUMENTS` as the bug statement. Request a minimal repro if missing.

## Process

### 1. Reproduce
- Exact steps, viewport, browser, and page URL/path.
- Expected vs actual behavior.

### 2. Isolate
- Which files own the behavior (`public/*.html`, `public/css/*.css`, `public/js/*.js`).
- Did this regress recently?
- Is it global or page-type specific?

### 3. Investigate
- Check markup hooks/classes and JS selectors.
- Check CSS cascade/token overrides.
- Check runtime console/network errors.
- Check build/validation outputs.

### 4. Hypothesize
Provide 2-3 hypotheses with probability and test steps.

### 5. Fix Plan
- Minimal change set
- Regression checks
- Backlog follow-up if broader refactor needed

## Common Culprits (This Repo)

| Symptom | Frequent Cause |
| --- | --- |
| Hamburger works only on one page type | page missing shared `mobile-menu.js` include |
| Anchor jumps under sticky nav | missing `scroll-margin-top` or offset logic |
| Popup opens but keyboard focus escapes | no focus trap / incomplete dialog handling |
| Form looks submitted but no feedback | missing status element state update |
| Visual drift across pages | duplicate nav/card/button styles in different CSS files |
| Headings render wrong font | token/font-load mismatch by page type |

## Useful Commands

```bash
bun run dev
bun run validate
bun run check
```

## Required Output Format

```markdown
## Debug: [Issue]

### Reproduction
1. ...
Expected: ...
Actual: ...

### Investigation
- Checked: ...
- Found: ...

### Root Cause
...

### Fix Plan
- [ ] ...
- [ ] ...

### Regression Checks
- [ ] ...
```
