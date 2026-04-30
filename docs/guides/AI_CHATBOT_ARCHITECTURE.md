# AI Chatbot Architecture

Scope: external-review-ready product and technical architecture for an AI chatbot or guided assistant on `prosepal-web`.

## Purpose

Define the full end-to-end implementation shape for an AI chatbot experience that fits Prosepal's actual growth model, technical constraints, and public-site operating posture.

This document is intentionally broader than an implementation ticket. It is meant to support:

- external architecture review
- product and growth alignment
- backlog shaping
- future vendor and cost decisions

## Executive Summary

Recommendation:

- Do build an AI assistant for `prosepal-web`.
- Do not build a generic website chatbot.
- Build a narrow, conversion-oriented writing assistant for "what should I write?" moments.

Best-fit product concept:

- a guided card-message assistant for sympathy, apology, encouragement, birthday, wedding, thank-you, and similar moments
- optimized to generate immediate value in one session
- designed to convert users into App Store clicks, Android waitlist signups, or tips-popup capture

Why this direction is strongest:

1. It matches the current site and app positioning.
2. It creates a natural bridge from SEO landing intent to product value.
3. It is easier to evaluate than open-ended chat.
4. It reduces safety, support, and maintenance burden versus a broad website concierge bot.

Core product stance:

- assistant first
- chatbot second

The interface may look conversational, but the system should behave like a structured guided generation tool rather than a freeform help desk or brand chatbot.

## Strategic Thesis

Prosepal already attracts high-intent visitors searching for help with emotionally sensitive or hard-to-write moments. The current site converts primarily through:

- iOS App Store clicks
- Android waitlist signup
- content-assisted discovery

An AI assistant can strengthen this funnel if it does three things well:

1. Turns intent into a good first draft in under a minute.
2. Demonstrates why Prosepal is better than generic AI for card-writing moments.
3. Hands the user into the app or waitlist at the point of highest motivation.

This means the assistant should not try to answer everything about the site. It should prove product value quickly.

## Problem Statement

Current friction:

- users arrive with a specific emotional writing problem
- homepage and SEO pages explain the value proposition
- the actual "aha" moment still largely lives inside the app

Opportunity:

- let users experience a constrained, high-quality version of Prosepal on the web
- capture demand from people not ready to install immediately
- create a shareable and potentially link-worthy interactive surface

## Product Goals

Primary goals:

- increase App Store click-through from homepage and content pages
- increase Android waitlist capture for non-iOS users
- improve conversion from SEO traffic by reducing time-to-value

Secondary goals:

- improve product understanding before install
- collect high-signal prompt and intent data without storing sensitive free-text by default
- create a reusable growth surface for landing pages, experiments, and paid campaigns

Tertiary goals:

- generate learnings for future in-app AI UX
- support future free-tool or lead-magnet strategy

## Non-Goals

- not a support chatbot for billing, account issues, or app troubleshooting
- not a general-purpose LLM chat box
- not a public "ask anything" emotional advice product
- not a replacement for the app's full drafting experience
- not a document retrieval bot over the marketing site

## Recommended User Experience

### Core concept

Working name:

- Prosepal Message Assistant

Default entry prompt:

- "Tell me the occasion, your relationship, and the tone you want. I'll draft three options."

### Guided inputs

Use structured inputs before free text where possible:

- occasion
- recipient relationship
- tone
- length
- special context
- optional detail to include or avoid

This improves:

- output consistency
- safety
- analytics quality
- evaluation
- prompt construction

### Response format

The assistant should return:

1. three message options
2. one-line explanation of tone differences
3. quick actions:
   - make warmer
   - make shorter
   - make more formal
   - mention a memory
   - try another version

### Conversion handoff

After useful output, the assistant should push the next best action based on device and intent:

- iOS: App Store CTA
- Android or unknown: waitlist CTA
- hesitant users: email/tips capture

### Placement strategy

Phase 1 placement:

- homepage hero secondary action
- selected SEO pages with strong emotional or high-intent traffic

Phase 2 placement:

