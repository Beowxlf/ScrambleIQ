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

2. **CI PostgreSQL service path (closeout evidence path)**
   - Workflow: `.github/workflows/ci.yml`
   - Job: `integration-postgres`
   - Behavior:
     - provisions `postgres:16-alpine` service with health checks
     - sets `DATABASE_URL=postgresql://scrambleiq:scrambleiq@127.0.0.1:5432/scrambleiq_test`
     - installs `postgresql-client` (for migration tooling)
     - runs `npm run test:integration:ci`

## Command run for closeout verification

The required command for DB-backed closeout evidence is:

- `npm run test:integration`

In CI, the equivalent reproducible evidence command executed by the workflow is:

- `npm run test:integration:ci`

## Where evidence is expected

Primary evidence source for Phase 2 closeout:

- GitHub Actions workflow run for `.github/workflows/ci.yml`
- `integration-postgres` job status must be **green**
- job logs should show the PostgreSQL service startup and integration test execution

Secondary/local evidence source (optional but useful):

- successful local `npm run test:integration` output from a Docker-capable environment

## Current status (as of 2026-03-20)

- **CI configuration status:** PASS (PostgreSQL integration evidence path is explicitly defined and reproducible in `integration-postgres`).
- **This execution environment local status:** FAIL for local DB integration command because Docker is unavailable (`Error: docker is required to run integration tests.`).
- **Closeout evidence interpretation:** Phase 2 DB evidence should be taken from CI `integration-postgres` runs, which are the intended reproducible environment for this repository.

## Minimal CI fix required?

No CI workflow change is required for this closeout item.

Reason: the existing `integration-postgres` job already provides a deterministic PostgreSQL-backed integration path with explicit database service configuration and test command execution.
