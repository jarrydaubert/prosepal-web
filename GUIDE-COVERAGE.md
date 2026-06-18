# Guide Coverage Map

Last updated: 2026-06-18

Use this file when deciding whether a new blog guide, imported draft, or redirect belongs on `prosepal.app`.

Before each new guide build, check `public/sitemap.xml`, the blog index, and any live topic overlap so each search intent has one canonical URL. Third-party reports or generated drafts are inputs only; they are not treated as published coverage until the page exists in this repo and is deployed on the apex domain.

## Canonical Rule

- One canonical URL per topic.
- Existing `/blog/*.html` guide URLs stay canonical.
- Do not publish a competing `/guides/*` page for a topic already covered by `/blog/*.html`.
- Do not route DNS, proxy paths, or publish third-party-hosted guides unless explicitly re-approved.
- If a third-party draft is useful for an already-covered topic, fold it into the existing `/blog/*.html` page.
- When adding or removing guide routes, update `public/sitemap.xml`, `public/llms.txt`, `vercel.json`, `public/blog/index.html`, and `scripts/validate-site.js` in the same change.

## Existing Full Guides

| Topic | Canonical URL | Status |
| --- | --- | --- |
| Sympathy card messages | `/blog/what-to-write-in-sympathy-card.html` | Keep canonical. No duplicate guide URL. |
| Birthday card messages | `/blog/birthday-card-messages.html` | Keep canonical. |
| Thank-you card wording | `/blog/thank-you-card-wording.html` | Keep canonical. |
| Wedding card messages | `/blog/wedding-card-message.html` | Keep canonical. |
| Graduation card messages | `/blog/graduation-card-messages.html` | Keep canonical. |
| Get well card messages | `/blog/what-to-write-in-a-get-well-card.html` | Keep canonical. |
| Anniversary card messages | `/blog/anniversary-card-messages.html` | Keep canonical. |
| New baby card messages | `/blog/what-to-write-in-a-new-baby-card.html` | Keep canonical. |
| Retirement card messages | `/blog/retirement-card-messages.html` | Keep canonical. |
| Prosepal vs ChatGPT | `/blog/prosepal-vs-chatgpt-greeting-cards.html` | Comparison guide, not an occasion lane. |
| Prosepal Pro value | `/blog/is-prosepal-pro-worth-it.html` | Product/value guide, not an occasion lane. |

## Messages Hub Coverage

`/messages/` has compact examples for these occasions. A hub example is not the same as a full guide, so these remain eligible for a dedicated guide if they do not already appear above.

| Topic | Full guide? | Notes |
| --- | --- | --- |
| Sympathy | Yes | Use existing blog guide. |
| Birthday | Yes | Use existing blog guide. |
| Thank you | Yes | Use existing blog guide. |
| Wedding | Yes | Use existing blog guide. |
| Graduation | Yes | Use existing blog guide. |
| Get well | Yes | Use existing blog guide. |
| Anniversary | Yes | Use existing blog guide. |
| New baby | Yes | Use existing blog guide. |
| Retirement | Yes | Use existing blog guide. |
| Apology | No | Open lane. |
| Encouragement | No | Open lane. |

## Open Lanes

Prioritize with verified keyword data before publishing.

1. Apology card messages.
2. Encouragement card messages.
3. Relationship-specific variants for covered occasions.

## Routing Notes

- Blog URLs keep their `.html` extension.
- Extensionless blog paths should redirect permanently to the matching `.html` URL through `vercel.json`.
- Legal pages stay extensionless through rewrites.
- The apex host, `https://prosepal.app`, remains canonical.
