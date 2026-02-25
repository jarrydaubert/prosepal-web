# Prosepal Web Backlog

Goal: maximize SEO and organic traffic for the landing page and supporting content hubs.
Last updated: 2026-02-25.
Execution reference: `docs/WEB_REDESIGN_EXECUTION.md`.

This is the only live backlog for `prosepal-web`. Each active item must have:
- a clear next step,
- a measurable done condition,
- one owner (assign when picked up).

---

## P0 - Do Now

| ID | Work Item | Next Step | Done When |
| --- | --- | --- | --- |
| `WEB-P0-1` | Social preview validation on production | Run homepage + one blog URL through Facebook Sharing Debugger and Twitter Card Validator. Capture pass/fail notes in docs. | Production social cards are confirmed valid for both tools and any mismatches are fixed. |
| `WEB-P0-2` | Schema validation in release QA | Add a repeatable release step for Rich Results/schema.org validation on homepage + one blog + one message page. | Release checklist includes schema validation with recorded pass evidence. |
| `WEB-P0-3` | First formal tagged release process | Define initial semantic version (`v1.0.0` or agreed alternative), create a release checklist entry for tag + release notes, and execute it on the next production-ready merge. | Next production release ships with a Git tag and GitHub Release notes linked to the merged PR scope. |

## P1 - Next

| ID | Work Item | Next Step | Done When |
| --- | --- | --- | --- |
| `WEB-P1-1` | Accessibility manual regression pass | Run keyboard/focus/manual checks across homepage, messages hub, blog hub, and legal pages. Log findings and fixes. | No unresolved critical accessibility issues remain on core pages. |
| `WEB-P1-2` | Lighthouse budget enforcement | Define mobile SEO/performance thresholds and add a local repeatable command/workflow for budget checks. | Budget run exists and is part of release QA with documented thresholds. |
| `WEB-P1-3` | Canonical redirect expansion policy | Document when future campaign/alt routes require canonical redirects and add rules for current known variants if any exist. | Canonical redirect policy exists and active alternate routes comply. |
| `WEB-P1-4` | Repository licensing decision | Decide license strategy (none/proprietary notice vs OSS license), record rationale, and apply chosen license file with matching README language. | Repository has an explicit licensing posture documented and enforced by committed `LICENSE` (if open) or clear proprietary notice. |

## P2 - Later

| ID | Work Item | Next Step | Done When |
| --- | --- | --- | --- |
| `WEB-P2-1` | Verified social proof rollout | Replace placeholder social proof with verified testimonials and source notes. | Live site displays verified testimonials only. |
| `WEB-P2-2` | Aggregate rating readiness | Define minimum review-volume/verification criteria and update schema only after criteria are met. | `aggregateRating` is added with auditable real review data. |

---

## Completed Milestones Snapshot

| ID | Milestone | Status |
| --- | --- | --- |
| `WEB-DONE-1` | Metadata pipeline + tests (`scripts/lib/metadata.js`, `scripts/test-metadata.js`) | Complete |
| `WEB-DONE-2` | Automated sitemap/robots/llms generation with artifact integrity tests | Complete |
| `WEB-DONE-3` | Indexability-aware sitemap generation (`noindex` exclusion) | Complete |
| `WEB-DONE-4` | Crawler policy expansion (search/indexing vs training bots) | Complete |
| `WEB-DONE-5` | Style drift audit integrated into `bun run check` | Complete |
| `WEB-DONE-6` | Vercel project-link guard + deploy scripts (`vercel:check-link`, `deploy:prod`) | Complete |
| `WEB-DONE-7` | GitHub public-repo CI optimization (path filters, concurrency, timeout, minimal permissions) | Complete |

---

## Release QA Minimum (Local)

- `bun run check`
- `bun run test:artifacts`
- Schema validation spot-check (pending `WEB-P0-2`)
- Lighthouse mobile budget check (pending `WEB-P1-2`)
