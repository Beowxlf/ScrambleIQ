# Phase 3 PostgreSQL Integration Evidence

## Purpose

This document captures reproducible PostgreSQL integration evidence for Phase 3 closeout criteria defined in `Guidelines/Phase-3-Kickoff.md`.

---

## Why this artifact exists

Phase 3 expanded PostgreSQL-backed persistence to include:

1. review templates
2. review template checklist items
3. saved review presets
4. runtime repository selection/wiring parity

Closeout requires these paths to remain validated in integration tests.

---

## Reproducible evidence paths

### 1) Local Docker path

- Command: `npm run test:integration`
- Script: `apps/api/scripts/run-integration-tests.sh`
- Expected behavior:
  - requires Docker + Compose
  - starts `postgres:16-alpine` via `apps/api/docker-compose.integration.yml`
  - sets test `DATABASE_URL`
  - runs API integration tests (`apps/api/test/integration/**/*.test.ts`)
  - tears down DB container and volume

### 2) CI service-container path (canonical closeout path)

- Workflow: `.github/workflows/ci.yml`
- Job: `integration-postgres`
- Command in CI: `npm run test:integration:ci`
- Behavior:
  - provisions `postgres:16-alpine` service container
  - installs `postgresql-client`
  - sets `DATABASE_URL`
  - runs API integration suite without local Docker compose dependency

---

## Integration suite evidence scope

`apps/api/test/integration/postgres-services.integration.test.ts` includes Phase 3-relevant assertions for:

- persistence across API restarts for review templates
- persistence across API restarts for saved review presets
- validation/not-found parity behavior under PostgreSQL runtime

`apps/api/test/integration/postgres-repositories.integration.test.ts` covers repository and schema-level behavior under PostgreSQL runtime.

---

## Commands run for this closeout hardening pass (2026-03-22)

- `npm run lint` → **PASS** (operator-provided terminal transcript attached for this closeout pass).
- `npm run typecheck` → **PASS** (operator-provided terminal transcript attached for this closeout pass).
- `npm run test` → **PASS** (operator-provided terminal transcript attached for this closeout pass).
- `npm run build` → **PASS** (operator-provided terminal transcript attached for this closeout pass).
- `npm run test:integration` → **PASS** (operator-provided terminal transcript attached for this closeout pass).
  - Runtime provisioning evidence:
    - `[+] up 2/2`
    - `Container scrambleiq-api-integration-db Healthy`
  - Integration suite evidence:
    - `Test Files  2 passed (2)`
    - `Tests  14 passed (14)`
    - `test/integration/postgres-services.integration.test.ts (4 tests)`
    - `test/integration/postgres-repositories.integration.test.ts (10 tests)`
- CI canonical command remains `npm run test:integration:ci` in workflow job `integration-postgres`.

---

## Evidence interpretation

- PostgreSQL integration validation path is implemented and reproducible through both local Docker and CI workflow design (`integration-postgres`).
- This closeout update now includes an attached, passing local Docker transcript for `npm run test:integration` with container-health and integration-suite pass evidence.
- The attached transcript covers the required Phase 3 persistence surfaces (templates, checklist persistence paths, presets, repository wiring, migration/schema assertions).
- DB closeout evidence is therefore sufficient for formal Phase 3 closeout.

---

## Current status (2026-03-22)

- **DBE-1 (Phase 3 persistence expansion implemented):** PASS by code + integration suite scope.
- **DBE-2 (Reproducible integration gate evidence for this pass):** PASS (attached local Docker transcript shows passing `npm run test:integration`).
- **Final closeout posture for Phase 3 DB evidence:** READY FOR FORMAL CLOSEOUT.
- **Local environment command status:** PASS in attached operator transcript (Docker available; integration suite passed).
