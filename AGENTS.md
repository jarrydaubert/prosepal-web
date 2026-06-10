# AGENTS.md

## Purpose

Operating guide for contributors and coding agents in `prosepal-web`.

## Project Snapshot

- Static marketing site for the Prosepal mobile app.
- Hosted on Vercel from the committed `public/` directory.
- The public site keeps a compact SEO surface: homepage, message examples hub, blog guides, legal pages, support, sitemap, and robots.

## Working Rules

- Canonical host is `https://prosepal.app` (apex). `www` 308-redirects to apex, and the iOS app's associated-domains entitlement uses apex. Never reintroduce `www.prosepal.app` URLs; the validator fails CI on them.
- Blog URLs keep their `.html` extension (they are indexed); legal pages stay extensionless via `vercel.json` rewrites. Do not migrate URL styles.
- Keep the site simple: no framework unless there is a clear product reason.
- Preserve SEO basics when removing pages: update `public/sitemap.xml`, `public/llms.txt`, and redirects in `vercel.json`.
- Use real mobile-app claims from the sibling `prosepal` repo or verified app metadata.
- Do not reintroduce generated content pipelines for one-off marketing pages.
- Run `bun run check` before handing off repo changes.

## Standard Workflow

```bash
bun install
bun run dev
bun run check
```

## Main Files

- `public/index.html`
- `public/messages/index.html`
- `public/blog/`
- `public/css/site.css`
- `public/js/site.js`
- `scripts/validate-site.js`
