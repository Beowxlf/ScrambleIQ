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

## Phase-one feature: Match creation and listing

### Frontend (`apps/web`)

The web app includes a **Create Match** form with required-field validation for:

- title
- date
- ruleset
- competitor A
- competitor B

`notes` is optional.

The form is connected to the backend API. On submit, the frontend calls `POST /matches`, shows success or failure feedback, prepends the created match into a basic match list loaded from `GET /matches`, and supports loading match details from `GET /matches/:id`.

### Backend (`apps/api`)

The API exposes match endpoints backed by an in-memory store:

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/matches`
- `GET http://localhost:3000/matches`
- `GET http://localhost:3000/matches/:id`

`POST /matches` uses global backend validation for required and optional fields.

`GET /matches` returns matches sorted by newest `date` first.

Example POST body:

```json
{
  "title": "State Finals",
  "date": "2026-03-01",
  "ruleset": "Folkstyle",
  "competitorA": "Alex Carter",
  "competitorB": "Sam Jordan",
  "notes": "Quarterfinal match"
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
  api/     # NestJS backend scaffold + in-memory match API
  web/     # React + Vite frontend scaffold + match creation UI
packages/
  shared/  # shared domain types consumed by web and api
Guidelines/
  Tech-Stack.md
```
