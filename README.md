# ScrambleIQ

ScrambleIQ is currently **Prototype 1** (working prototype, pre-1.0).

It is a manual-first coaching workflow tool for reviewing grappling matches with structured annotations, deterministic summaries, and collection-level reporting.

## Prototype status

- **Stage:** End of Prototype 1
- **Purpose right now:** Validate whether the current review workflow is useful to coaches before defining a 1.0 scope
- **Not 1.0:** This repository intentionally includes prototype-level constraints and open product questions

For a concise prototype status snapshot, see `Guidelines/Prototype-1-Status.md`.

## Who this is for right now

Primary user for this prototype:

- A coach (or analyst acting as coach support) performing **manual** post-match review.

Secondary user:

- A technically comfortable athlete doing structured self-review using the same workflow.

## What the product can do today

### Match workspace (`/` and `/matches/:id`)

- Create, list, filter, edit, and delete matches
- Add/edit/delete timeline events per match
- Add/edit/delete position timeline segments per match
- Attach/edit/remove one video metadata record per match and use synchronized seeking from event/position selections
- Generate single-match derived analytics from stored manual annotations
- Generate single-match review summary (metadata + analytics + validation rollup)
- Run taxonomy guardrails and apply explicit normalization actions for event type cleanup
- Manage review templates (create/list/edit/delete/apply in-session)
- Manage saved review presets (create/list/edit/delete/apply in-session)
- Run dataset validation and deterministic dataset export per match

### Reporting workspace (`/reports`)

- Collection Summary (date/filter scoped totals, distributions, insights)
- Competitor Trends (current vs previous window deltas, sufficiency message, insights)
- Collection Validation (aggregate reliability checks and per-match status)
- Collection Export (deterministic payload preview + optional raw JSON display)

### What reporting/analytics means in this prototype

- Outputs are **deterministic and rule-based**.
- There is **no ML inference**, predictive modeling, or automated event detection.
- Insights are threshold-driven text derived from stored manual annotations.

## Main end-to-end workflow (Prototype 1)

1. Create a match.
2. Open match detail and annotate timeline events + position states.
3. Attach video metadata and use timeline-driven seeking during review.
4. Use review templates/presets to structure repeatable manual review.
5. Check analytics, review summary, taxonomy guardrails, and validation output.
6. Export per-match or collection-level JSON artifacts for downstream review.
7. Use `/reports` to evaluate collection trends and data reliability across a date range.

## Monorepo structure

- `apps/web` – React + TypeScript + Vite frontend
- `apps/api` – NestJS + TypeScript backend API
- `packages/shared` – shared TypeScript domain/contracts used by web + API
- Root workspace scripts in `package.json` run lint/typecheck/test/build across all workspaces

## Local setup

### Prerequisites

- Node.js 22 LTS (or compatible current LTS)
- npm 10+
- Optional for integration tests: Docker + `docker compose`, and `psql`

### Install

```bash
npm ci
```

### Run locally

Frontend:

```bash
npm run dev:web
```

Backend:

```bash
npm run dev:api
```

### Environment variables

Frontend (`apps/web`):

- `VITE_API_BASE_URL` (default `http://localhost:3000`)
- `VITE_API_AUTH_TOKEN` (default `scrambleiq-local-dev-token`)

Backend (`apps/api`):

- `PORT` (default `3000`)
- `WEB_ORIGIN` (default `http://localhost:5173`)
- `API_AUTH_TOKEN` (default `scrambleiq-local-dev-token`)
- `DATABASE_URL` (optional runtime; required for PostgreSQL integration test modes)

### Auth behavior

- `GET /health` is public.
- Other API routes require token via either:
  - `x-api-key: <token>`
  - `Authorization: Bearer <token>`

## Testing and build commands

Root validation commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

PostgreSQL integration test flow:

```bash
npm run test:integration
```

CI-style integration command (when a PostgreSQL service is already provided):

```bash
npm run test:integration:ci
```

## Known prototype limitations

- Manual annotation only; no automated event detection
- No upload/transcoding/cloud video pipeline (video is metadata reference + playback URL only)
- Reporting insights are deterministic threshold rules, not predictive analysis
- Competitor trend section requires manual competitor ID input
- In-memory mode loses data on API restart
- Workflow and terminology may change after coach feedback cycles

## Documentation map (current)

- Architecture: `Guidelines/System-Architecture.md`
- Product scope: `Guidelines/Product-Scope-Prototype-1.md`
- Reporting behavior: `Guidelines/Reporting-Prototype-1.md`
- Prototype status summary: `Guidelines/Prototype-1-Status.md`
- Tech stack baseline: `Guidelines/Tech-Stack.md`

## Path to 1.0

ScrambleIQ is intentionally paused at the end of Prototype 1 so the team can validate real coaching usage before committing to a 1.0 roadmap.

Priority decisions for 1.0 should come from observed coach workflows, data quality pain points, and report usefulness in live review sessions. Features should only be promoted into 1.0 scope after feedback confirms they improve decision quality or reduce review friction.
