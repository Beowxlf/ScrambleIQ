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

- `npm run test:integration` → **WARNING**: local environment lacks Docker (`Error: docker is required to run integration tests.`).
- `gh run list --workflow ci.yml --limit 5` → **WARNING**: `gh` CLI is not installed in this environment (`gh: command not found`).
- `git remote -v` → **WARNING**: no Git remote is configured in this checkout, so CI run URLs cannot be derived from local metadata.
- `npm run test:integration:ci` → not run locally; this remains the canonical CI execution command when a PostgreSQL service is already provisioned.

---

## Evidence interpretation

- PostgreSQL integration validation path is implemented and reproducible through CI workflow design (`integration-postgres`).
- Local Docker unavailability in this environment is a tooling caveat, not evidence of a code regression.
- This environment cannot currently retrieve CI proof artifacts because neither GitHub CLI nor remote repository metadata is available.
- Phase 3 formal closeout still requires attaching a passing `integration-postgres` CI result (or equivalent local Docker run output) for this closeout change set.

---

## Current status (2026-03-22)

- **DBE-1 (Phase 3 persistence expansion implemented):** PASS by code + integration suite scope.
- **DBE-2 (Reproducible integration gate evidence for this pass):** INCOMPLETE (no attachable CI/local runtime proof artifact in this environment).
- **Local environment command status:** WARNING (Docker unavailable; CI retrieval tooling unavailable).
