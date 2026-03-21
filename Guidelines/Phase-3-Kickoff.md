# ScrambleIQ
## Phase 3 Kickoff
### Version 2.0 Scope Contract

## Purpose

This document defines the formal Phase 3 scope and implementation plan for ScrambleIQ.

Phase 1 and Phase 2 are complete. Phase 3 begins from a stable manual-first annotation and review platform and introduces the **smallest high-value workflow tooling expansion** aligned to coaching operations.

This kickoff is the source of truth for Phase 3 planning, sequencing, and acceptance.

---

## Current Phase Assessment

### Confirmed baseline (Phase 2 complete)

ScrambleIQ currently provides:

1. match CRUD
2. manual event timeline annotation
3. manual position timeline annotation
4. video metadata attach/edit/delete with synchronized playback seek behavior
5. derived analytics from manual annotations
6. dataset validation and deterministic JSON export
7. PostgreSQL persistence when `DATABASE_URL` is set
8. in-memory runtime fallback when `DATABASE_URL` is not set

### Closeout posture

Phase 2 closeout artifacts indicate acceptance complete with:

- goals and scenario evidence matrix consolidated
- deterministic sorting decision documented (interactive sort deferred)
- PostgreSQL integration evidence path documented
- root quality gate pass evidence documented

---

## Phase 3 Intent (Version 2.0)

Phase 3 is the first workflow-tooling expansion phase after the stable manual-first baseline.

Primary theme:

- improve coaching workflow outputs and repeatability from existing manual annotations

Secondary theme:

- increase review/reporting usefulness **without** introducing automation or major architecture churn

---

## Phase 3 Objectives

1. improve repeatability of match review sessions through reusable operator-defined workflow scaffolding
2. improve coaching handoff quality by providing richer, deterministic review summaries derived from existing data
3. improve review efficiency through saved review configurations/presets for common manual-first use patterns
4. improve annotation consistency through lightweight taxonomy/label hygiene tooling
5. maintain deterministic behavior and preserve all Phase 1/2 baseline functionality

---

## Non-Goals (Explicit Exclusions)

Phase 3 does **not** include:

1. pose estimation
2. 3D replay/reconstruction
3. automated event detection
4. machine-learning-generated coaching commentary
5. file upload pipeline, cloud storage ingestion, or transcoding workflow implementation
6. real-time/live automated analysis
7. major architecture rewrite across frontend/backend foundations
8. cross-match aggregate analytics dashboards as a primary deliverable (belongs to Phase 4 unless a small prerequisite is explicitly scoped)

---

## In-Scope Deliverables

Phase 3 includes the following constrained deliverables.

### A) Review Workflow Templates (Manual-Defined)

- allow users to define and reuse structured review templates/checklists
- templates are user-authored and deterministic (no auto-generation)
- template usage should support session consistency and operator confidence

Minimum viable contract:

- create/list/update/delete templates
- apply a template to a match review session context
- track checklist completion state during a session (manual toggles)

### B) Richer Single-Match Review Summary Outputs

- provide enhanced deterministic review summary views/exports from existing annotations/analytics
- summaries remain tied to one match/session in Phase 3

Minimum viable contract:

- include match metadata + annotation counts + timeline/position/analytics rollups
- include validation readiness status and known issue counts
- deterministic structured output format for handoff/report use

### C) Saved Views/Presets for Review Patterns

- introduce user-selectable saved review presets for common filters/layouts
- presets apply existing query/filter/display configurations; no hidden inference

Minimum viable contract:

- save preset
- load preset
- delete preset
- deterministic preset application behavior with clear active state

### D) Taxonomy/Label Hygiene Guardrails

- introduce constrained consistency tooling for manual labels/tags used during annotation
- prioritize warning/normalization assistance over forced migration

Minimum viable contract:

- detect label variants/conflicts against configured canonical list
- provide actionable warning messages
- support explicit operator-driven normalization action(s)

---

## Deferred to Later Phases

The following are intentionally deferred beyond Phase 3:

1. cross-match and collection-level aggregate trend reporting (Phase 4)
2. team/gym-level analytics operations (Phase 4)
3. media preparation and clip/bookmark preparation workflows (Phase 5)
4. ingestion/automation and ML assistance tracks (Phase 6 research)

---

## Acceptance Criteria

Phase 3 is accepted only when all criteria below are met.

### Product Alignment Criteria

1. manual-first operating model remains intact
2. no excluded automation/ML/video-processing scope is introduced
3. Phase 1/2 workflows remain stable and backward-compatible

### Workflow Template Criteria

1. users can create, edit, delete, and apply review templates without backend/runtime mode regression
2. template-driven checklist execution is clear and manually controllable
3. template application does not alter annotation data unless explicitly user-initiated

### Summary/Reporting Criteria

1. enhanced review summary output is deterministic for equivalent dataset state
2. summary content is coaching-handoff oriented and derived only from existing manual/derived data
3. summary generation handles incomplete datasets with explicit readiness/warning messaging

### Preset Criteria

1. users can persist and recall common review configurations
2. applying a preset is transparent (active preset visible) and reversible
3. preset behavior is stable across page reloads and both persistence modes

