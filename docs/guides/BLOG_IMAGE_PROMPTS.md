# Blog Image Prompts

Purpose: keep AI image generation for blog pages consistent and repeatable.

## Source of truth

- Prompt catalog: `scripts/blog-images.json`
- Prompt renderer: `scripts/render-blog-image-prompts.js`

## Style direction

- Primary look: warm isometric 3D illustrations with emotional depth.
- Visual language: geometric platforms, soft bloom, category-colored rim light.
- Camera: elevated isometric angle, centered composition.
- Hard constraints: no text, letters, logos, signatures, watermarks, UI fragments, or photoreal faces.
- Use `scripts/blog-images.json` as the style and concept source of truth.

## Usage

Render prompts for all blog pages:

```bash
bun run images:prompts:blog
```

Render prompt for one page:

```bash
bun run images:prompts:blog -- --slug=prosepal-vs-chatgpt-greeting-cards
```

## Output workflow

1. Generate image with Nano Banana 2 using prompt output.
2. Generate at `16:9` (`1600x900` preferred) or `16:10` fallback when needed.
3. Export/crop a final OG asset to `1200x630` where possible.
4. Save to `public/blog/` using `outputFilename` from JSON.
5. Update blog page metadata to point to the new image:
   - `meta property="og:image"`
   - `meta name="twitter:image"`
   - JSON-LD `Article.image`
6. Run:

```bash
bun run generate:site
bun run validate
bun run validate:blog:images
bun run validate:schema:local
```
