# ScrambleIQ

ScrambleIQ Phase 2 (manual-first workflow refinement) is implemented and in formal closeout signoff.

This repository includes a minimal full-stack TypeScript scaffold aligned to the project tech stack:

## Phase 2 closeout status

Phase 2 closeout evidence is consolidated in:

- `Guidelines/Phase-2-Closeout-Checklist.md`
- `Guidelines/Phase-2-Acceptance-Evidence.md`
- `Guidelines/Phase-2-DB-Evidence.md`
- `Guidelines/Phase-2-Discovery-Sorting-Decision.md`

Current closeout posture:

- Root quality gates pass (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`).
- PostgreSQL evidence is represented through CI `integration-postgres` (`npm run test:integration:ci`) with local Docker validation available via `npm run test:integration`.
- Discovery sorting for Phase 2 is fixed deterministic ordering (newest `eventDate` first, stable tie-break), with interactive sorting deferred out of scope.


- Frontend: React + TypeScript + Vite (`apps/web`)
- Backend: NestJS + Node.js + TypeScript (`apps/api`)
- Shared types package: TypeScript (`packages/shared`)
- Tooling: ESLint, Prettier, Vitest, Supertest

## Prerequisites

- Node.js 22 LTS (or newer compatible LTS)
- npm 10+

## Install

```bash
npm ci
```

> Use `npm ci` for deterministic installs from `package-lock.json` in both local setup and CI.

## Run locally

Frontend (Vite):

```bash
npm run dev:web
```

Backend (NestJS):

```bash
npm run dev:api
```

Production-style API startup from built output:

```bash
npm run build --workspace @scrambleiq/api
npm run start --workspace @scrambleiq/api
```

> The API startup scripts automatically build `@scrambleiq/shared` first so runtime `require` imports resolve to compiled JavaScript.

## Environment variables

### Frontend (`apps/web`)

- `VITE_API_BASE_URL` (optional): Base URL for the API (example: `http://localhost:3000`).
  - If omitted, the frontend falls back to `http://localhost:3000`.
- `VITE_API_AUTH_TOKEN` (optional): Token sent as `x-api-key` on API requests. Defaults to `scrambleiq-local-dev-token`.

### Backend (`apps/api`)

- `PORT` (optional): API port (default: `3000`).
- `WEB_ORIGIN` (optional): CORS origin (default: `http://localhost:5173`).
- `DATABASE_URL` (optional for runtime, required for PostgreSQL integration tests): PostgreSQL connection URL.
- `API_AUTH_TOKEN` (optional): Shared API token required on all non-public routes. Defaults to `scrambleiq-local-dev-token` when unset.

### Persistence mode (runtime)

- If `DATABASE_URL` is set, the API boots with PostgreSQL repositories and applies SQL migrations before serving requests.
- If `DATABASE_URL` is not set, the API uses in-memory repositories as a development fallback.
- The HTTP API surface is the same in both modes; only persistence backing changes.

## API authentication baseline (phase-one)

The API now enforces a minimal shared-token guard for all protected endpoints, including match-scoped routes (`/matches`, `/events`, `/positions`, `/video`, analytics/export/validate routes) and review template routes (`/review-templates`).

- Public route: `GET /health`
- Protected routes: all other current API routes
- Accepted auth headers:
  - `x-api-key: <token>`
  - `Authorization: Bearer <token>`

Local/dev defaults are deterministic to keep setup simple:

- API default token (when `API_AUTH_TOKEN` is unset): `scrambleiq-local-dev-token`
- Web default token (when `VITE_API_AUTH_TOKEN` is unset): `scrambleiq-local-dev-token`

Example request:

```bash
curl -H "x-api-key: scrambleiq-local-dev-token" http://localhost:3000/matches
```

If you override `API_AUTH_TOKEN`, set the same value in `VITE_API_AUTH_TOKEN` for the frontend to continue working.

## PostgreSQL integration testing

Phase-1 now includes PostgreSQL-backed integration tests that validate real repository/service behavior against a live database.

`npm run test:integration` is a required quality gate for CI alongside the root lint/typecheck/test/build scripts.

### Local setup (containerized test database)

Requirements:

- Docker with `docker compose`
- `psql` available on your machine (the API PostgreSQL client uses `psql` internally)

Run the local integration test flow:

```bash
npm run test:integration
```

Recommended full local verification order before opening a PR:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:integration
```

This command uses `apps/api/scripts/run-integration-tests.sh` to:

1. start `postgres:16-alpine` using `apps/api/docker-compose.integration.yml`
2. set `DATABASE_URL=postgresql://scrambleiq:scrambleiq@127.0.0.1:55432/scrambleiq_test`
3. run API integration tests (`apps/api/test/integration/**/*.test.ts`)
4. stop and remove the database container and volume

### CI integration mode (GitHub Actions service container)

CI does **not** run Docker Compose from this repository script. The workflow starts a GitHub Actions PostgreSQL service, sets `DATABASE_URL`, then runs API integration tests directly:

```bash
npm run test:integration:ci
```

This maps to:

```bash
npm run test:integration --workspace @scrambleiq/api
```

Use this command when you already have a PostgreSQL instance available and only need the API integration test suite.

### Migration execution during integration tests

Before integration assertions run, tests reset the DB schema and apply SQL migrations from `apps/api/migrations` using `DatabaseMigrationService`.

Integration coverage verifies:

- expected tables are present
- foreign keys exist
- `ON DELETE CASCADE` behavior works for child records

## Frontend architecture planning

A dedicated Phase-1 frontend refactor plan is documented in `Guidelines/Frontend-Architecture-Refactor-Plan.md`.

The plan preserves existing behavior while incrementally decomposing `apps/web/src/App.tsx` into page, feature, and hook modules.

Current extraction status:

- Routing shell moved into `apps/web/src/app/AppShell.tsx` and `apps/web/src/app/router.ts` (history + `popstate` preserved).
- Match list/create flow moved into `apps/web/src/pages/MatchListPage.tsx` with presentational components in `apps/web/src/components/` and data loading in `apps/web/src/hooks/useMatches.ts`.
- Match detail orchestration is now extracted into `apps/web/src/pages/MatchDetailPage.tsx`, with `App.tsx` acting as a thin composition root.
- Event annotation UI/state is extracted into `apps/web/src/features/events/` (`EventPanel`, `EventForm`, `EventList`, `useMatchEvents`), while `MatchDetailPage` remains the page-level orchestrator.
- Position timeline UI/state is extracted into `apps/web/src/features/positions/` (`PositionPanel`, `PositionForm`, `PositionList`, `useMatchPositions`), while `MatchDetailPage` remains the page-level orchestrator.
- Video review UI/state is extracted into `apps/web/src/features/video/` (`VideoPanel`, `VideoMetadataForm`, `useMatchVideo`), while `MatchDetailPage` remains the page-level orchestrator for cross-feature synchronization.
- Analytics summary UI/state is extracted into `apps/web/src/features/analytics/` (`AnalyticsPanel`, `AnalyticsSummary`, `useMatchAnalytics`), while `MatchDetailPage` remains the page-level orchestrator for mutation-driven refresh triggers.
- Dataset tooling UI/state is extracted into `apps/web/src/features/dataset/` (`DatasetToolsPanel`, `DatasetValidationReport`, `useMatchDatasetTools`), while `MatchDetailPage` remains the page-level orchestrator.
- Review template management UI/state is extracted into `apps/web/src/features/review-templates/` (`ReviewTemplatePanel`, `ReviewTemplateForm`, `ReviewTemplateList`, `AppliedReviewTemplate`, `useReviewTemplates`) with deterministic create/list/view/edit/delete and manual apply workflow support.

With dataset tooling extraction complete, the planned Phase-1 frontend modularization slices are now fully implemented.

Phase-1 frontend architecture hardening pass is also complete. The frontend now follows a standardized feature module pattern across `apps/web/src/features/*`:

- `*Panel` component acts as the feature container and composition root
- `*Form` component handles feature input/edit UX (where applicable)
- `*List`/`*Summary`/`*Report` component renders feature outputs
- `useMatch*` hook owns feature-local data fetching, mutations, and local UI state

`pages/MatchDetailPage.tsx` remains responsible only for page orchestration concerns: route-bound match loading/edit/delete, cross-feature analytics refresh triggers, and cross-feature video seek selection.

## Phase-one feature: Match management, timeline events, position tracking, and synchronized video review

### Frontend (`apps/web`)

The app uses route-based navigation:

- `/`: create match form + match list
- `/matches/:id`: single match detail view + timeline event tools

The web app includes a **Create Match** form with required-field validation for:

- title
- date
- ruleset
- competitor A
- competitor B

`notes` is optional.

The UI also mirrors backend field-length constraints for safer submissions:

- title: max 120
- ruleset: max 60
- competitor names: max 80
- event type: max 80
- notes: max 2000

Position form validation requires:

- `position` from the supported position list
- `competitorTop` (`A` or `B`)
- `timestampStart` (non-negative integer)
- `timestampEnd` (integer and greater than `timestampStart`)

`notes` is optional.

On `/matches/:id`, users can:

- review match metadata
- edit match metadata
- delete a match with confirmation
- manage an **Event Timeline** section

The timeline section supports:

- listing events sorted by ascending timestamp
- creating events
- editing events
- deleting events

The detail page also includes a **Review Templates** section for manual-first workflow scaffolding.

Review template support in this phase includes:

- listing existing templates
- creating/editing/deleting templates
- viewing template checklist details
- applying one template to the active match review session
- manually toggling checklist completion state for the current session

Applying a template does not mutate annotations; it only structures coach-driven review steps.

The detail page also includes a **Video Review** section for single-video attachment and synchronized playback alongside timeline annotations.

Video review in this phase supports:

- a single attached `MatchVideo` record per match
- `sourceType` values: `remote_url` or `local_demo`
- metadata attach/edit/remove workflows
- browser-native `<video>` playback when a video is attached
- clicking timeline events to seek playback to `timestamp`
- clicking position segments to seek playback to `timestampStart`

Current limitations (demo stage):

- no cloud video storage integration
- no file upload or transcoding pipeline
- no ML/automatic analysis
- analytics are derived only from currently stored manual annotations (no inferred or predictive metrics)
- dataset export provides structured JSON only; no automated model training or labeling augmentation is included
- without `DATABASE_URL`, the API uses in-memory repositories (data resets on restart)

The detail page also includes a **Position Timeline** section for positional state tracking.

The position timeline supports:

- listing position states sorted by ascending `timestampStart`
- creating position state segments
- editing position state segments
- deleting position state segments

Supported position values:

- `standing`
- `closed_guard`
- `open_guard`
- `half_guard`
- `side_control`
- `mount`
- `back_control`
- `north_south`
- `leg_entanglement`
- `scramble`

Timeline event form validation requires:

- timestamp (non-negative integer)
- event type
- competitor (`A` or `B`)

`notes` is optional.

### Backend (`apps/api`)

The API exposes match and timeline endpoints backed by the configured repository mode (PostgreSQL when `DATABASE_URL` is set, otherwise in-memory fallback):

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/matches`
- `GET http://localhost:3000/matches`
- `GET http://localhost:3000/matches/:id`
- `GET http://localhost:3000/matches/:id/analytics`
- `GET http://localhost:3000/matches/:id/export`
- `GET http://localhost:3000/matches/:id/validate`
- `PATCH http://localhost:3000/matches/:id`
- `DELETE http://localhost:3000/matches/:id`
- `POST http://localhost:3000/matches/:id/events`
- `GET http://localhost:3000/matches/:id/events`
- `PATCH http://localhost:3000/events/:id`
- `DELETE http://localhost:3000/events/:id`
- `POST http://localhost:3000/matches/:id/positions`
- `GET http://localhost:3000/matches/:id/positions`
- `PATCH http://localhost:3000/positions/:id`
- `DELETE http://localhost:3000/positions/:id`
- `POST http://localhost:3000/matches/:id/video`
- `GET http://localhost:3000/matches/:id/video`
- `PATCH http://localhost:3000/video/:id`
- `DELETE http://localhost:3000/video/:id`

Validation behavior:

- `timestamp` must be a non-negative integer
- `timestamp` values are capped to one day (`<= 86400`)
- `eventType` is required and non-empty
- `competitor` must be `A` or `B`
- route IDs must be valid UUIDs
- match `date` must be strict calendar-valid `YYYY-MM-DD`
- `notes` is optional
- max lengths are enforced for title/ruleset/competitor names/event type/notes/sourceUrl
- unknown payload fields are rejected
- position segments cannot overlap within a match timeline

`GET /matches` returns deterministic match discovery summaries sorted by newest `eventDate` first (with `matchId` as a stable tie-breaker).

Supported query parameters for `GET /matches`:

- `competitor` (case-insensitive substring against `competitorA` or `competitorB`)
- `dateFrom` and `dateTo` (inclusive `YYYY-MM-DD` range filter)
- `hasVideo` (`true` or `false`)
- `limit` and `offset` (pagination, default `limit=50`, `offset=0`)

List response shape:

```json
{
  "matches": [
    {
      "matchId": "d1b7...",
      "title": "State Finals",
      "competitorA": "Alex Carter",
      "competitorB": "Sam Jordan",
      "eventDate": "2026-03-01",
      "eventCount": 12,
      "positionCount": 8,
      "hasVideo": true
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

`GET /matches/:id/events` returns timeline events sorted by ascending `timestamp`.

`GET /matches/:id/positions` returns position states sorted by ascending `timestampStart`.


`GET /matches/:id/analytics` returns a derived `MatchAnalyticsSummary` computed from current manual annotations:

- `totalEventCount`
- `eventCountsByType`
- `totalPositionCount`
- `timeInPositionByTypeSeconds`
- `competitorTopTimeByPositionSeconds`
- `totalTrackedPositionTimeSeconds`

Analytics are computed on read from current timeline events and position states and are **not persisted as standalone records**.
These analytics are based only on manual annotations and are **not ML-generated**.


`GET /matches/:id/export` returns a deterministic `MatchDatasetExport` artifact for manual-annotation dataset workflows (for example offline analysis or future ML training pipelines):

```json
{
  "match": { "id": "...", "title": "...", "date": "...", "ruleset": "...", "competitorA": "...", "competitorB": "...", "notes": "..." },
  "video": { "id": "...", "matchId": "...", "title": "...", "sourceType": "remote_url", "sourceUrl": "...", "durationSeconds": 180, "notes": "..." },
  "events": [{ "id": "...", "matchId": "...", "timestamp": 12, "eventType": "takedown_attempt", "competitor": "A", "notes": "..." }],
  "positions": [{ "id": "...", "matchId": "...", "position": "closed_guard", "competitorTop": "A", "timestampStart": 16, "timestampEnd": 30, "notes": "..." }],
  "analytics": { "matchId": "...", "totalEventCount": 1, "eventCountsByType": { "takedown_attempt": 1 }, "totalPositionCount": 1, "timeInPositionByTypeSeconds": {}, "competitorTopTimeByPositionSeconds": {}, "totalTrackedPositionTimeSeconds": 14 }
}
```


`GET /matches/:id/validate` returns a `DatasetValidationReport` for pre-export integrity checks.

Validation issue types in this phase:

- `EVENT_OUT_OF_RANGE`
- `POSITION_OVERLAP`
- `MISSING_VIDEO`
- `EMPTY_MATCH`
- `INVALID_TIMESTAMP_ORDER`
- `NEGATIVE_TIMESTAMP`
- `ANALYTICS_MISMATCH`

Validation severity levels:

- `INFO`
- `WARNING`
- `ERROR`

Any `ERROR` issue marks `isValid` as `false`.

Recommended workflow before exporting datasets:

1. Finish manual annotations (events and/or position states).
2. Attach match video metadata when available.
3. Run `GET /matches/:id/validate` (or use **Validate Dataset** in the UI).
4. Resolve `ERROR` issues first, then review `WARNING`/`INFO` context.
5. Export via `GET /matches/:id/export` once the validation status is acceptable for your downstream analysis.

Dataset export guarantees in this phase:

- `events` are sorted by ascending `timestamp`
- `positions` are sorted by ascending `timestampStart`
- all timeline timestamps remain numeric seconds
- object is returned directly as JSON (no file storage layer)


Deleting a match also removes all timeline events, position states, and attached video metadata for that match.

`POST /matches/:id/video` currently behaves as attach-or-replace for the single allowed video record per match.

Example timeline event POST body:

```json
{
  "timestamp": 12,
  "eventType": "takedown_attempt",
  "competitor": "A",
  "notes": "Entry to single leg"
}
```

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
```

Optional local API runtime smoke check:

```bash
PORT=3100 npm run start --workspace @scrambleiq/api
# in another shell:
curl http://127.0.0.1:3100/health
```

## Continuous Integration

GitHub Actions runs on every `push` and `pull_request` with the following steps:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`
6. API runtime smoke check against `GET /health`

PostgreSQL integration coverage runs in a dedicated CI job that:

1. starts a PostgreSQL service container
2. sets `DATABASE_URL`
3. installs `postgresql-client` (`psql`)
4. runs `npm run test:integration:ci`

Workflow file: `.github/workflows/ci.yml`.

## Repository structure

```text
apps/
  api/     # NestJS backend scaffold + repository-backed APIs (PostgreSQL or in-memory fallback)
  web/     # React + Vite frontend scaffold + manual-first match annotation UI
packages/
  shared/  # shared domain types consumed by web and api
Guidelines/
  Tech-Stack.md
```

## API persistence layer (PostgreSQL + repository pattern)

The API now uses a repository abstraction for persistence. Services depend on repository interfaces, not direct database calls.

### Repository interfaces

- `apps/api/src/repositories/match.repository.ts`
- `apps/api/src/repositories/event.repository.ts`
- `apps/api/src/repositories/position.repository.ts`
- `apps/api/src/repositories/video.repository.ts`
- `apps/api/src/repositories/dataset-validation.repository.ts`

### PostgreSQL schema

Migrations are SQL-first and live in `apps/api/migrations/`.

Current base migration: `001_initial_schema.sql`.

Migrations explicitly target the `public` schema (`CREATE SCHEMA IF NOT EXISTS public` + schema-qualified table creation) so execution is deterministic on clean test databases.

Tables:

- `matches`
- `events` (FK `match_id -> matches.id` ON DELETE CASCADE)
- `positions` (FK `match_id -> matches.id` ON DELETE CASCADE)
- `videos` (FK `match_id -> matches.id` ON DELETE CASCADE, unique per match)
- `dataset_validation_results` (FK `match_id -> matches.id` ON DELETE CASCADE)
- `schema_migrations` (migration tracking)

Each domain table includes:

- `id`
- `created_at`
- `updated_at`

### Migration strategy

- Strategy: SQL migrations + lightweight Node execution (`psql`).
- Migration runner: `apps/api/src/database/database.migrations.ts`.
- On API start, if `DATABASE_URL` is set, migrations are applied automatically before repository usage.

### Runtime behavior by environment

- With `DATABASE_URL` set: PostgreSQL repositories are used.
- Without `DATABASE_URL`: API falls back to in-memory repository implementations (useful for local/unit test defaults).

### Backend environment variables

- `DATABASE_URL` (optional for local tests, required for PostgreSQL persistence)
- `PORT` (optional): API port (default: `3000`)
- `WEB_ORIGIN` (optional): CORS origin (default: `http://localhost:5173`)
