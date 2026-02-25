# Deployment Guide

Last updated: 2026-02-25.

This project deploys to Vercel and is fronted by Cloudflare at the domain edge.

## Deployment Model

1. Build artifacts are generated locally (`public/messages`, `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`).
2. Deployments are executed with Vercel CLI/SDK workflow.
3. Cloudflare fronts traffic and DNS, while Vercel serves the origin.

## Safety Rule (Critical)

This machine also deploys other Vercel projects (for example PayeTax).

Always verify project linkage before deploy:

```bash
bun run vercel:check-link
```

If this check fails, relink to the correct project:

```bash
vercel link --project prosepal-web
```

## Standard Commands

Preview deploy:

```bash
bun run deploy:preview
```

Production deploy:

```bash
bun run deploy:prod
```

`deploy:prod` runs:

1. `bun run check`
2. `bun run vercel:check-link`
3. `vercel --prod --yes`

## Pre-Deploy Checklist

1. `bun run check` passes.
2. `bun run vercel:check-link` passes.
3. Working tree is committed (no untracked deploy drift).
4. Regenerated SEO artifacts are included if content/scripts changed.

## Rollback

Use Vercel dashboard rollback to previous deployment, then investigate root cause locally before redeploying.