- blog hub
- messages hub
- selected long-tail message pages

Phase 3 placement:

- dedicated assistant landing page
- paid campaign landing pages

## Product Requirements

### Functional requirements

1. Accept structured prompt inputs plus optional free text.
2. Generate three differentiated message options per request.
3. Support lightweight follow-up transformations.
4. Respect analytics opt-out, DNT, and GPC patterns already used on the site.
5. Support device-aware conversion handoff.
6. Rate-limit usage to prevent abuse and runaway cost.
7. Avoid storing full prompt text unless explicitly approved by product policy.

### Quality requirements

1. Fast first response on mobile networks.
2. Consistent tone quality for emotionally sensitive use cases.
3. Safe refusal or redirection for harmful or inappropriate requests.
4. Clean degradation when model or vendor is unavailable.
5. No visible model/provider jargon in end-user output.

### Operational requirements

1. Vendor usage and cost controls.
2. Prompt and model versioning.
3. Experiment support.
4. Reviewable logs and metrics.
5. Minimal secret exposure on a public repo and public site.

## Architecture Decision

### Options considered

#### Option A: Fully managed agent builder

Example:

- Vertex AI Agent Builder or similar managed conversational product

Pros:

- fastest prototype path
- built-in UI and orchestration primitives
- can use existing cloud credits

Cons:

- less control over UX and response format
- risk of generic "chatbot" behavior
- harder to tightly optimize around conversion instrumentation
- future portability may be weaker

Best use:

- internal prototype
- prompt exploration
- demoing interaction quality before custom build

#### Option B: Custom thin web client plus managed LLM API

Example:

- static site UI
- serverless API for orchestration
- LLM provider behind a controlled backend

Pros:

- strongest product control
- cleanest analytics and experimentation setup
- easier to shape around conversion
- simpler vendor switching later

Cons:

- more engineering work
- requires safety and rate-limit layers
- requires explicit eval and prompt management

Best use:

- production implementation

#### Option C: Hybrid

Use managed agent tooling for prototype discovery, then ship a custom production layer.

Recommendation:

- use Option C for learning
- ship Option B for production

## Recommended Production Architecture

### High-level flow

```text
User
  -> prosepal-web chat UI
  -> secure serverless chat endpoint
  -> request validation and rate limiting
  -> prompt builder and policy layer
  -> model provider
  -> response formatter
  -> analytics and observability
  -> UI render + conversion handoff
```

### Component map

#### 1. Frontend chat shell

Location:

- static UI on `prosepal-web`

Responsibilities:

- collect structured inputs
- manage chat state locally
- stream or poll for responses
- show retry and fallback states
- fire analytics events
- render CTA handoff

Recommended constraints:

- no direct model calls from browser
- no provider keys in client
- no heavy framework migration required just for the assistant

#### 2. Chat API edge/service layer

Responsibilities:

- authenticate request origin
- rate-limit per IP/session
- apply abuse controls
- sanitize payload
- version prompts and routing
- call model vendor
- normalize output shape

Deployment options:

- Vercel serverless or edge functions if latency and vendor support fit
- separate lightweight backend if vendor SDK requirements or observability needs exceed static-site hosting comfort

Recommended stance:

- start with a small serverless backend close to the web deployment
- keep the API contract provider-agnostic

#### 3. Prompt builder and policy layer

Responsibilities:

- convert structured fields into a stable prompt contract
- inject house style and tone rules
- enforce category-specific safety behavior
- define output schema
- strip or refuse unsupported categories

This should be explicit application code, not hidden in ad hoc prompt strings.

#### 4. Model layer

Responsibilities:

- generate three candidate messages
- support short transformation follow-ups
- optionally classify user intent and handoff state

Requirements:

- good short-form writing quality
- strong instruction following
- low enough latency for consumer use

#### 5. Safety layer

Responsibilities:

- lightweight input moderation
- high-risk category detection
- output post-checks for policy-violating content
- controlled fallbacks

High-risk buckets:

