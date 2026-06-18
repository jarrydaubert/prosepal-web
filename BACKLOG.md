# Backlog

Working list for Prosepal web improvements. Keep changes aligned with the static-site setup, apex canonical host, compact SEO surface, and `bun run check` handoff rule in `AGENTS.md`.

## SEO and AEO

- [x] Add FAQ schema to high-intent blog guides.
  - Add visible FAQ sections where useful, then mirror them in valid `FAQPage` JSON-LD.
  - Start with sympathy, birthday, thank-you, wedding, and graduation guides.

- [ ] Reconcile keyword-volume claims with sourced data.
  - Remove unsupported live page copy that claimed an exact monthly search count.
  - Verify volume and difficulty figures from the original SEO tool or Search Console.
  - Replace or qualify unsourced claims such as exact monthly search counts in page copy.

- [x] Evaluate PloyAI as a guide-production or partial-hosting workflow.
  - Treat PloyAI recommendations as inputs, then verify against the current repo and live site before implementation.
  - Do not duplicate the existing guide hub by routing `/guides/*` to Ploy while equivalent `/blog/*.html` pages remain canonical.
  - Decision on 2026-06-18: keep publishing and routing first-party in this repo. Do not route DNS, proxy paths, or publish `/guides/*` through PloyAI unless explicitly re-approved.

- [x] Build a definitive guide coverage map.
  - Use `GUIDE-COVERAGE.md` before accepting new guide topics or importing third-party draft content.

- [x] Refresh the SEO/AEO analysis to match the current site.
  - Note that the Guides hub and 11 first-party guides are already live: sympathy, birthday, thank-you, wedding, graduation, get well, anniversary, new baby, retirement, comparison, and pricing/value.
  - Reframe the next move as AEO visibility tracking, data-backed smaller-lane expansion, and content refresh rather than first-page creation.

- [ ] Expand long-tail guide coverage from validated demand.
  - [x] Ship a first-party get-well guide at `/blog/what-to-write-in-a-get-well-card.html`.
  - [x] Ship a first-party anniversary guide at `/blog/anniversary-card-messages.html`.
  - [x] Ship a first-party new baby guide at `/blog/what-to-write-in-a-new-baby-card.html`.
  - [x] Ship a first-party retirement guide at `/blog/retirement-card-messages.html`.
  - Keep apology and encouragement as lower-volume bundle candidates unless validated demand supports standalone pages.
  - Keep new pages deliberate; update `public/sitemap.xml`, `public/llms.txt`, and `vercel.json` redirects when routes change.

- [ ] Track AI-answer visibility for target prompts.
  - Maintain a small query set for ChatGPT, Perplexity, Google AI Overviews, and similar answer surfaces.
  - Record whether Prosepal appears, whether it is cited, and which competing sources are cited.

- [ ] Strengthen the "write, not design" positioning across SEO pages.
  - Differentiate Prosepal from card-design tools by focusing copy on message writing, tone, relationship, and occasion context.

## Homepage Design

- [x] Tighten homepage vertical rhythm.
  - Reduce oversized gaps between hero, feature metrics, how-it-works, FAQ, and closing CTA sections.
  - Preserve the calm editorial feel while making the page feel more finished.

- [x] Add a secondary hero path for visitors not ready to download.
  - Consider linking to `/messages/`, `/blog/`, or the sympathy guide as a "see examples" path.
  - Keep App Store download as the primary CTA.

- [x] Lift body-copy contrast on the dark background.
  - Audit muted paragraph text, section intros, cards, and FAQ copy.
  - Improve readability without flattening the navy, coral, and amber palette.

- [ ] Improve section intro typography.
  - Slightly increase size and/or leading for short explanatory paragraphs under major headings.
  - Check mobile line length and wrapping after changes.

- [ ] Add product proof to the homepage.
  - Options include a real app screenshot, example generated messages, verified App Store rating, or a compact proof strip.
  - Use only verified App Store metadata and real product claims.

- [x] Add a homepage example-message section.
  - Show a few generated-message-style examples for hard-to-write moments such as sympathy, apology, or coworker notes.
  - Tie the section to the app's occasion, relationship, tone, and length inputs.

- [x] Review FAQ affordance and interaction polish.
  - Current markup uses expandable `details`; verify the visual treatment makes this obvious.
  - Improve focus, hover, and expanded states if needed.

- [x] Reuse the amber accent pattern beyond the stats.
  - Look for restrained places where the warm number/accent treatment can reinforce hierarchy.
  - Avoid turning the page into a one-note accent showcase.
