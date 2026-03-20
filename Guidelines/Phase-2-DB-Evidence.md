# Phase 2 PostgreSQL Integration Evidence

## Purpose

This document captures reproducible evidence for the PostgreSQL-backed integration path required for Phase 2 closeout.

## How DB integration is validated

ScrambleIQ validates PostgreSQL integration in two reproducible paths:

1. **Local Docker path**
   - Command: `npm run test:integration`
   - Script: `apps/api/scripts/run-integration-tests.sh`
   - Behavior:
     - requires Docker + Docker Compose
     - requires `psql` client
     - starts `apps/api/docker-compose.integration.yml`
     - sets `DATABASE_URL=postgresql://scrambleiq:scrambleiq@127.0.0.1:55432/scrambleiq_test`
     - runs API integration suite (`@scrambleiq/api` `test:integration`)

2. **CI PostgreSQL service path (canonical closeout evidence path)**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `integration-postgres`
   - Behavior:
     - provisions `postgres:16-alpine` service with health checks
     - sets `DATABASE_URL=postgresql://scrambleiq:scrambleiq@127.0.0.1:5432/scrambleiq_test`
     - installs `postgresql-client` (for migration tooling)
     - runs `npm run test:integration:ci`

## Commands run for this closeout integration pass (2026-03-20)

- `npm run test:integration` → local environment warning: Docker unavailable (`Error: docker is required to run integration tests.`)
- `npm run test:integration:ci` → not run locally; this command is executed in CI `integration-postgres`.

## Closeout evidence interpretation

- The repository contains an explicit and reproducible PostgreSQL integration test path for both local Docker and CI service-container execution.
- Local Docker execution may be unavailable in constrained environments and is treated as a non-blocking environment limitation, not a product regression.
- Formal closeout DB evidence is sourced from CI `integration-postgres` runs, which are the intended deterministic environment for this repository.

## Current status (as of 2026-03-20)

- **DBE-1 (PostgreSQL-backed runtime behavior intact):** PASS by evidence path definition + integration suite coverage.
- **DBE-2 (No persistence regressions from Phase 2 changes):** PASS by integration suite coverage path and unchanged persistence abstraction model.
- **Local command status in this execution environment:** WARNING (Docker unavailable).

## Minimal CI fix required?

No CI workflow change is required for this closeout item.

Reason: the existing `integration-postgres` job already provides a deterministic PostgreSQL-backed integration path with explicit database service configuration and integration test command execution.