### Taxonomy Hygiene Criteria

1. label inconsistency detection surfaces actionable warnings
2. normalization actions are explicit and auditable
3. consistency tooling reduces ambiguity without imposing hidden remapping

### Quality and Reliability Criteria

1. no blocking regressions in core match/annotation/video-sync/validation/export behavior
2. repository quality gates pass:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
3. integration quality gate for API persistence behavior remains passing in CI:
   - `npm run test:integration`

---

## Workstreams (Parallelizable)

Phase 3 implementation is divided into modular workstreams to reduce conflicts.

### Workstream 1: Domain Contract and Data Model Additions

Focus:

- shared DTO/schema contracts for templates, presets, and summary payloads
- backend persistence abstractions compatible with PostgreSQL + in-memory modes

Artifacts:

- `packages/shared` type contracts
- API module scaffolding + migrations (if required)
- in-memory repository parity

### Workstream 2: Template + Checklist API and UI

Focus:

- CRUD and apply flows for review templates
- match detail integration for checklist execution state

Artifacts:

- API endpoints/service tests
- web feature module (`features/templates` or equivalent)
- UI tests for create/apply/complete flows

### Workstream 3: Review Summary Output Enhancements

Focus:

- deterministic single-match summary composition
- UI presentation + export-ready structured output

Artifacts:

- summary service extensions and tests
- UI panel/report component tests
- contract tests for deterministic output order/content

### Workstream 4: Saved Review Presets

Focus:

- preset persistence + apply lifecycle
- predictable activation/deactivation UX

Artifacts:

- preset API + repository tests
- web feature for save/load/delete + active state
- regression tests for preset restore behavior

### Workstream 5: Taxonomy Hygiene

Focus:

- canonical taxonomy configuration surface
- inconsistency detection + manual normalization actions

Artifacts:

- validation/hygiene service tests
- UI warning/remediation components
- explicit action logging or deterministic state-change assertions

### Workstream 6: Cross-Cutting Hardening and Documentation

Focus:

- regression test expansion for existing critical flows
- docs refresh and evidence traceability for closeout

Artifacts:

- updated `README.md` only if setup/runtime behavior changes
- Phase 3 evidence and closeout docs (to be created during delivery)

---

## Ordered Implementation Plan (Constrained Slices)

Implement in thin vertical slices, each independently reviewable.

1. **Slice 1: Contracts + Persistence Foundations**
   - shared types + backend repository interfaces + migrations (if needed)
   - no end-user UI yet
2. **Slice 2: Template CRUD + Basic Apply (single match context)**
   - end-to-end minimal template lifecycle
3. **Slice 3: Checklist Execution UI (manual completion tracking)**
   - focus on in-session coaching flow repeatability
4. **Slice 4: Summary Output v1 (single-match deterministic report payload + UI)**
   - enrich reporting value without cross-match expansion
5. **Slice 5: Saved Presets v1 (save/load/delete + visible active preset)**
   - includes deferred interactive sorting only as a preset-consumable configuration if implemented
6. **Slice 6: Taxonomy Hygiene v1 (warnings + explicit normalization action)**
   - no hidden auto-correction
7. **Slice 7: Regression hardening + docs closeout alignment**
   - add/refresh tests and formal evidence mapping

---

## Sequencing Guidance

1. land shared contracts before UI integrations to avoid parallel drift
2. land API-first minimal vertical paths for each feature area before UX refinements
3. keep each slice backward-compatible with existing match detail workflows
4. avoid touching unrelated modules in the same PR
5. gate each slice with deterministic tests and explicit scope checks against non-goals

---

## Test Expectations for Phase 3 Delivery

Every Phase 3 implementation PR should run the root quality gates from repository root:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:integration`

Additional expectations:

1. add unit/integration coverage for each new API/service behavior
2. add UI interaction coverage for each new workflow surface
3. include deterministic-order assertions where output/report ordering matters
4. include regression tests for Phase 1/2 critical paths impacted by touched files

---

## Documentation Expectations

For Phase 3 implementation PRs:

1. update `README.md` only when developer setup/runtime behavior changes
2. maintain an evidence mapping artifact tying implemented behavior to Phase 3 acceptance criteria
3. document any ambiguity resolution using the smallest manual-first assumption
4. record explicit defer decisions when requested work falls into later phases

---

## Assumptions and Conservative Interpretations

1. roadmap Phase 3 wording (“workflow tooling expansion”) is interpreted as **single-session and single-match coaching workflow improvements**, not cross-match analytics expansion
2. Phase 2 deferred interactive sorting is eligible only as a small supporting capability within presets, not as a standalone broad discovery redesign
3. cross-match analytics/reporting remains Phase 4 unless minimal prerequisite plumbing is required for Phase 3 in-scope features
4. no new media ingestion/upload/transcoding scope is required to deliver Phase 3 objectives

---

## Exit Gate

Phase 3 is complete when:

1. all in-scope deliverables meet acceptance criteria,
2. excluded scope remains excluded,
3. required quality and integration gates pass,
4. and documentation/evidence artifacts are complete and auditable.
