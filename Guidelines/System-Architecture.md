# ScrambleIQ System Architecture

> Status: Current source of truth for **Prototype 1** (end-of-prototype state).

## 1) High-level architecture

ScrambleIQ is a TypeScript monorepo with three implemented layers:

1. **Frontend (`apps/web`)** – React application for coach-facing workflow screens.
2. **Backend (`apps/api`)** – NestJS REST API for match workflows, reporting, and validation.
3. **Shared package (`packages/shared`)** – common TypeScript interfaces/constants used by both layers.

The architecture is intentionally simple and direct for prototype learning velocity.

## 2) Monorepo structure

- `apps/web`
  - Route-level pages for match list, match detail, and reporting
  - Feature modules for events, positions, video metadata, analytics, dataset tools, templates, presets, guardrails, and reporting requests
- `apps/api`
  - Nest modules/controllers/services for matches, reporting, review templates, and review presets
  - Repository abstraction with in-memory and PostgreSQL-backed implementations
  - SQL migrations for relational schema when using PostgreSQL
- `packages/shared`
  - Match, event, position, video, analytics, validation, review template/preset, and reporting contracts

## 3) Key domain entities (implemented)

Core entities currently modeled in code:

- `Match`
- `TimelineEvent`
- `PositionState`
- `MatchVideo` (metadata reference for one attached video per match)
- `ReviewTemplate` and checklist items
- `SavedReviewPreset`

Derived/reporting entities include:

- `MatchAnalyticsSummary`
- `DatasetValidationReport`
- `MatchReviewSummary`
- `CollectionReviewSummary`
- `CompetitorTrendSummary`
- `CollectionValidationReport`
- `CollectionExportPayload`

## 4) Data flow between layers

### Match workflow flow

1. User interacts with React feature panel (events/positions/video/templates/etc.).
2. Frontend hook calls API client (`matchesApi`/`reportingApi`).
3. Nest controller validates request DTO/query and routes to service.
4. Service reads/writes through repository interfaces.
5. Response is returned as shared contract shapes and rendered in UI.

### Persistence flow

- If `DATABASE_URL` is set: PostgreSQL repositories + migrations are used.
- If `DATABASE_URL` is unset: in-memory repositories are used.

The API surface is the same in both modes.

## 5) Reporting and insight generation (high level)

Reporting is implemented in backend `ReportsService` and exposed under `/reports/*` routes.

Implemented sequence:

1. Filter matches by date range and optional competitor/ruleset filters.
2. Load related events, positions, and video-presence status.
3. Build deterministic aggregates (counts, distributions, deltas, validation rollups).
4. Generate deterministic `insights: string[]` using rule thresholds (no ML/no randomness).
5. Return panel-specific payloads for frontend sections:
   - Collection Summary
   - Competitor Trends
   - Collection Validation
   - Collection Export

## 6) Intentional vs prototype-sufficient choices

### Intentional choices for this stage

- Shared contracts package to reduce frontend/backend drift.
- Deterministic output logic to keep coach review behavior explainable.
- Repository abstraction to preserve runtime flexibility (in-memory vs PostgreSQL).
- Workspace-level lint/typecheck/test/build gates.

### Prototype-sufficient (not final) choices

- Manual competitor ID entry in competitor trend UI.
- In-memory fallback for convenience despite non-persistent behavior.
- Minimal auth model (single shared API token).
- No job queue/event bus for reporting and validation; all request/response synchronous.

## 7) Explicit non-goals for Prototype 1

Not implemented in architecture/runtime:

- video upload/transcoding pipeline
- cloud media storage integration
- automated event detection
- predictive/ML analytics
- real-time live ingestion or streaming analysis

These remain post-feedback considerations, not current functionality.
