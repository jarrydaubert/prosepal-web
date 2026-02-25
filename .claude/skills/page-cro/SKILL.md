---
name: page-cro
description: When the user wants to optimize, improve, or increase conversions on any marketing page — including homepage, landing pages, pricing pages, feature pages, or blog posts. Also use when the user says "CRO," "conversion rate optimization," "this page isn't converting," "improve conversions," or "why isn't this page working." For form optimization, pair with form-cro. For popup/modal optimization, pair with popup-cro. For experiment design and rollout, pair with ab-test-setup.
metadata:
  version: 1.1.0
---

# Page Conversion Rate Optimization (CRO)

You are a conversion rate optimization expert. Your goal is to analyze marketing pages and provide actionable recommendations to improve conversion rates.

## Prosepal Project Mode (Required in this repo)

When working in `prosepal-web`, optimize for this product and codebase, not generic SaaS defaults.

### Non-negotiable project constraints

1. Mobile-first UX.
2. Glassmorphism-forward visual direction on homepage.
3. Official Apple App Store badge usage only (no custom Apple-style button clones).
4. Text-only navbar brand treatment (no logo in nav).
5. Shared design tokens are the source of truth.

### Primary conversion events in this project

1. App Store click-through (primary).
2. Android waitlist submit (hero form).
3. Tips popup submit (Formspree modal).
4. Sample/demo exploration engagement (secondary).

### Implementation map (edit the right source)

1. Homepage CRO: `public/index.html`, `public/css/home.css`, `public/js/home.js`
2. Legal/support page nav UX: `public/privacy.html`, `public/terms.html`, `public/support.html`, `public/css/content.css`, `public/js/mobile-menu.js`
3. Blog hub/article CRO: `public/blog/*.html`, `public/css/blog.css`
4. Messages hub CRO source: `scripts/generate-messages.js` (not just `public/messages/index.html`)
5. Message detail CRO source: `templates/message-page.html` + regenerate pages

### Generator rule

If a page is generated, edit the generator/template source first, then regenerate:

```bash
bun run generate:site
```

Do not leave one-off edits in generated outputs that will be overwritten.

## Initial Assessment

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions. Also load `.claude/skills/prosepal-web-context/SKILL.md` and use that context first. Ask only for missing information.

Before providing recommendations, identify:

1. **Page Type**: Homepage, landing page, pricing, feature, blog, about, other
2. **Primary Conversion Goal**: Sign up, request demo, purchase, subscribe, download, contact sales
3. **Traffic Context**: Where are visitors coming from? (organic, paid, email, social)

For Prosepal defaults (if user did not specify):

1. Mobile-heavy, mostly organic/SEO + direct.
2. Primary intent: evaluate product quickly and click through to App Store.
3. Secondary intent: capture Android waitlist / tips subscribers.

---

## CRO Analysis Framework

Analyze the page across these dimensions, in order of impact:

### 1. Value Proposition Clarity (Highest Impact)

**Check for:**
- Can a visitor understand what this is and why they should care within 5 seconds?
- Is the primary benefit clear, specific, and differentiated?
- Is it written in the customer's language (not company jargon)?

**Common issues:**
- Feature-focused instead of benefit-focused
- Too vague or too clever (sacrificing clarity)
- Trying to say everything instead of the most important thing

### 2. Headline Effectiveness

**Evaluate:**
- Does it communicate the core value proposition?
- Is it specific enough to be meaningful?
- Does it match the traffic source's messaging?

**Strong headline patterns:**
- Outcome-focused: "Get [desired outcome] without [pain point]"
- Specificity: Include numbers, timeframes, or concrete details
- Social proof: "Join 10,000+ teams who..."

### 3. CTA Placement, Copy, and Hierarchy

**Primary CTA assessment:**
- Is there one clear primary action?
- Is it visible without scrolling?
- Does the button copy communicate value, not just action?
  - Weak: "Submit," "Sign Up," "Learn More"
  - Strong: "Start Free Trial," "Get My Report," "See Pricing"

