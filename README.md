# prosepal-web

Static marketing site for [Prosepal](https://prosepal.app), the iOS greeting-card message writer.

## Site Shape

- `public/index.html` - app marketing homepage
- `public/messages/index.html` - SEO-friendly card message examples hub
- `public/blog/` - seven high-intent card writing guides
- `public/privacy.html`, `public/terms.html`, `public/support.html` - app/legal support pages
- `public/.well-known/` - mobile app association files
- `scripts/validate-site.js` - lightweight static route and asset validator

The site intentionally stays static. There is no framework, no generated page pipeline, and no browser test dependency.

## Local Development

```bash
bun install
bun run dev
```

Local server: `http://localhost:3000`

## Checks

```bash
bun run check
```

This runs Biome plus the static site validator. Vercel serves the committed `public/` directory.
