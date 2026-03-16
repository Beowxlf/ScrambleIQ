# ScrambleIQ

ScrambleIQ is in scaffold and early phase-one development.

This repository includes a minimal full-stack TypeScript scaffold aligned to the project tech stack:

- Frontend: React + TypeScript + Vite (`apps/web`)
- Backend: NestJS + Node.js + TypeScript (`apps/api`)
- Shared types package: TypeScript (`packages/shared`)
- Tooling: ESLint, Prettier, Vitest, Supertest

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run locally

Frontend (Vite):

```bash
npm run dev:web
```

Backend (NestJS):

```bash
npm run dev:api
```

## Environment variables

### Frontend (`apps/web`)

- `VITE_API_BASE_URL` (optional): Base URL for the API (example: `http://localhost:3000`).
  - If omitted, the frontend falls back to `http://localhost:3000`.

### Backend (`apps/api`)

- `PORT` (optional): API port (default: `3000`).
- `WEB_ORIGIN` (optional): CORS origin (default: `http://localhost:5173`).

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

The detail page also includes a **Video Review** section for single-video attachment and synchronized playback alongside timeline annotations.

Video review in this phase supports:

- a single attached `MatchVideo` record per match
- `sourceType` values: `remote_url` or `local_demo`
- metadata attach/edit/remove workflows
- browser-native `<video>` playback when a video is attached
- clicking timeline events to seek playback to `timestamp`
- clicking position segments to seek playback to `timestampStart`

Current limitations (demo stage):

- no cloud storage integration
- no file upload or transcoding pipeline
- no ML/automatic analysis
- analytics are derived only from currently stored manual annotations (no inferred or predictive metrics)
- in-memory persistence only (all data resets when API restarts)

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

The API exposes match and timeline endpoints backed by in-memory stores:

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/matches`
- `GET http://localhost:3000/matches`
- `GET http://localhost:3000/matches/:id`
- `GET http://localhost:3000/matches/:id/analytics`
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

`GET /matches/:id/events` returns timeline events sorted by ascending `timestamp`.

`GET /matches/:id/positions` returns position states sorted by ascending `timestampStart`.


`GET /matches/:id/analytics` returns a derived `MatchAnalyticsSummary` computed from current manual annotations:

- `totalEventCount`
- `eventCountsByType`
- `totalPositionCount`
- `timeInPositionByTypeSeconds`
- `competitorTopTimeByPositionSeconds`
- `totalTrackedPositionTimeSeconds`

Analytics are computed on read from current timeline events and position states in memory and are **not persisted**.
These analytics are based only on manual annotations and are **not ML-generated**.

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
npm run build
```

## Repository structure

```text
apps/
  api/     # NestJS backend scaffold + in-memory match and timeline event APIs
  web/     # React + Vite frontend scaffold + match and timeline event UI
packages/
  shared/  # shared domain types consumed by web and api
Guidelines/
  Tech-Stack.md
```
