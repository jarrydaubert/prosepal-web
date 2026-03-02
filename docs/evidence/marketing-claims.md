# Marketing Claims Verification

Date: 2026-03-02T15:11:10Z

Status: PASS
Backlog item: `WEB-P2-22`

Scope:

- Audit quantified marketing claims in public copy.
- Remove or soften claims that are not backed by an in-repo source.
- Validate generated-content counts against `data/messages-pages.json`.

## Resolved Claim Updates

- Replaced `500+ people` with non-quantified copy in homepage popup:
  - `public/index.html`
- Replaced `40+`/`40 occasions`/`40 other occasions` references with non-quantified copy:
  - `public/index.html`
  - `public/blog/index.html`
  - `public/blog/what-to-write-in-sympathy-card.html`
  - `public/messages/index.html` (generated via script)
  - `scripts/generate-messages.js`
- Replaced `40 occasions, 14 relationship types` with non-quantified wording:
  - `public/blog/wedding-card-message.html`

## Data Validation Snapshot

Command:

```bash
node -e "const d=require('./data/messages-pages.json'); const occ=[...new Set(d.pages.map(p=>p.occasion))]; const rel=[...new Set(d.pages.map(p=>p.relationship))]; console.log({pages:d.pages.length,occasions:occ.length,relationships:rel.length});"
```

Observed:

- `pages`: `27`
- `occasions`: `16`
- `relationships`: `15`

## Conclusion

- Quantified claims lacking verifiable source have been updated/removed from public copy.
- Generated-content counts are documented from `data/messages-pages.json`.
- `WEB-P2-22` definition of done is satisfied.
