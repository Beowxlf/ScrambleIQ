# ScrambleIQ
## Phase 4 Kickoff
### Version 2.5 Scope Contract

## Purpose

This document defines the formal Phase 4 scope and constrained implementation plan for ScrambleIQ.

Phase 3 is complete and closed out. Phase 4 starts from an implemented manual-first foundation with workflow tooling and focuses on the **smallest high-value expansion into reporting and cross-match usefulness** that is already justified by roadmap direction.

This kickoff is the source of truth for Phase 4 planning, sequencing, and acceptance.

---

## Current Phase Assessment

### Confirmed baseline (Phase 3 complete)

ScrambleIQ currently provides:

1. match CRUD
2. manual event timeline annotation
3. manual position timeline annotation
4. video metadata attach/edit/delete with synchronized playback
5. derived analytics from manual annotations
6. deterministic dataset validation and JSON export
7. PostgreSQL-backed persistence when `DATABASE_URL` is set
8. in-memory fallback when `DATABASE_URL` is not set
9. review templates with checklist workflows
10. saved review presets with explicit apply behavior
11. richer single-match review summary
12. taxonomy hygiene guardrails with explicit normalization workflow

### Phase 4 interpretation from current roadmap

Roadmap Phase 4 (`Version 2.5`) is defined as **Reporting and Cross-Match Analysis** with deterministic, auditable outputs built from manually curated data.

Conservative interpretation for implementation:

- prioritize cross-match and recurring-review reporting value
- keep all flows operator-controlled and deterministic
- avoid architecture churn and avoid speculative analytics features

---

## Phase 4 Intent (Version 2.5)

Primary theme:

- increase coaching value beyond single-match review through deterministic cross-match summaries and reporting workflows

Secondary theme:

- improve team/gym operational usefulness from already-collected manual data without introducing automation

---

## Phase 4 Objectives

1. provide cross-match aggregate summaries from existing match/event/position/video metadata
2. provide trend-oriented views for recurring review questions (competitor-level and ruleset/date-scope comparisons)
3. provide collection-level validation/export workflows for multi-match handoff and reporting
4. preserve deterministic output ordering, explicit filters, and auditability
5. maintain backward compatibility with all Phase 1–3 capabilities

---

## Non-Goals (Explicit Exclusions)

Phase 4 does **not** include:

1. pose estimation
2. 3D replay/reconstruction
3. automated event detection
4. ML-generated coaching commentary
5. file upload pipeline, cloud storage ingestion, or transcoding implementation
6. real-time/live analysis automation
7. major architecture rewrite (frontend/router/state stack or backend platform swap)
8. speculative “advanced analytics” not directly derived from existing stored manual annotations
9. permissions/enterprise multi-tenant redesign (unless explicitly scoped in a later phase)

---

## In-Scope Deliverables

Phase 4 includes the following constrained deliverables.

### A) Cross-Match Aggregate Summary API + UI

- provide deterministic aggregate summaries across a filtered match collection
- summarize existing manual annotation data only

Minimum viable contract:

- query by date range (required) and optional competitor/ruleset filters
- deterministic totals/rollups (matches, events, positions, tracked position time, video-attached count)
- deterministic event-type and position-time distributions
- stable ordering and explicit empty-state handling

### B) Competitor-Centric Trend Snapshot (Manual Data Derived)

- provide deterministic trend snapshots for one selected competitor across filtered matches
- support coaching review questions without predictive modeling

Minimum viable contract:

- per-competitor match count and win/loss is **out of scope unless already represented explicitly in stored data**
- include event frequency and position-time trend deltas across recent windows based on available annotation data
- explicit data sufficiency messaging when sample size is low

### C) Collection-Level Validation + Export

- extend existing single-match dataset readiness concepts to filtered multi-match collections
- produce deterministic JSON artifact suitable for handoff/reporting workflows

Minimum viable contract:

- collection-level validation report with issue counts by severity/type
- deterministic collection export payload (sorted by date then match id)
- explicit inclusion of per-match validation status in aggregate output

### D) Reporting Views for Recurring Coaching Questions

- add structured reporting UI surfaces that consume A–C outputs
- focus on repeatable, coach-readable summaries and handoff artifacts

Minimum viable contract:

- report views for “period summary”, “competitor snapshot”, and “readiness summary”
- explicit filter state visibility and reset behavior
- export trigger for report JSON artifact(s) only (no document/PDF generation required in Phase 4)

---

## Deferred Beyond Phase 4

The following are intentionally deferred:

1. media preparation workflows (clip/bookmark preparation) — Phase 5 roadmap area
2. upload/storage/transcoding implementation — Phase 6 research area
3. assisted or automated annotation suggestions — Phase 6 research area
4. AI-generated narrative reporting
5. non-deterministic or black-box scoring systems

---

## Acceptance Criteria

Phase 4 is accepted only when all criteria below are met.

### Product Alignment Criteria

1. manual-first operating model remains intact
2. no excluded automation/upload/ML scope is introduced
3. Phase 1–3 workflows remain stable and backward-compatible

### Cross-Match Summary Criteria

1. users can run cross-match summaries using explicit filter inputs
2. outputs are deterministic for equivalent data and filter state
3. summary responses include clear empty-state and low-data messaging

### Competitor Trend Criteria

1. users can select a competitor and retrieve deterministic trend snapshots
2. trend values are derived only from existing manual annotations/metadata
3. trend output clearly indicates analysis window and sample-size context

### Collection Validation/Export Criteria

1. users can run collection-level validation across filtered matches
2. collection export payloads are deterministic and traceable to filter criteria
3. validation issues are surfaced with severity/type rollups and per-match context

