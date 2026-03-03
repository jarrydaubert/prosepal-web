# AI Crawler Policy Decision Record

Scope: training and indexing crawler policy for `prosepal-web`.

## Decision

Keep search/indexing bots allowed, while blocking model-training bots in `robots.txt`.

Allowed search/indexing bots:
- `Googlebot`
- `Bingbot`
- `Applebot`
- `OAI-SearchBot`
- `Claude-SearchBot`
- `PerplexityBot`

Blocked training bots:
- `GPTBot`
- `ClaudeBot`
- `Google-Extended`
- `Applebot-Extended`
- `CCBot`

## Why this policy exists

- The site is public and intended for user discovery via search.
- We want indexing and answer-surface discovery, but do not grant broad model-training access by default.
- This preserves control over how original copy is reused for model training while keeping normal web discovery open.

## Tradeoffs

Benefits:
- Preserves opt-out stance for large-scale training crawlers.
- Keeps indexing and assistant-search discovery paths open.
- Reduces accidental policy drift by centralizing rules in one shared script module.

Costs:
- Some AI ecosystems may have reduced citation/training coverage.
- Potentially lower indirect discovery from systems that rely on training ingestion instead of live indexing.
- Requires deliberate periodic review as crawler behavior and product goals change.

## Review cadence

- Quarterly review in the first week of each quarter (Jan, Apr, Jul, Oct).
- Additional review whenever growth strategy or distribution priorities change.
- Operational check command:

```bash
bun run validate:robots:policy
```

This validation ensures `scripts/generate-robots.js` policy and generated `public/robots.txt` remain in sync.

## Owner confirmation

- Owner: `jarrydaubert` (repo owner)
- Policy choice confirmed during backlog review session: `2026-03-03`
- Next scheduled review window: `2026-04-01` to `2026-04-07`