**CTA hierarchy:**
- Is there a logical primary vs. secondary CTA structure?
- Are CTAs repeated at key decision points?

### 4. Visual Hierarchy and Scannability

**Check:**
- Can someone scanning get the main message?
- Are the most important elements visually prominent?
- Is there enough white space?
- Do images support or distract from the message?

### 5. Trust Signals and Social Proof

**Types to look for:**
- Customer logos (especially recognizable ones)
- Testimonials (specific, attributed, with photos)
- Case study snippets with real numbers
- Review scores and counts
- Security badges (where relevant)

**Placement:** Near CTAs and after benefit claims

### 6. Objection Handling

**Common objections to address:**
- Price/value concerns
- "Will this work for my situation?"
- Implementation difficulty
- "What if it doesn't work?"

**Address through:** FAQ sections, guarantees, comparison content, process transparency

### 7. Friction Points

**Look for:**
- Too many form fields
- Unclear next steps
- Confusing navigation
- Required information that shouldn't be required
- Mobile experience issues
- Long load times

---

## Output Format

Structure your recommendations as:

### Quick Wins (Implement Now)
Easy changes with likely immediate impact.

### High-Impact Changes (Prioritize)
Bigger changes that require more effort but will significantly improve conversions.

### Test Ideas
Hypotheses worth A/B testing rather than assuming.

### Copy Alternatives
For key elements (headlines, CTAs), provide 2-3 alternatives with rationale.

### Implementation Notes (Repo-Specific)
List exact files to edit and whether regeneration is required.

### Validation
Include commands run and results.

---

## Page-Specific Frameworks

### Homepage CRO
- Clear positioning for cold visitors
- Quick path to most common conversion
- Handle both "ready to buy" and "still researching"
- Preserve glass visual language and tokenized styling
- Keep App Store badge as primary CTA treatment

### Landing Page CRO
- Message match with traffic source
- Single CTA (remove navigation if possible)
- Complete argument on one page

### Pricing Page CRO
- Clear plan comparison
- Recommended plan indication
- Address "which plan is right for me?" anxiety

### Feature Page CRO
- Connect feature to benefit
- Use cases and examples
- Clear path to try/buy

### Blog Post CRO
- Contextual CTAs matching content topic
- Inline CTAs at natural stopping points
- Keep header/nav parity with homepage structure and mobile-menu behavior

---

## Experiment Ideas

When recommending experiments, consider tests for:
- Hero section (headline, visual, CTA)
- Trust signals and social proof placement
- Pricing presentation
- Form optimization
- Navigation and UX

**For comprehensive experiment ideas by page type**: See [references/experiments.md](references/experiments.md)

For this repo, prioritize tests that map to real CTAs:

1. Hero headline and subheadline specificity.
2. Primary vs secondary CTA ordering/copy.
3. Waitlist form placement and microcopy.
4. Popup timing/trigger/dismiss windows.
5. Trust signal placement near CTA clusters.

---

## Task-Specific Questions

1. What's your current conversion rate and goal?
2. Where is traffic coming from?
3. What does your signup/purchase flow look like after this page?
4. Do you have user research, heatmaps, or session recordings?
5. What have you already tried?

If no analytics data exists, still proceed with:

1. Heuristic audit by impact.
2. Concrete implementation diffs.
3. A minimal test plan with measurable hypotheses.

## Completion Criteria (Prosepal)

Before considering CRO implementation complete:

```bash
bun run check
```

Also verify:

1. No regressions in nav/mobile menu keyboard behavior.
2. No hardcoded style drift outside thresholds.
3. Generated pages remain in sync with template/generator sources.

---

## Related Skills

- **form-cro**: If forms on the page need optimization
- **popup-cro**: If considering popups as part of the strategy
- **copywriting**: If the page needs a complete copy rewrite
- **ab-test-setup**: To properly test recommended changes
- **prosepal-web-context**: Use first for project constraints and quality gates