### Reporting UX Criteria

1. report views are readable, filter-driven, and reversible (clear/reset behavior)
2. active filters are visible so report context is auditable
3. report/export actions do not mutate annotation data

### Quality and Reliability Criteria

1. no blocking regressions in existing match/annotation/video/summary/template/preset/taxonomy flows
2. repository quality gates pass:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
3. integration quality gate for API persistence behavior remains passing:
   - `npm run test:integration`

---

## Workstreams (Parallelizable)

Phase 4 implementation is divided into modular workstreams with minimal overlap.

### Workstream 1: Shared Contracts + Backend Query Foundations

Focus:

- add shared DTO/schema contracts for cross-match summaries, competitor snapshots, collection validation/export
- add backend query service + repository methods with deterministic sorting contracts

Primary files (expected):

- `packages/shared/src/index.ts`
- API service/repository modules and tests

### Workstream 2: Cross-Match Aggregate Endpoints + Tests

Focus:

- implement API endpoints for filtered collection summary + readiness rollups
- enforce deterministic output and robust validation on filter params

### Workstream 3: Competitor Trend Snapshot Endpoint + Tests

Focus:

- implement competitor-scoped trend endpoint with explicit windows/sample-size semantics
- deterministic derivations only

### Workstream 4: Collection Validation/Export Endpoint + Tests

Focus:

- implement multi-match validation and deterministic collection export output
- preserve existing single-match validation/export behavior

### Workstream 5: Reporting UI Panels (Read-Only Consumers)

Focus:

- add web feature panels for period summary, competitor snapshot, readiness summary
- consume API outputs; no hidden calculations that diverge from backend contracts

### Workstream 6: Hardening, Regression, and Closeout Documentation

Focus:

- strengthen regression tests for existing flows impacted by new shared contracts/queries
- add Phase 4 acceptance evidence and closeout checklist artifacts

---

## Ordered Implementation Plan (Constrained Slices)

Implement as thin, reviewable slices.

1. **Slice 1: Shared contracts + filter schemas + deterministic sorting rules**
   - no UI changes
2. **Slice 2: Cross-match aggregate summary API (period summary) + tests**
   - first end-to-end value path
3. **Slice 3: Collection validation rollup API + tests**
   - builds on slice 2 query surfaces
4. **Slice 4: Collection export API + tests**
   - deterministic JSON artifact for handoff
5. **Slice 5: Competitor trend snapshot API + tests**
   - scoped trend slice with explicit low-data messaging
6. **Slice 6: Reporting UI v1 (three panels) consuming completed APIs**
   - no mutation flows
7. **Slice 7: Regression hardening + docs/evidence closeout**
   - acceptance mapping + final scope audit

---

## Sequencing Guidance

1. land shared contracts and filter validation first to prevent API/UI drift
2. land API slices before UI to keep frontend integration deterministic
3. keep report UI components read-only in Phase 4 (no editing side effects)
4. isolate each slice to one primary capability to reduce merge conflicts
5. reject new scope unless required for an acceptance criterion in this document

---

## Test Expectations for Phase 4 Delivery

Every Phase 4 implementation PR should run from repository root:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:integration`

Additional expectations:

1. API tests must assert deterministic ordering and stable filter semantics
2. UI tests must assert visible active filter state and clear/reset behavior
3. collection export tests must assert deterministic payload ordering/content
4. regression tests must cover Phase 1–3 flows in touched modules

---

## Documentation Expectations

For Phase 4 implementation PRs:

1. update `README.md` only when setup/runtime behavior changes
2. add and maintain Phase 4 evidence artifacts:
   - `Guidelines/Phase-4-Acceptance-Evidence.md`
   - `Guidelines/Phase-4-Closeout-Checklist.md`
   - `Guidelines/Phase-4-DB-Evidence.md` (if persistence/runtime gate changes need explicit proof)
3. update `Guidelines/Documentation-Index.md` when new canonical documents are added
4. record ambiguity decisions using smallest manual-first assumption

---

## Assumptions and Conservative Interpretations

1. roadmap Phase 4 “team/gym-level review operations” is interpreted as deterministic collection reporting, not org-account feature expansion
2. competitor trend scope is restricted to currently available fields and manual annotation derivatives
3. collection-level export in Phase 4 remains JSON API response scope (no file pipeline)
4. reporting value is achieved through deterministic summaries, not predictive analytics
5. any requirement conflict is resolved toward smaller, testable, non-automated increments

---

## Recommended Initial Parallel Implementation Prompts

These prompts are intentionally modular to minimize file conflicts.

1. **Prompt A (API contracts foundation):** add shared types and backend DTO/filter validation for cross-match summary, competitor snapshot, and collection validation/export.
2. **Prompt B (cross-match summary API):** implement period summary endpoint + tests using contracts from Prompt A.
3. **Prompt C (collection validation/export APIs):** implement rollup validation + deterministic collection export + tests.
4. **Prompt D (competitor snapshot API):** implement competitor trend endpoint + tests with explicit sample-size messaging.
5. **Prompt E (reporting UI period/readiness panels):** implement read-only reporting panels for summary + readiness outputs.
6. **Prompt F (reporting UI competitor panel):** implement competitor snapshot panel consuming Prompt D endpoint.
7. **Prompt G (phase closeout docs hardening):** produce Phase 4 evidence/checklist artifacts after implementation slices land.

---

## Exit Gate

Phase 4 is complete when:

1. all in-scope deliverables meet acceptance criteria,
2. excluded scope remains excluded,
3. required quality and integration gates pass,
4. and documentation/evidence artifacts are complete and auditable.
