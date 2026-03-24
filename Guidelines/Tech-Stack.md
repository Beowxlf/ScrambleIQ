# ScrambleIQ Technology Stack

> Status: Current source of truth for implemented stack in **Prototype 1**.

## Purpose

This document records the technologies currently used in the repository and separates implemented choices from deferred ideas.

## Implemented stack

### Frontend

- React 19
- TypeScript
- Vite

Location: `apps/web`

### Backend

- Node.js
- NestJS 11
- TypeScript

Location: `apps/api`

### Shared contracts

- TypeScript package exported to both web and API

Location: `packages/shared`

### Data persistence

- PostgreSQL when `DATABASE_URL` is configured
- In-memory repository fallback when `DATABASE_URL` is not configured

### Tooling and quality gates

- npm workspaces
- ESLint
- Prettier
- Vitest
- Supertest (API endpoint/integration test usage)

## Why these choices fit Prototype 1

- Single-language TypeScript stack across layers keeps development and refactoring simple.
- NestJS provides explicit module boundaries for evolving API workflows.
- Shared contracts reduce frontend/backend drift during rapid iterations.
- Vite + Vitest keep feedback loops fast.
- PostgreSQL mode allows realistic persistence testing while preserving local in-memory convenience.

## Deferred / not implemented in this prototype

The following are explicitly outside current runtime scope:

- automated video intelligence or ML inference services
- upload/transcoding/object-storage media pipeline
- real-time streaming analysis infrastructure

These may be evaluated post-feedback but are not part of Prototype 1 implementation.
