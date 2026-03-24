# ScrambleIQ Product Scope — Prototype 1

> Status: Current source of truth for product scope at end of Prototype 1.

## 1) What this prototype is designed to help a coach do

Prototype 1 is designed to help a coach run a **structured manual review loop**:

1. Capture match context.
2. Tag events and positions on a timeline.
3. Cross-check review notes with synchronized video playback.
4. Inspect deterministic analytics and validation outputs.
5. Compare collection-level trends and reliability in reports.
6. Export structured data for sharing/audit/downstream analysis.

## 2) What this prototype does not attempt to solve yet

Prototype 1 does **not** attempt to solve:

- automated event detection from video
- AI-generated tactical recommendations
- automatic competitor identity/entity resolution
- full media ingestion pipeline (upload/transcode/storage lifecycle)
- organization/multi-team permission models
- production operations concerns (SLOs, large-scale tenancy, advanced audit/security controls)

## 3) Workflow assumptions currently embedded in the prototype

Current product behavior assumes:

- Coaches are willing to annotate manually.
- Timeline event types can be managed with explicit taxonomy guardrails and manual normalization.
- One attached video metadata reference per match is sufficient for current review sessions.
- Date-range reporting with optional competitor/ruleset filters is an acceptable first reporting surface.
- Deterministic threshold-based insights are preferred over opaque “smart” automation during early validation.

## 4) Areas that must be validated before 1.0 scope is defined

Before setting a 1.0 scope, validate:

1. **Workflow fit:** Does the end-to-end review flow match real coach behavior?
2. **Annotation effort:** Is manual tagging burden acceptable relative to value?
3. **Taxonomy usability:** Are guardrails understandable and helpful?
4. **Reporting usefulness:** Are summary/trend/validation outputs actionable?
5. **Data reliability:** Are validation checks enough for confident interpretation?
6. **Entity UX:** Is competitor ID handling understandable in trend workflows?
7. **Persistence expectations:** Is in-memory fallback acceptable for local-only use, and what persistence guarantees are needed for broader rollout?

## 5) Candidate coach feedback questions

Use these questions in feedback sessions:

1. Which part of the workflow saves you the most time, and which part adds friction?
2. Which report section changes your decisions most often?
3. What information feels missing when deciding next training priorities?
4. Which annotations do you skip because they are too costly to enter?
5. Do taxonomy warnings prevent mistakes or just add noise?
6. Are trend deltas understandable without additional context?
7. Which current output would you not trust yet, and why?
8. If only three improvements could ship in 1.0, what should they be?

## 6) Boundary between implemented functionality and product ideas

- **Implemented now:** manual annotation workflows, deterministic analytics/validation/reporting, template/preset tooling, and deterministic exports.
- **Deferred for post-feedback / 1.0 planning:** automation, deeper intelligence, broader data ingestion, and larger-scale operational features.

This boundary is deliberate: Prototype 1 is for workflow truth-finding, not feature maximization.