- self-harm or suicide notes
- abuse, harassment, threats
- legal, medical, or crisis guidance disguised as card writing
- sexual content involving minors
- impersonation or fraud

#### 6. Analytics and experiment layer

Responsibilities:

- measure assistant usage and business impact
- support prompt, UX, and CTA experiments
- connect assistant interactions to existing funnel events

#### 7. Logging and review layer

Responsibilities:

- capture latency, failure, and aggregate usage
- optionally capture sampled prompt/response pairs only under explicit product policy
- support prompt regression review

## Detailed Request Lifecycle

### Step 1: session start

Frontend initializes:

- anonymous session id
- device classification
- attribution context
- active experiment context
- consent and tracking status

### Step 2: user input capture

Frontend sends:

- structured fields
- optional free-text detail
- page context
- device context
- session context

### Step 3: request validation

Backend checks:

- origin allowlist
- rate limits
- payload size
- schema validity
- abuse heuristics

### Step 4: prompt assembly

Backend builds:

- system prompt
- task prompt
- style constraints
- output schema requirement
- safety rules

### Step 5: model call

Backend calls vendor with:

- bounded tokens
- temperature set for controlled variety
- response schema or parsing contract

### Step 6: response normalization

Backend converts output to stable JSON:

- `messages`
- `tone_labels`
- `follow_up_actions`
- `handoff_recommendation`
- `safety_state`
- `model_version`
- `prompt_version`

### Step 7: UI render

Frontend displays:

- three message cards
- improvement chips
- copy controls
- CTA handoff

### Step 8: event emission

Frontend emits analytics events after render and on conversion actions.

## API Contract

### Request

```json
{
  "occasion": "sympathy",
  "relationship": "coworker",
  "tone": "warm",
  "length": "short",
  "details": "She lost her mother last week",
  "page_context": {
    "page_type": "home",
    "page_path": "/"
  },
  "session_context": {
    "device_type": "ios",
    "experiment_id": "assistant_entry_v1",
    "variant_id": "hero_button"
  }
}
```

### Response

```json
{
  "request_id": "req_123",
  "prompt_version": "assistant_v1",
  "model_version": "provider-model-name",
  "safety_state": "allow",
  "messages": [
    {
      "label": "Warm and simple",
      "text": "I am so sorry for your loss. Please know I am thinking of you and your family during this difficult time."
    },
    {
      "label": "Supportive and personal",
      "text": "I was so sorry to hear about your mom. I am keeping you in my thoughts and sending you strength for the days ahead."
    },
    {
      "label": "Short and gentle",
      "text": "Thinking of you with sympathy and care. I am so sorry for your loss."
    }
  ],
  "follow_up_actions": [
    "make_warmer",
    "make_shorter",
    "make_more_formal"
  ],
  "handoff_recommendation": "app_store",
  "fallback_used": false
}
```

## Prompting Strategy

### System behavior

The assistant should:

- prioritize emotional appropriateness over cleverness
- avoid overblown or theatrical language
- avoid generic motivational filler
- produce clean, card-ready copy
- preserve concise, human-sounding phrasing

### Output contract

The prompt should require:

- exactly three message options
- labeled differences in tone or style
- no markdown in final user-facing text unless UI needs it
- no mention of being an AI assistant

### Follow-up turns

Prefer stateless or lightly stateful follow-ups:

- pass prior selected message and requested transformation
- avoid long freeform chat histories
- keep context windows small for cost and reliability

## Content and Knowledge Strategy

This assistant should not depend on retrieval over the whole site for phase 1.

Why:

- the use case is generative, not search-heavy
- the public site has limited factual support content that improves message quality
- retrieval complexity would add latency without obvious benefit

Recommended grounding sources for phase 1:

- structured taxonomies:
  - occasions
  - relationships
  - tones
  - lengths
- curated style rules
- optional occasion-specific guidance snippets

Phase 2 retrieval candidates:

- curated examples from message pages
- editorial guidance snippets from content hubs

Do not:

- index the entire site and hope retrieval fixes product quality

## Data Model

### Store by default

