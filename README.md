# ScrambleIQ

ScrambleIQ is in scaffold and early phase-one development.

This repository now includes a minimal full-stack TypeScript scaffold aligned to the project tech stack:

- Frontend: React + TypeScript + Vite (`apps/web`)
- Backend: NestJS + Node.js + TypeScript (`apps/api`)
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

The API enables CORS for `http://localhost:5173` by default (or `WEB_ORIGIN` if set).

## Phase-one feature: Match creation

### Frontend (`apps/web`)

The web app includes a **Create Match** form with required-field validation for:

- title
- date
- ruleset
- competitor A
- competitor B

`notes` is optional.

The form is connected to the backend API. On submit, the frontend calls `POST /matches`, shows success or failure feedback, and prepends the created match into a basic match list loaded from `GET /matches`.

### Backend (`apps/api`)

The API exposes match endpoints backed by an in-memory store:

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/matches`
- `GET http://localhost:3000/matches`

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
  api/   # NestJS backend scaffold + in-memory match API
  web/   # React + Vite frontend scaffold + match creation form
Guidelines/
  Tech-Stack.md
```
