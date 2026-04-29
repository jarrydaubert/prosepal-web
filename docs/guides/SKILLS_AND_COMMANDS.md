# Skills & Commands System

A practical guide to using Prosepal's commands and agents-native skills.

## Overview

- **Commands** = explicit workflows you invoke, such as `/audit`.
- **Skills** = knowledge packs you load before doing a task, such as SEO, copy, CRO, frontend design, or repo cleanup.
- **Layering model**:
  - upstream methodology in `.agents/skills/*/SKILL.md`
  - shared product context in `.agents/product-marketing-context.md`
  - shared repo/project constraints in `.agents/skills/prosepal-web-context/SKILL.md`
- We do **not** maintain duplicate "vanilla + custom" skill files side-by-side.

## Where They Live

- Commands: `.claude/commands/*.md`
- Skills: `.agents/skills/*/SKILL.md`
- Versions: `.agents/skills/VERSIONS.md`
- Run history: `.agents/skills/RUN_HISTORY.md`
- Profiles: `.agents/skills/.profiles/`

## How To Use In Codex

Commands and skills should be explicitly loaded when the task depends on their procedure.

**Command pattern:**

```bash
Read .claude/commands/audit.md, then /audit homepage
```

**Skill pattern:**

```bash
Read .agents/skills/seo-audit/SKILL.md, then audit the message pages
```

You can combine skills:

```bash
Read .agents/skills/frontend-design/SKILL.md and .agents/skills/page-cro/SKILL.md,
then improve the homepage hero
```

## Commands

| Command | Purpose | Example |
| --- | --- | --- |
| `/audit` | Deep code, content, or architecture audit | `/audit homepage` |
| `/cleanup` | Find duplicates, orphans, junk, and stale docs | `/cleanup scripts` |
| `/compliance` | Compliance review | `/compliance privacy pages` |
| `/security` | Security review | `/security forms and CSP` |
| `/test` | Testing and validation workflow | `/test interaction flows` |
| `/web` | Web implementation workflow | `/web homepage polish` |

## Skills

### Shared Context

| Skill | Use When |
| --- | --- |
| `prosepal-web-context` | Apply Prosepal-specific UX, CRO, SEO, analytics, and style constraints before other skills. |

### Code & Quality

| Skill | Use When |
| --- | --- |
| `engineering` | Static-site engineering, scripts, generated artifacts, dependency fallout, and performance. |
| `codebase-cleanup-sweep` | Broad cleanup, deduplication, stale docs, unused files, and repo housekeeping. |
| `frontend-design` | Visual redesign, UI polish, and stronger page/component identity. |
| `accessibility` | WCAG 2.2 AA audits and remediation. |
| `tdd` | Red/Green/Refactor workflow for features and regressions. |
| `design-an-interface` | Compare module, script, or data-contract shapes before coding. |

### Planning & Delivery

| Skill | Use When |
| --- | --- |
| `prd-to-issues` | Break PRDs or feature plans into vertical, reviewable slices. |

### SEO & Content

| Skill | Use When |
| --- | --- |
| `seo-audit` | Technical and on-page SEO audits. |
| `ai-seo` | AI search optimization, AI Overviews, citations, and answer-engine visibility. |
| `aso-audit` | App Store optimization and mobile acquisition review. |
| `content-strategy` | Topic clusters, editorial planning, and content roadmaps. |
| `programmatic-seo` | Template-driven SEO pages at scale. |
| `schema-markup` | JSON-LD and structured data. |
| `site-architecture` | Sitemap, navigation, URL structure, and internal linking. |
| `competitor-alternatives` | Comparison and alternative pages. |
| `competitor-profiling` | Competitor research and profile documents. |

### Copy & Creative

| Skill | Use When |
| --- | --- |
| `copywriting` | New page, landing-page, or campaign copy. |
| `copy-editing` | Editing and tightening existing copy. |
| `ad-creative` | Ad copy variations and paid creative. |
| `cold-email` | B2B outbound and follow-up sequences. |
| `social-content` | LinkedIn, X, Instagram, TikTok, and content calendars. |
| `image` | Marketing images, blog heroes, social graphics, product mockups, and visual optimization. |
| `video` | Marketing video workflows, explainers, demos, and AI video prompts. |

### Conversion & Growth

| Skill | Use When |
| --- | --- |
| `page-cro` | Page-level conversion optimization. |
| `form-cro` | Lead, waitlist, support, and capture form optimization. |
| `onboarding-cro` | First-run, activation, and time-to-value flows. |
| `popup-cro` | Popups, banners, overlays, and modal conversion flows. |
| `signup-flow-cro` | Signup, registration, and trial-start flows. |
| `paywall-upgrade-cro` | Upgrade prompts, upsells, and feature gates. |
| `ab-test-setup` | Experiment design and measurement. |
| `lead-magnets` | Gated resources and opt-in offers. |
| `free-tool-strategy` | Free tools for SEO, links, and acquisition. |

### Marketing & Revenue

| Skill | Use When |
| --- | --- |
| `marketing-ideas` | Growth ideas and marketing tactics. |
| `customer-research` | VOC, persona, ICP, and qualitative research synthesis. |
| `community-marketing` | Community-led growth and advocacy. |
| `marketing-psychology` | Persuasion and behavioral science. |
| `directory-submissions` | Directory listings and backlink planning. |
| `launch-strategy` | Launch and feature announcement planning. |
| `email-sequence` | Lifecycle, onboarding, and nurture email flows. |
| `referral-program` | Referral, affiliate, and word-of-mouth programs. |
| `pricing-strategy` | Pricing and packaging strategy. |
| `revops` | Lead lifecycle, scoring, routing, and revenue operations. |
| `sales-enablement` | Decks, one-pagers, objection handling, and sales collateral. |
| `product-marketing-context` | Shared positioning and product context. |

## Maintenance

- `bun run skills:review` checks the latest upstream marketing-skills release.
- `bun run skills:check` validates the local pin/profile/install setup.
- `bun run skills:sync` syncs the pinned upstream profile and validates the result.
- Skill usage dates live in `.agents/skills/RUN_HISTORY.md`.
- Canonical keep/sync lists live in `.agents/skills/.profiles/`.
