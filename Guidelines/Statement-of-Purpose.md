# ScrambleIQ
## Statement of Purpose

> **Status: Current source of truth (implemented V1 manual-first baseline).**

### Overview

ScrambleIQ provides a manual-first grappling match review workflow.

The current product purpose is to help coaches and athletes capture structured annotations, synchronize timeline review with video playback, and produce deterministic analytics/export outputs from manual data.

---

### Product Objective

ScrambleIQ exists to improve consistency and speed of match review **without** automation dependence.

The implemented Version 1 objective is to provide:

1. reliable manual annotation workflows
2. synchronized timeline + playback review
3. deterministic data outputs for downstream analysis workflows

---

### Current Implemented Scope (V1)

Version 1 includes:

- match create/read/update/delete workflows
- manual event timeline annotation
- manual position timeline annotation
- video metadata attachment (not media upload)
- analytics derived from manual annotations
- dataset validation and deterministic JSON export
- PostgreSQL mode and in-memory fallback mode

---

### Explicitly Not Implemented in V1

Version 1 does **not** implement:

- video upload pipeline
- pose estimation
- 3D replay/reconstruction
- automated event detection
- AI-generated commentary

These may appear in future planning documents but are not current behavior.

---

### Product Principle

ScrambleIQ is intentionally manual-first so users can produce auditable, deterministic review data before adding automation research.

---

### Terminology Rules

- Current: **video metadata attachment**.
- Future-only: **video upload pipeline**.

---

### Summary

ScrambleIQ’s implemented purpose is to deliver a dependable manual annotation and review foundation for grappling analysis, with clearly bounded current scope and clearly labeled future-state planning.
