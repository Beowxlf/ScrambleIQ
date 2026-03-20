# Phase 2 Acceptance Evidence Matrix

## Purpose

This document provides a single auditable artifact that maps **Phase 2 goals and acceptance scenarios** (from `Guidelines/Phase-2-Kickoff.md`) to:

1. implemented behavior in the current repository
2. automated coverage that exercises that behavior
3. command-based validation evidence
4. current assessment (`PASS` or `PARTIAL`)

This is a documentation-only evidence snapshot for the current repo state.

---

## Scope and audit method

- **Source acceptance contract:** `Guidelines/Phase-2-Kickoff.md`
- **Evidence sources reviewed:**
  - frontend implementation (`apps/web/src/**`)
  - backend implementation (`apps/api/src/**`)
  - frontend tests (`apps/web/tests/**`)
  - backend tests (`apps/api/test/**`)
  - repo quality-gate scripts (`package.json`)
- **Validation commands executed for this evidence update:**
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

Status legend:

- **PASS** = behavior + automated evidence exists and aligns to current Phase 2 scope.
- **PARTIAL** = behavior exists, but evidence has notable gaps, ambiguity, or environment dependency.

---

## Phase 2 goals matrix

| Phase 2 goal (`Phase-2-Kickoff`) | Implemented behavior evidence | Automated coverage evidence | Command/validation evidence | Status | Notes |
|---|---|---|---|---|---|
| 1) Increase annotation throughput | Event repeated-entry flow keeps common defaults while clearing timestamp/notes; event form supports keyboard submit (`Ctrl/Cmd+Enter`). Position entry pre-seeds adjacent start/end timestamps and carries common fields for rapid back-to-back entry. | `apps/web/tests/event-panel.test.tsx`, `apps/web/tests/timeline-events.ui.test.tsx`, `apps/web/tests/position-states.ui.test.tsx` | Quality gates executed in this update (`lint`, `typecheck`, `test`, `build`) | PASS | Throughput behaviors are implemented in UI hooks/forms and covered in panel + app-level tests. |
| 2) Reduce friction for create/edit/delete operations | Event and position hooks include sorted list updates after create/edit/delete, inline validation, stale-resource handling, and user-facing error messaging. | `apps/web/tests/event-panel.test.tsx`, `apps/web/tests/position-panel.test.tsx`, `apps/api/test/matches.e2e.test.ts` | Quality gates executed in this update | PASS | Evidence includes both frontend interaction tests and backend contract tests for CRUD/error paths. |
| 3) Improve review/navigation clarity | Match detail workspace adds quick section navigation, active seek status text, and active seek highlighting in event/position timeline controls. | `apps/web/tests/match-detail-page.test.tsx`, `apps/web/tests/event-panel.test.tsx`, `apps/web/tests/position-panel.test.tsx` | Quality gates executed in this update | PASS | Evidence demonstrates seek actions, active state (`aria-pressed`), and navigation controls. |
| 4) Make validation/export outcomes easier to understand | Dataset tools panel provides readiness guidance messaging, grouped validation issue rendering by severity, and deterministic export action flow. Backend export deterministically sorts events/positions before returning JSON. | `apps/web/tests/dataset-tools-panel.test.tsx`, `apps/api/test/matches.e2e.test.ts`, `apps/api/test/dataset-validation.service.test.ts` | Quality gates executed in this update | PASS | UI and API evidence both support validation clarity and deterministic export behavior. |
| 5) Strengthen reliability via broader critical-flow coverage | Broad tests cover match discovery, annotation CRUD, review seek, validation/export endpoints, and analytics refresh behavior. | `apps/web/tests/app.test.tsx`, `apps/web/tests/match-list-page.test.tsx`, `apps/api/test/matches.e2e.test.ts` | Quality gates executed in this update | PARTIAL | Default `npm run test` does not include `apps/api/test/integration/**`, so persistence-critical integration checks are separate/environment-dependent. |

---

## Acceptance scenario evidence matrix

### 1) Event repeated entry and annotation throughput (Scenario 1: Fast Event Entry)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Minimal repeated input for sequential event entry | `apps/web/src/features/events/useMatchEvents.ts` (`toRepeatedEntryValues`, `submitMode=addAnother`, form reset behavior), `apps/web/src/features/events/EventForm.tsx` (`Create & Add Another`) | PASS | Timestamp/notes are reset, while event type + competitor are retained for repeated entry. |
| Rapid entry shortcuts without losing form control | `apps/web/src/features/events/EventForm.tsx` (`Ctrl/Cmd+Enter` submit handling) | PASS | Keyboard submit supports fast annotation from notes field. |
| Stable timeline update and save feedback after repeated adds | `apps/web/tests/event-panel.test.tsx`, `apps/web/tests/timeline-events.ui.test.tsx` | PASS | Tests verify repeated creation calls and resulting rendered timeline entries. |

### 2) Position throughput and adjacent segment ergonomics (Scenario 2: Fast Position Entry)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Streamlined consecutive position entry | `apps/web/src/features/positions/useMatchPositions.ts` (post-create carry-forward + adjacent defaults) | PASS | On create, UI keeps position + top competitor and seeds next segment timestamps from created end. |
| Adjacent timestamp ergonomics for new entries | `apps/web/src/features/positions/useMatchPositions.ts` (`createAdjacentDefaults`, `startCreatePosition`) | PASS | New form starts at previous segment end and auto-fills end+1 for manual-first continuity. |
| Validation and overlap protection for quality | `apps/web/tests/position-panel.test.tsx`, `apps/web/tests/position-states.ui.test.tsx`, `apps/api/test/matches.e2e.test.ts` (`rejects overlapping position segments`) | PASS | Coverage includes UI validation states and backend overlap rejection behavior. |