- request id
- timestamp
- occasion
- relationship
- tone
- length
- page type
- page path
- device class
- experiment context
- latency
- provider/model id
- error and fallback state

### Store only with explicit approval

- raw free-text user details
- raw generated outputs
- conversation transcripts

Recommended default:

- no full transcript retention in production MVP
- sampled transcript capture only in controlled debug or internal-review mode

## Privacy and Compliance

Principles:

- minimize collection
- avoid direct identifiers
- do not train on sensitive user text internally without explicit policy
- align with existing analytics privacy guardrails

Specific controls:

1. Respect current site-level analytics opt-out behavior.
2. Do not ask for full names, addresses, or contact data.
3. Redact or avoid persistence of free-text details where possible.
4. Document retention periods for logs and prompts.
5. Make the assistant clearly framed as drafting help, not therapy or legal guidance.

## Security Model

### Threats

- prompt injection
- abuse and spam traffic
- scraped endpoint for free model usage
- cost blowouts
- secrets exposure in public repo or frontend
- unsafe use of privileged workflows during experimentation

### Controls

1. Provider keys only in backend secrets.
2. Rate-limit by IP, cookie, and coarse fingerprint.
3. Add bot friction if abuse rises:
   - invisible challenge
   - temporary cooldown
   - stricter unauthenticated quotas
4. Enforce strict payload schema validation.
5. Maintain provider-agnostic response parsing.
6. Keep prompt assets versioned in repo, but keep secrets out of repo.

## Safety and Trust

The assistant will operate in emotionally sensitive categories. Safety quality matters more here than in generic consumer copy generation.

Recommended policy posture:

- allow benign greeting-card help
- refuse harmful or manipulative writing requests
- redirect crisis or mental-health-risk prompts to support language
- avoid pretending to know private facts

Response design:

- calm
- brief
- non-judgmental

## Analytics and Measurement

### New event recommendations

Add these to the tracking plan before public launch:

| Event | Trigger | Required Properties |
| --- | --- | --- |
| `assistant_open` | Assistant shell opened | `entry_point`, `page_type`, `page_path` |
| `assistant_submit_start` | User sends first structured request | `occasion`, `relationship`, `tone`, `length`, `entry_point` |
| `assistant_submit_success` | Valid response rendered | `occasion`, `handoff_recommendation`, `latency_bucket`, `fallback_used` |
| `assistant_submit_error` | Response failed or timed out | `error_type`, `entry_point` |
| `assistant_message_copy` | User copies an output | `message_index`, `occasion` |
| `assistant_followup_action` | User taps a refinement control | `action`, `occasion` |
| `assistant_handoff_click` | User clicks App Store or waitlist CTA from assistant | `destination`, `entry_point`, `occasion` |

### Success metrics

Primary:

- App Store click-through rate from assistant sessions
- waitlist conversion rate from assistant sessions

Secondary:

- first-response success rate
- median response latency
- copy rate
- follow-up rate
- repeat session rate

Diagnostic:

- refusal rate
- safety intervention rate
- fallback rate
- cost per successful assistant session

## Experimentation Plan

### Phase 1 experiments

1. entry point
   - hero button vs inline widget vs modal launch
2. UX shape
   - fully guided form vs conversational first message
3. output framing
   - message cards vs chat bubbles
4. conversion handoff
   - CTA immediately under results vs after one follow-up turn

### Decision principle

Optimize for:

- conversion quality
- speed to value
- emotional usefulness

Do not optimize for:

- raw message count
- artificial chat depth

## Vendor Strategy

### Short-term recommendation

Prototype with the cloud credits and managed tooling already available if that accelerates learning, but keep production abstractions portable.

### Production recommendation

Keep three layers separable:

1. frontend assistant experience
2. orchestration and policy service
3. model provider

This preserves the ability to:

- swap providers
- tune cost/performance tradeoffs
- avoid total lock-in to one agent framework

## Cost Model

### Main cost drivers

- prompt and completion tokens
- follow-up turns
- abuse traffic
- observability and logging volume
- any managed orchestration overhead

### Cost controls

