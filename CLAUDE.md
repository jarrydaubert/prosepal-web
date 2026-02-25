# prosepal-web

Static landing page and blog for Prosepal app.

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | https://www.prosepal.app |
| Hosting | Vercel |
| Git | Local only (no remote) |
| Deploy | `vercel --prod` |

## Commands

```bash
bun run dev      # Local preview (localhost:3000)
bun run lint     # Check JSON files
bun run format   # Format JSON files
vercel --prod    # Deploy to production
```

## Structure

```
public/           # Static files served by Vercel
├── index.html    # Landing page
├── blog/         # SEO blog posts
├── llms.txt      # LLM context file
└── *.html        # Legal pages
docs/             # Backlog
```

## Notes

- Static HTML/CSS only, no build step
- Analytics: Vercel Analytics + Speed Insights (web), Firebase Analytics (app)
- See `docs/BACKLOG_WEB.md` for outstanding items