### 3) Review navigation and active seek clarity (Workstream B + Scenario 5 usability signals)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Clear active seek feedback during review | `apps/web/src/pages/MatchDetailPage.tsx` (`activeSeekSummary`, `role=status`) | PASS | Status text explicitly communicates source (event/position) and target timestamp. |
| Quick navigation among review sections | `apps/web/src/pages/MatchDetailPage.tsx` (jump buttons + `scrollIntoView`) | PASS | Quick nav actions are visible and test-covered. |
| Active selection clarity in dense timelines | `apps/web/src/features/events/EventList.tsx`, `apps/web/src/features/positions/PositionList.tsx` (`aria-pressed` on selected item) and `apps/web/tests/match-detail-page.test.tsx` | PASS | Selected event/position buttons show active state after seek requests. |

### 4) Dataset validation and export clarity (Scenario 3: Clear Dataset Validation Feedback)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Validation output is specific/actionable | `apps/web/src/features/dataset/DatasetValidationReport.tsx` (severity grouping, per-issue context rendering), `apps/api/src/matches/dataset-validation.service.ts` | PASS | UI presents grouped severities and issue context payloads when available. |
| Readiness and remediation clarity before export | `apps/web/src/features/dataset/DatasetToolsPanel.tsx` (readiness messaging across valid/invalid/error/not-run states) | PASS | Export guidance changes based on validation state and blocking issue presence. |
| Deterministic export behavior remains intact | `apps/api/src/matches/matches.service.ts` (`exportDataset` sorted events/positions), `apps/api/test/matches.e2e.test.ts` (`returns structured match dataset export`) | PASS | API export output ordering is deterministic by timestamp and timestampStart. |

### 5) Match discovery and filtering (Scenario 4: Easy Match Discovery and Filtering)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Search/filter controls are understandable and responsive | `apps/web/src/components/MatchList.tsx`, `apps/web/src/hooks/useMatches.ts` | PASS | UI exposes competitor/date/video filters, paging, and visible totals/page state. |
| Backend filter semantics are enforced | `apps/api/src/matches/matches.service.ts` (`findAll` query filtering), `apps/api/test/matches.e2e.test.ts` (`filters matches by competitor, date range, and hasVideo`) | PASS | Filter behavior validated through e2e API coverage. |
| Discovery-to-detail transition remains straightforward | `apps/web/src/components/MatchList.tsx` (`View Match` action), `apps/web/tests/app.test.tsx` (view match flow), `apps/web/tests/match-list-page.test.tsx` | PASS | Tests cover opening match detail from list workflows. |

### 6) Critical path test coverage (Scenario 5: Stable Critical User Flows)

| Requirement | Evidence source | Current status | Notes |
|---|---|---|---|
| Core journey has automated coverage (match selection -> annotation -> validation -> export) | `apps/web/tests/app.test.tsx`, `apps/web/tests/match-detail-page.test.tsx`, `apps/api/test/matches.e2e.test.ts` | PASS | Coverage spans list/detail, CRUD, seek behaviors, validation trigger, export trigger/contracts. |
| Repository quality gates pass | root `package.json` scripts + executed commands for this evidence update | PASS | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` completed during this update. |
| Persistence-critical integration confidence in default test path | `apps/api/vitest.config.ts` (`exclude: test/integration/**/*.test.ts`), root `package.json` (`test:integration`) | PARTIAL | Integration tests exist but are not part of default `npm run test`; full persistence evidence is environment-dependent and requires separate integration execution path. |

---

## Command evidence snapshot (this documentation update)

| Command | Purpose | Result |
|---|---|---|
| `npm run lint` | Repo lint quality gate | PASS |
| `npm run typecheck` | Repo type-safety quality gate | PASS |
| `npm run test` | Workspace automated test gate | PASS |
| `npm run build` | Workspace build gate | PASS |

---

## Remaining ambiguity and evidence gaps

1. **Default test gate vs integration coverage remains split.**
   - `npm run test` does not execute API integration tests under `apps/api/test/integration/**`.
   - This means full persistence-path evidence is not guaranteed by the default Phase 2 quality gate command set.

2. **“Measurably easier” acceptance language is only indirectly evidenced.**
   - Current evidence shows implemented ergonomics and behavioral tests, but does not include benchmark-style timing/interaction telemetry.
   - This matrix therefore treats functional behavior + automated coverage as acceptance evidence for throughput claims.

3. **No single canonical “Phase 2 complete” checklist existed before this artifact.**
   - Evidence was distributed across implementation files, tests, and prior review docs.
   - This document consolidates those sources into one auditable map.

---

## Assumptions used in this matrix

1. `Guidelines/Phase-2-Kickoff.md` is the acceptance source of truth for Phase 2 goals/scenarios.
2. Evidence should prioritize implemented code and committed automated tests over historical planning intent.
3. “Critical path coverage” refers to core manual-first workflows called out in Phase 2 and existing testing docs.
4. This matrix reports repo-current evidence only; it does not claim future or unimplemented acceptance items.
