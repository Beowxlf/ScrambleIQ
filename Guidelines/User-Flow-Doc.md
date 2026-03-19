# ScrambleIQ
## User Flow Document

> **Status: Current source of truth (implemented V1 manual-first baseline).**

### Document Purpose

This document defines the implemented user journey for ScrambleIQ Version 1.

Version 1 supports manual annotation and synchronized review workflows. It does **not** implement an upload + AI/ML + 3D processing pipeline.

---

## Primary Users

- Grappling coaches
- Athletes performing structured self-review

---

## Implemented End-to-End Flow

### Stage 1: Open match workspace

1. User opens the app and views the match list.
2. User creates a new match or opens an existing match.

System behavior:

- validates required match fields
- persists match data through API

### Stage 2: Build manual annotations

Within match detail view, user manually records review data:

1. add/edit/delete event timeline entries
2. add/edit/delete position timeline segments

System behavior:

- validates manual inputs
- enforces timeline constraints (for example position overlap checks)
- returns sorted timeline data

### Stage 3: Attach video metadata

User can attach or edit one video metadata record for the match.

System behavior:

- stores metadata reference only
- does not upload/transcode/process media files in V1

### Stage 4: Perform synchronized review

User reviews timeline and playback together:

1. click event entry → playback seeks to event timestamp
2. click position segment → playback seeks to position start timestamp

### Stage 5: Review outputs and export

User can:

1. view analytics derived from manual annotations
2. run dataset validation
3. export deterministic JSON dataset output

---

## Error and Recovery Flow

- Validation failures return explicit UI/API errors.
- Users can correct metadata or annotation inputs and resubmit.
- In-memory mode warns implicitly through behavior (data resets on restart).

---

## Out-of-Scope (Not in Implemented V1 Flow)

1. video upload queueing
2. ML pose tracking
3. automated event detection
4. AI commentary generation
5. 3D replay/reconstruction

---

## Terminology Rules

- Current behavior: **video metadata attachment**.
- Future planning term only: **video upload pipeline**.

---

## Summary

The implemented V1 user flow is: create/open a match, manually annotate events and positions, attach video metadata, use synchronized playback review, then validate/export deterministic outputs.
