# ScrambleIQ
## Functional Requirements Specification (FRS)

> **Status: Current source of truth (implemented V1 manual-first baseline).**

### Document Purpose

This FRS defines required functional behavior for the currently implemented Version 1 system.

These requirements describe manual-first behavior only.

---

## System Overview (Implemented)

ScrambleIQ Version 1 provides:

1. match CRUD
2. manual event timeline annotation
3. manual position timeline annotation
4. video metadata attachment
5. derived analytics from manual annotations
6. dataset validation and deterministic JSON export

---

## Requirement Categories

1. Match Management
2. Event Timeline (Manual)
3. Position Timeline (Manual)
4. Video Metadata Attachment + Playback Sync
5. Derived Analytics
6. Dataset Validation + Export
7. Persistence Modes and Runtime Behavior

---

## 1) Match Management

### FR-1.1 Create Match

System shall create a match with required fields and return persisted data.

### FR-1.2 Read/List Matches

System shall provide list and detail retrieval for matches.

### FR-1.3 Update Match

System shall update editable match fields with validation.

### FR-1.4 Delete Match

System shall delete a match and associated records according to repository rules.

---

## 2) Event Timeline (Manual)

### FR-2.1 Create Event

System shall allow users to manually create timestamped events.

### FR-2.2 List Events

System shall return events sorted by ascending timestamp.

### FR-2.3 Update/Delete Event

System shall support editing and deleting manual events.

---

## 3) Position Timeline (Manual)

### FR-3.1 Create Position Segment

System shall allow users to create manual position segments with start/end timestamps.

### FR-3.2 Position Integrity Validation

System shall enforce timestamp integrity and configured overlap constraints.

### FR-3.3 Update/Delete Position Segment

System shall support editing and deleting manual position segments.

---

## 4) Video Metadata Attachment + Playback Sync

### FR-4.1 Attach Video Metadata

System shall allow attaching one video metadata record per match.

### FR-4.2 Edit/Remove Video Metadata

System shall allow updating and deleting attached video metadata.

### FR-4.3 Playback Synchronization

UI shall seek playback when an event or position timeline entry is selected.

---

## 5) Derived Analytics

### FR-5.1 Analytics Computation

System shall compute analytics from stored manual annotations.

### FR-5.2 Deterministic Output

Analytics outputs shall be deterministic for equivalent stored state.

---

## 6) Dataset Validation + Export

### FR-6.1 Validation Report

System shall provide dataset validation feedback using stored match/annotation/video metadata data.

### FR-6.2 Deterministic JSON Export

System shall export deterministic JSON representing current stored dataset state.

---

## 7) Persistence Modes and Runtime Behavior

### FR-7.1 PostgreSQL Mode

When `DATABASE_URL` is configured, system shall use PostgreSQL repositories and migrations.

### FR-7.2 In-Memory Mode

When `DATABASE_URL` is not configured, system shall use in-memory repositories with same API surface.

---

## Explicit Non-Requirements (Out of Scope for Implemented V1)

The system does not currently require:

1. video upload pipeline
2. cloud storage/transcoding
3. pose estimation or 3D replay generation
4. automated event detection
5. AI commentary generation

---

## Terminology Rules

- Current implemented term: **video metadata attachment**.
- Future planning term: **video upload pipeline**.
