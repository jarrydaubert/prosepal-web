# Product Marketing Context

Last updated: 2026-03-03

## Verification Legend

- `Verified`: directly supported by this repository (site copy, scripts, docs).
- `Inferred`: plausible positioning language not fully provable from repository-only evidence.

## Product Overview

- One-liner (`Verified`): Prosepal helps people find the right words for greeting cards quickly.
- What it does (`Verified`): iOS app and web funnel for generating personalized card message options by occasion, relationship, and tone.
- Product type (`Verified`): consumer iOS app with web acquisition funnel and Android waitlist.
- Business model (`Verified`): free trial experience plus subscription billing flows.

## Target Audience

- Primary users (`Inferred`): people who send cards and struggle with blank-card anxiety.
- Primary job to be done (`Verified`): turn "I do not know what to write" into usable message drafts quickly.
- High-intent moments (`Verified`): sympathy, birthday, wedding, thank-you, graduation, new baby, retirement, and related occasions.

## Personas

- Persona 1 (`Inferred`): caring but stuck writer.
- Persona 2 (`Inferred`): efficient sender who wants quality without long writing effort.
- Product context (`Verified`): this is a B2C use case; messaging and flows are built for end users, not enterprise buyers.

## Problems and Pain Points

- Core pain (`Verified`): users know what they feel but struggle to write card wording.
- Friction reducer (`Verified`): structured inputs replace prompt-writing effort.
- Emotional risk (`Inferred`): fear of sounding generic or saying the wrong thing, especially for sympathy cards.

## Differentiation

- Positioning (`Verified`): greeting-card-specific flow rather than generic chat prompting.
- UX differentiator (`Verified`): relationship and tone selectors with multiple options output.
- Activation differentiator (`Verified`): no-signup/no-credit-card message in homepage CTA area.

## Objections and Responses

- "Will this sound generic?" (`Verified`): site copy explicitly addresses this objection.
- "Can I edit output?" (`Verified`): FAQ and feature copy frame output as editable starting points.
- "Is it only for easy occasions?" (`Verified`): strong support for hard occasions (sympathy-focused content and guides).

## Customer Language

- Preferred words (`Inferred`): heartfelt, personal, meaningful, in-your-voice, starting point.
- Phrases already present in copy (`Verified`):
  - "You know what you feel. The words just don't come."
  - "No prompt engineering. No blank-page anxiety."
  - "Get three personalized message options in under 30 seconds."

## Brand Voice

- Tone (`Inferred`): warm, empathetic, direct, and practical.
- Style cues (`Verified`): short plain-language lines, emotionally supportive framing, low jargon.

## Proof Points and Claims

- `Verified`: iOS App Store destination and app id `6757088726`.
- `Verified`: Android waitlist and tips-popup capture forms are active.
- `Verified`: subscription references and RevenueCat are documented in privacy/support pages.
- `Verified`: conversion events tracked for app store clicks, demo chip clicks, and waitlist success.
- `Inferred`: "40+ occasions" and "14 relationships" appear in copy but are not currently validated by a single canonical repo source for app capability.
- `Inferred`: "500+ people" tips-popup claim is present in copy but not backed by an in-repo analytics export.

## Goals

- Primary goal (`Verified`): drive iOS App Store clicks/download intent.
- Secondary goals (`Verified`): Android waitlist signup and tips-popup email capture.

## Source Pointers

- Homepage messaging and conversion copy: `public/index.html`
- Support and pricing/subscription FAQ: `public/support.html`
- Privacy and RevenueCat references: `public/privacy.html`
- Message corpus source data: `data/messages-pages.json`
- Conversion tracking implementation: `public/js/home.js`, `public/js/analytics.js`
- Conversion verification script: `scripts/validate-conversion-events.js`
