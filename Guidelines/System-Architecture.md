# ScrambleIQ
## System Architecture

> **Status: Current source of truth (implemented V1 manual-first baseline).**

### Document Purpose

This document describes the architecture currently implemented in ScrambleIQ Version 1.

Version 1 is a manual-first annotation platform. It does **not** include a video upload pipeline, AI/ML inference, automated event detection, or 3D replay.

---

## Architecture Summary

ScrambleIQ is implemented as a TypeScript monorepo with three primary layers:

1. **Frontend app (`apps/web`)**: React + TypeScript + Vite UI for manual review and annotation.
2. **Backend API (`apps/api`)**: NestJS REST API for matches, events, positions, video metadata, analytics, validation, and export.
3. **Shared contract (`packages/shared`)**: shared TypeScript types and constants for consistent frontend/backend behavior.

Persistence supports two runtime modes behind the same API contract:

- **PostgreSQL mode** when `DATABASE_URL` is configured.
- **In-memory mode** when `DATABASE_URL` is not configured.

---

## Implemented V1 Data and Interaction Model

### 1. Match management

- Create, list/filter, read, update, and delete matches.
- Match records are the anchor entity for all annotations and review operations.

### 2. Manual event timeline annotation

- Create, list, update, and delete timestamped events.
- Events are user-entered (manual), not machine-detected.

### 3. Manual position timeline annotation

- Create, list, update, and delete position segments.
- Position overlaps are validated in the API.

### 4. Video metadata attachment + synchronized playback

- One video metadata record can be attached per match.
- Metadata can be created, edited, or removed.
- Frontend playback sync behavior:
  - selecting an event seeks playback to `timestamp`
  - selecting a position seeks playback to `timestampStart`

### 5. Derived analytics + dataset tools

- Analytics are computed from stored manual annotations.
- Dataset validation reports deterministic issues from stored data.
- Dataset export returns deterministic JSON from stored data.

---

## Monorepo Structure (Implemented)

- `apps/web`: UI routes and manual annotation/review workflows
- `apps/api`: REST endpoints, services, repositories, and migrations
- `packages/shared`: shared DTO/domain types used across workspaces
- root `package.json`: workspace scripts for lint/typecheck/test/build

---

## Runtime Boundaries and Exclusions

The following are explicitly out of scope for implemented V1:

1. video upload pipeline
2. cloud object storage/transcoding pipeline
3. pose estimation
4. automated event detection
5. AI-generated commentary
6. 3D reconstruction/replay

Any references to those capabilities in legacy docs are future-state or historical only.

---

## Operational Validation

The architecture is validated through root workspace commands:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Integration tests further validate PostgreSQL behavior when available.

---

## Terminology Rules

- Use **video metadata attachment** for implemented V1 behavior.
- Use **video upload pipeline** only for explicitly future-state planning.

---

## Summary

ScrambleIQ Version 1 is a manual-first, deterministic annotation and review system implemented as a React + NestJS + shared-types monorepo with PostgreSQL/in-memory persistence modes and no AI/ML or upload-pipeline runtime features.
