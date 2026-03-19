# ScrambleIQ
## Version 1 Scope Document

### Overview

This document defines the implemented functional boundaries of ScrambleIQ Version 1.

Version 1 is a manual-first match annotation and review system. It provides structured match data capture, synchronized review workflows, derived analytics, and deterministic dataset export.

Version 1 does **not** include automated analysis pipelines.

---

## Supported Users and Workflow

Primary users:

- grappling coaches
- athletes performing structured self-review

Primary workflow:

1. create/manage a match record
2. annotate event and position timelines manually
3. attach/edit video metadata for synchronized playback review
4. review derived analytics
5. run dataset validation
6. export deterministic JSON artifacts

---

## In-Scope Capabilities (Implemented)

### 1. Match CRUD

- create, list/filter, read, update, and delete matches
- deterministic list response and pagination behavior

### 2. Manual Event Timeline Annotation

- create, list, edit, and delete timestamped match events
- deterministic event ordering by ascending timestamp

### 3. Manual Position Timeline Annotation

- create, list, edit, and delete timestamped position segments
- overlap validation to preserve timeline integrity
- deterministic ordering by ascending `timestampStart`

### 4. Video Metadata + Synchronized Playback Behavior

- attach, edit, and remove one video metadata record per match
- video source metadata supports manual reference workflows
- synchronized seek from timeline selections:
  - selecting an event seeks playback to event `timestamp`
  - selecting a position segment seeks playback to `timestampStart`

### 5. Derived Analytics from Manual Annotations

- analytics are computed from currently stored manual events/positions
- no predictive or inferred ML metrics
- analytics are deterministic for a given stored dataset state

### 6. Dataset Validation + JSON Export

- validation endpoint reports dataset quality/integrity issues
- deterministic JSON export includes match, video metadata, annotations, and derived analytics
- export is API JSON output (no file storage pipeline)

### 7. Persistence Mode: PostgreSQL

- when `DATABASE_URL` is set, backend uses PostgreSQL repositories
- SQL migrations initialize/update schema
- integration tests validate PostgreSQL-backed behavior

### 8. Runtime Convenience Fallback: In-Memory

- when `DATABASE_URL` is not set, backend uses in-memory repositories
- fallback is intended for local/runtime convenience
- data resets on process restart in this mode

---

## Explicitly Out of Scope for Version 1

The following capabilities are excluded from Version 1:

1. file upload pipeline
2. cloud object storage integration for uploaded media
3. video transcoding pipeline
4. pose estimation
5. 3D replay/reconstruction
6. automated event detection
7. AI-generated coaching commentary
8. real-time/live analysis

---

## Version 1 Success Criteria

Version 1 is considered successful when teams can reliably:

1. complete manual match annotation workflows end-to-end
2. use synchronized timeline + video review interactions
3. generate derived analytics from manual data
4. validate and export deterministic datasets
5. run against PostgreSQL in integration-tested environments

---

## Summary

ScrambleIQ Version 1 is a stable manual-first annotation foundation, not an automated video intelligence system.

Future versions may explore richer workflow tooling, cross-match analysis, and later automation research, but those are outside this version boundary.
