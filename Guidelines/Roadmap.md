# ScrambleIQ
## Product Roadmap

### Document Purpose

This document defines the planned development progression for ScrambleIQ from the implemented manual-first Version 1 baseline to later workflow and analysis expansions.

The roadmap is organized into phases so each stage ships usable value while preserving reliability and manageable scope.

---

# Product Development Philosophy

ScrambleIQ roadmap planning follows these principles:

1. keep annotation workflows manual-first until usability and data quality are proven
2. prioritize deterministic behavior and operational reliability before automation
3. expand capabilities incrementally with clear user value per phase
4. defer ML/video ingestion research until core coaching workflows are stable and well-instrumented

---

# Phase 1
## Version 1.0
### Manual Annotation Platform Foundation

Version 1.0 establishes a reliable manual-first platform for match review and structured annotation.

### Delivered Outcomes

1. match CRUD (create, list/filter, read, update, delete)
2. manual event timeline annotation
3. manual position timeline annotation
4. video metadata attach/edit/delete with synchronized playback seek behavior
5. derived analytics generated from stored manual annotations
6. dataset validation and deterministic JSON export
7. PostgreSQL-backed persistence when `DATABASE_URL` is set
8. in-memory fallback when `DATABASE_URL` is not set

### Constraints (Intentional)

1. no file upload pipeline
2. no cloud storage/transcoding
3. no pose estimation or 3D replay
4. no automated event detection
5. no AI-generated coaching commentary

---

# Phase 2
## Version 1.1
### Annotation Throughput and Usability Refinement

Version 1.1 focuses on faster, clearer manual workflows without changing the manual-first model.

Phase 2 detailed scope and acceptance contract: `Guidelines/Phase-2-Kickoff.md`.

### Objectives

1. reduce annotation friction and click depth
2. improve timeline readability and edit confidence
3. strengthen dataset validation ergonomics
4. improve robustness for longer annotation sessions

### Planned Improvements

1. bulk/manual-entry quality-of-life improvements (for example keyboard-assisted annotation)
2. stronger filtering/sorting and timeline navigation aids
3. clearer validation issue surfacing and remediation guidance
4. improved form defaults and safer edit/delete interactions
5. performance optimizations for dense event/position timelines

---

# Phase 3
## Version 2.0
### Workflow Tooling Expansion

Version 2.0 expands coaching workflow tools built on top of the validated manual annotation core.

Phase 3 detailed scope and acceptance contract: `Guidelines/Phase-3-Kickoff.md`.

### Objectives

1. improve review collaboration and handoff workflows
2. support richer reporting from manually curated datasets
3. increase confidence in repeatable match breakdown routines

### Planned Features

1. reusable workflow templates/checklists for match review sessions
2. richer export/report formats derived from existing manual annotations
3. saved views/presets for common coaching review patterns
4. improved cross-session consistency tooling (taxonomy/label hygiene)

---

# Phase 4
## Version 2.5
### Reporting and Cross-Match Analysis

Version 2.5 introduces reporting and cross-match review capabilities built from validated manual datasets.

### Objectives

1. compare patterns across multiple manually annotated matches
2. support team/gym-level review operations
3. maintain deterministic outputs and auditability

### Planned Features

1. cross-match aggregate summaries from existing event/position datasets
2. athlete/team trend views based on manual records
3. collection-level validation and export workflows
4. structured reporting views for recurring coaching review questions

---

# Phase 5
## Version 2.8
### Media Preparation Workflows (Still Manual-First)

Version 2.8 introduces media preparation support that improves review readiness without adding automated analysis.

### Objectives

1. improve match media readiness for manual review sessions
2. reduce setup friction before annotation sessions
3. preserve deterministic, operator-controlled workflows

### Planned Features

1. metadata-first media preparation checklists
2. pre-review quality checks (duration/source consistency)
3. manual clip/bookmark preparation workflows tied to annotations
4. safer media metadata normalization tools

---

# Phase 6
## Version 3.0
### Video Ingestion and Automation Research (Post-Foundation)

Version 3.0 is reserved for research and staged prototyping of richer ingestion/automation capabilities, gated by proven value and reliability.

### Research Tracks (Exploratory)

1. managed video ingestion pipeline options (upload/storage/transcoding)
2. assisted annotation suggestions (human-in-the-loop)
3. broader analytics enrichment approaches
4. ML feasibility studies for detection/classification tasks

### Guardrails

1. research tracks must not regress manual-first production workflows
2. automated outputs must remain reviewable and overrideable by users
3. promotion of research features to production requires separate scope documents and acceptance gates

---

# Summary

ScrambleIQ now progresses from an implemented manual-first annotation platform toward higher-throughput workflows, reporting and cross-match analysis, media preparation support, and only later carefully gated automation research.

This sequence preserves product reliability and aligns roadmap claims with current implementation reality.
