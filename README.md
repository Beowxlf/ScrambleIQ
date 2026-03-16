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

## Phase-one feature: Match management, timeline events, and position tracking

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

Validation behavior:

- `timestamp` must be a non-negative integer
- `eventType` is required and non-empty
- `competitor` must be `A` or `B`
- `notes` is optional
- unknown payload fields are rejected

`GET /matches/:id/events` returns timeline events sorted by ascending `timestamp`.

`GET /matches/:id/positions` returns position states sorted by ascending `timestampStart`.

Deleting a match also removes all timeline events and position states attached to that match.

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
