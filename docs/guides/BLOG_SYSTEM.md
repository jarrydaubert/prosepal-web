# Blog System Guide

Purpose: keep Prosepal blog content visually strong, conversion-aware, and easy to maintain.

## Core standards

- Build every post from `templates/blog-article.html`.
- Keep article UX consistent: hero image, clear headings, desktop TOC.
- Treat `public/blog/` as static source of truth for published posts.
- Keep copy practical and specific; avoid vague filler.

## Content philosophy

- Real value: every post should help someone write a better card immediately.
- Actionable: include examples and clear next steps.
- Plain language: avoid jargon, keep sentence structure clean.
- Trust-first: avoid overclaiming; keep promises consistent with product behavior.
- Emotional fit: tone should match the occasion sensitivity.

## Image system

- Prompt source: `scripts/blog-images.json`
- Prompt renderer: `bun run images:prompts:blog`
- Preferred outputs:
  - Social-first: `1200x630` (1.91:1)
  - Acceptable: `16:9` or `16:10` when generator constraints apply
- Never ship images with text overlays, logos, signatures, or watermarks.
- Save blog images to `public/blog/` and reference absolute site URLs in metadata.

## New post workflow

1. Scaffold:

```bash
node scripts/new-blog-post.js --slug=your-slug --title="Your Post Title"
```

2. Fill content sections and TOC anchors in the generated HTML.
3. Add the post card to `public/blog/index.html`.
4. Add/update image prompt object in `scripts/blog-images.json`.
5. Generate image and save in `public/blog/`.
6. Verify metadata in post:
   - `canonical`
   - `og:image`
   - `twitter:image`
   - JSON-LD `Article.image`

## Quality gates

Run before PR or deploy:

```bash
bun run generate:site
bun run validate
bun run validate:blog:images
bun run validate:schema:local
```

## Ongoing maintenance

- Refresh older images that no longer match current visual direction.
- Keep headline, metadata description, and opening paragraph aligned.
- Keep CTA language consistent with homepage promises.
- Update internal links when new high-intent posts are added.
