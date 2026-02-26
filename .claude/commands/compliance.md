---
description: Privacy, consent, and marketing-claims compliance audit for prosepal-web
argument-hint: [scope]
disable-model-invocation: true
---

# /compliance - Privacy & Claims Compliance Audit

Audit the live website for policy and consent risks.

**CRITICAL INSTRUCTIONS:**
- Do not provide legal advice; provide implementation-risk findings.
- No "PASS" claims without file/UI evidence.
- Output findings directly in chat.

## Usage

```bash
/compliance
/compliance live
/compliance local
/compliance cookies
/compliance forms
/compliance claims
/compliance privacy
```

Treat `$ARGUMENTS` as scope. If omitted, run full compliance sweep on local source plus inferred live behavior.

## Scope

- Consent and analytics behavior
- Form collection and disclosure
- Privacy/terms/support content completeness
- Marketing claim language (accuracy and substantiation)

## Evidence Standard

Each finding must include:
- file path or exact UI text
- what was checked
- risk level and mitigation
- `Verified`, `Inferred`, or `Unverified`

## Checklist

### Consent & Tracking
- [ ] Non-essential analytics does not load before consent where required
- [ ] Consent/reject controls are clearly available and usable
- [ ] Consent withdrawal path exists and is discoverable
- [ ] Consent state handling is documented and consistent

### Forms & Data Handling
- [ ] Email collection copy explains purpose
- [ ] Form action endpoints are expected (for example Formspree)
- [ ] Success/error copy is honest and not misleading
- [ ] No hidden collection of sensitive fields

### Privacy / Terms / Support Pages
- [ ] Pages are linked and reachable from key entry points
- [ ] Data use, third parties, retention, and contact path are stated
- [ ] Last updated dates and scope are not stale
- [ ] Cross-links between policy pages are coherent

### Marketing Claims
- [ ] Avoid absolute claims without proof ("best", "guaranteed", "instant")
- [ ] Time/result claims are realistic and contextual
- [ ] AI-output framing avoids overpromising certainty
- [ ] CTA labels match real destination/action

## Required Output Format

### 1. Scope Reviewed
### 2. Compliance Status by Area
- Consent
- Forms
- Privacy/Terms
- Claims

### 3. Findings Table

| Issue | Severity | Location | Evidence | Recommendation |
| --- | --- | --- | --- | --- |

### 4. Follow-up Actions
- P0/P1 items for immediate backlog entry
