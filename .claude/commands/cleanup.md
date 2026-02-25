---
description: Deep project housekeeping for prosepal-web
argument-hint: [scope]
disable-model-invocation: true
---

# /cleanup - Dead Code & Asset Hygiene

**CRITICAL INSTRUCTIONS:**
- Do NOT delete files automatically.
- Do NOT trust tooling output blindly; verify every claim.
- Output all findings directly in chat.
- Cap main findings list at 30 items by impact.

## Usage

```bash
/cleanup
/cleanup css
/cleanup js
/cleanup pages
/cleanup scripts
/cleanup docs
```

Treat `$ARGUMENTS` as scope. If omitted, run full scan.

## Evidence Standard

Every finding must include:
- **Evidence method** (for example `rg` pattern + result)
- **Confidence**: High / Medium / Low
- **Classification**: removable / keep / unverified

## Scope Map

Default full scan includes:
- `public/`
- `public/css/`
- `public/js/`
- `scripts/`
- `templates/`
- `data/`
- `docs/`

Ignore generated/cache folders:
- `node_modules/`
- `.git/`
- `.vercel/`

## Never Flag as Orphan Without Extra Checks

Convention or generator outputs may look unused but are required:
- `public/index.html`
- `public/404.html`
- `public/privacy.html`, `public/terms.html`, `public/support.html`
- `public/blog/index.html`
- `public/messages/index.html`
- message detail pages generated from `data/messages-pages.json`
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`
- assets referenced in metadata or social tags (`og-*`, icons)

## Two-Pass Workflow

### Pass 1: Inventory
1. List files by scope.
2. Flag suspicious duplicates, backups, stale variants.
3. Do not recommend deletion yet.

### Pass 2: Verification
1. For top candidates, verify via import/reference/search paths.
2. Check HTML references, JS selectors, CSS class usage, script generators.
3. Reclassify as `Removable`, `Keep`, or `Unverified`.

## Verification Patterns

```bash
# CSS class usage check
rg "class=\"[^"]*<candidate-class>" public/

# Script reference check
rg "src=\"/js/<candidate-file>" public/

# CSS reference check
rg "href=\"/css/<candidate-file>" public/

# Asset reference check
rg "<candidate-file>" public/ scripts/ templates/

# Generator linkage
rg "generate-|messages-pages|template|sitemap|robots|llms" scripts/ data/ templates/
```

## Output Format

### 1. Scope Reviewed
### 2. Prioritized Findings

| Item | Type | Evidence | Confidence | Recommendation |
| --- | --- | --- | --- | --- |

### 3. Safe Cleanup Candidates
Only include candidates with High confidence.

### 4. Needs Manual Review
Anything not fully verifiable.