1. Tight input schema.
2. Tight output schema.
3. Limit freeform history.
4. Cap turns per session.
5. Cache static taxonomy content in prompt builder code rather than re-fetching.
6. Add usage ceilings and alerts.

### Suggested MVP operating limits

- one free initial generation
- two to three follow-up refinements
- then conversion handoff

This preserves value while preventing a free unlimited chat surface.

## UX and Design Notes

The visual language should match the site's current premium consumer direction:

- mobile-first
- modern
- intentional
- emotionally calm

Design recommendations:

- avoid a floating support bubble as the default pattern
- use a dedicated assistant panel or focused module
- keep result cards visually copy-friendly
- use clear structured choices to lower typing effort

## SEO Implications

Positive potential:

- stronger engagement on high-intent pages
- better product demonstration for search visitors
- possible future dedicated landing page for the tool

Risks:

- excessive client-side weight
- intrusive UI harming above-the-fold clarity
- thin doorway pages created only for assistant entry

Mitigations:

- keep the assistant load deferred
- place launch points where they do not harm primary page UX
- do not replace existing SEO page value with a chat box

## Reliability and Fallbacks

If model call fails:

1. show concise error state
2. offer retry
3. offer static alternative:
   - browse message examples
   - install app
   - join waitlist

If safety layer blocks:

1. explain that the assistant cannot help with that request
2. offer a nearby safe alternative when appropriate

## Recommended Rollout Plan

### Phase 0: design and evaluation

- finalize product concept
- define prompt contract
- create 50 to 100 evaluation scenarios
- define pass/fail rubric

### Phase 1: internal prototype

- use managed tooling if convenient
- test latency, output quality, and safety
- no public launch

### Phase 2: closed beta on web

- launch to a small percentage of homepage traffic or behind a query param
- instrument full event set
- review prompt and response quality manually

### Phase 3: public MVP

- homepage and one or two high-intent SEO surfaces
- strict rate limits
- controlled CTA handoff

### Phase 4: expansion

- dedicated assistant landing page
- content-page rollout
- prompt and entry-point experiments

## Implementation Backlog Shape

Suggested epic:

- Web assistant MVP for message generation and conversion handoff

Suggested workstreams:

1. product spec and prompt policy
2. backend chat orchestration
3. frontend assistant UI
4. analytics contract and tests
5. safety and abuse controls
6. evaluation harness and launch checklist

## Definition of Ready for Implementation

This initiative is ready only when:

1. Product scope is narrowed to guided message generation rather than generic site chat.
2. Success metrics are approved.
3. Model vendor and backend hosting path are chosen for MVP.
4. Prompt contract and output schema are defined.
5. Logging and privacy posture are approved.
6. A first-pass evaluation set exists.

## Definition of Done for MVP

The MVP is done only when:

1. Users can generate three quality message options from structured inputs.
2. Follow-up refinements work for the approved transformation set.
3. Safety, rate-limiting, and fallback paths are in place.
4. Analytics events are emitted and validated.
5. Conversion handoff is device-aware and measurable.
6. Load and latency are acceptable on mobile.
7. Documentation, tests, and rollout controls are in place.

## Open Questions for External Review

1. Is the narrow assistant framing strong enough, or should the product present as a broader "writing coach"?
2. Should the MVP ship on homepage only, or homepage plus selected message pages?
3. Is a managed agent platform sufficient for phase 1, or should production abstractions be built from day one?
4. What transcript retention policy best balances quality review with privacy posture?
5. What is the right free-usage cap before handoff?
6. Should assistant output quality be benchmarked against the native app before public launch?

## Final Recommendation

Build the assistant if the team is willing to treat it as a product surface, not a marketing gimmick.

Most of the upside comes from:

- narrowing the use case
- instrumenting it well
- making the handoff to Prosepal's real product explicit

Most of the downside comes from:

- generic chatbot framing
- weak cost controls
- under-specified safety and analytics

The right production bet is a guided, emotionally-aware message assistant with a custom frontend and a thin, provider-agnostic backend orchestration layer.
