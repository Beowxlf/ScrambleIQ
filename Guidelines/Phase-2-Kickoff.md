# ScrambleIQ
## Phase 2 Kickoff
### Version 1.1 Acceptance Contract

## Purpose

This document defines the scope and acceptance criteria for ScrambleIQ Phase 2.

Phase 1 is complete as a manual-first grappling annotation platform. Phase 2 is an incremental refinement phase focused on workflow speed, editing efficiency, review clarity, and critical flow reliability.

This document is the source of truth for Phase 2 implementation planning and acceptance.

---

## Baseline (What Is Already Implemented)

Phase 2 planning assumes the current platform baseline includes:

1. manual match CRUD
2. manual event timeline annotation
3. manual position timeline annotation
4. video metadata management with synchronized playback behavior
5. derived analytics from manual annotations
6. dataset validation and deterministic JSON export
7. PostgreSQL persistence (with existing runtime behavior)

Phase 2 must build on this baseline and keep workflows manual-first.

---

## Phase 2 Goals

Phase 2 goals are:

1. increase annotation throughput for operators during active review sessions
2. reduce friction for create/edit/delete annotation operations
3. improve review and navigation clarity across matches and timelines
4. make validation and export outcomes easier to understand and act on
5. strengthen reliability through broader test coverage of critical user flows

---

## Phase 2 Boundaries

### In Scope

Phase 2 includes:

1. annotation throughput improvements
2. lower-friction editing workflows
3. clearer review/navigation workflows
4. better validation/export clarity
5. stronger test coverage on critical manual-first flows

### Out of Scope (Explicit Exclusions)

Phase 2 excludes:

1. machine learning features
2. pose estimation
3. 3D replay
4. automated event detection
5. file upload pipeline work
6. major architecture rewrites

---

## Workstreams

To support parallel implementation, Phase 2 is divided into focused workstreams.

### Workstream A: Annotation Throughput and Entry Ergonomics

Focus:

- faster event and position entry
- lower click depth and reduced repeated input effort
- workflow shortcuts that preserve data quality and auditability

Potential implementation directions (non-prescriptive):

- keyboard-assisted entry where appropriate
- smarter defaults and carry-forward values for repeated fields
- reduced modal/form friction for common add/edit actions

### Workstream B: Editing Confidence and Timeline Navigation

Focus:

- easier correction of existing annotations
- faster navigation across dense timelines
- clearer session-level context when reviewing event/position data

Potential implementation directions (non-prescriptive):

- clearer timeline navigation anchors and seek behaviors
- improved list/timeline scanning affordances
- safer edit/delete affordances with clear state feedback

### Workstream C: Validation and Export Clarity

Focus:

- validation outputs that are actionable for operators
- clearer remediation paths before export
- preserved deterministic export behavior

Potential implementation directions (non-prescriptive):

- grouped validation issue reporting with severity/field context
- direct links from issues to affected records where feasible
- clearer successful export confirmation and file/context metadata

### Workstream D: Critical Flow Hardening and Test Coverage

Focus:

- stronger confidence in high-value user journeys
- reduced regression risk during throughput/usability enhancements

Potential implementation directions (non-prescriptive):

- expanded unit/integration coverage for annotation, validation, and export flows
- explicit regression checks for synchronized playback and timeline interactions
- improved test fixture realism for longer/manual-heavy sessions

---

## Acceptance Criteria

Phase 2 is accepted only when all criteria below are met.

### Product Alignment Criteria

1. manual-first operating model remains intact
2. existing Phase 1 capabilities remain functional
3. no out-of-scope items are introduced into production scope

### Workflow Improvement Criteria

1. event and position entry flows require fewer repetitive interactions for common annotation tasks
2. editing flows are measurably easier to execute and recover from (for example, clearer state/feedback and lower ambiguity)
3. review/navigation across match data is clearer for users handling dense annotation timelines

### Validation/Export Criteria

1. validation feedback is clear enough for users to identify what failed and why
2. users can determine what action is needed to resolve validation issues
3. successful exports remain deterministic and clearly confirmed

### Quality and Reliability Criteria

1. critical manual-first flows have stronger automated test coverage than Phase 1 baseline
2. no regressions in core CRUD, timeline sync, validation, and export behaviors
3. repository quality gates pass:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`

---

## User-Facing Acceptance Scenarios

The scenarios below define concrete acceptance behavior for implementation teams and reviewers.

### Scenario 1: Fast Event Entry

Given a coach reviewing a match timeline,
when they add multiple event annotations in sequence,
then each subsequent event can be entered with minimal repeated input,
and the workflow supports rapid entry without breaking timeline/video synchronization.

Acceptance signals:

- reduced interaction overhead for repeated event creation
- clear confirmation that each event was saved
- timeline and playback remain stable after rapid additions

### Scenario 2: Fast Position Entry

Given a coach logging position changes during review,
when they enter position annotations back-to-back,
then entry is streamlined for common repeated fields,
and updates are immediately reflected in the position timeline state.

Acceptance signals:

- reduced friction for consecutive position entries
- clear visual confirmation of inserted/updated positions
- stable timeline seek behavior after edits

### Scenario 3: Clear Dataset Validation Feedback

Given a session with incomplete or inconsistent annotation data,
when the user runs validation,
then the system clearly reports what records failed and why,
and the user can determine the next corrective step before re-validating/exporting.

Acceptance signals:

- validation messages are specific and actionable
- issue context points to affected records/fields
- users can iteratively fix and re-run validation with predictable results

### Scenario 4: Easy Match Discovery and Filtering

Given many stored matches,
when the user searches, filters, or sorts matches,
then they can quickly locate the target match and open it for review/editing,
without losing confidence in what result set is currently displayed.

Acceptance signals:

- filtering/search behavior is understandable and responsive
- visible result state and empty-state handling are clear
- transition from discovery list to match detail/edit flow is straightforward

### Scenario 5: Stable Critical User Flows

Given routine coaching operations,
when users execute the core journey (match selection -> annotation -> validation -> export),
then the flow completes reliably under normal usage patterns,
and core behaviors remain consistent across repeated sessions.

Acceptance signals:

- no blocking regressions in core manual workflows
- synchronized playback/timeline interactions remain dependable
- validation and export outcomes remain deterministic

---

## Delivery and Review Notes

1. Phase 2 should be delivered in small, reviewable increments aligned to the workstreams above.
2. Each implementation PR should map to one or more acceptance criteria/scenarios in this document.
3. If scope ambiguity occurs, choose the smallest manual-first incremental behavior and document it in the PR.
4. Any proposed deviation from exclusions requires explicit follow-up scope approval and a separate design document.

---

## Exit Gate

Phase 2 is complete when:

1. in-scope workstreams deliver against the acceptance criteria above,
2. user-facing acceptance scenarios are satisfied,
3. quality gates pass,
4. and out-of-scope features remain excluded.
