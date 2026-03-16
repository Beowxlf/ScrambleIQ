# ScrambleIQ
## Version 1 Scope Document

### Overview

This document defines the functional boundaries of the first release of ScrambleIQ.

Version 1 focuses on delivering a stable system capable of accepting grappling match footage, processing that footage into tracked movement data, generating a simplified 3D reconstruction of the match, and producing AI-generated coaching observations.

The goal of Version 1 is to establish a reliable analysis pipeline rather than a fully comprehensive grappling intelligence platform.

---

## Supported Grappling Format

Version 1 supports the following match format:

- No-Gi grappling

Additional grappling rule sets may be introduced in later versions of the platform.

---

## Intended Users

Primary users for Version 1 are:

- grappling coaches

Secondary users may include:

- athletes reviewing their own matches

The interface is designed primarily to support coaching workflows.

---

## Supported Video Input

Version 1 accepts the following video input conditions:

**File Format**

- MP4 only

**Maximum Match Duration**

- 10 minutes per upload

**Camera Requirements**

- single camera input
- stable footage required

Videos that contain excessive camera movement or poor visibility may produce degraded analysis results.

---

## Athlete Detection Constraints

Version 1 assumes the following conditions:

- two athletes on screen
- both athletes remain visible for most of the match

Heavy occlusion or full body overlap may reduce tracking accuracy.

---

## Core System Capabilities

Version 1 provides the following capabilities.

### 1. Video Upload

Users can upload a grappling match video to the system for analysis.

The system validates file format and match duration before processing.

---

### 2. Joint Detection and Tracking

The system detects and tracks athlete joint positions across video frames.

Tracked joints may include major body points such as:

- shoulders
- elbows
- wrists
- hips
- knees
- ankles

Joint tracking produces motion data that is used for replay and analysis.

---

### 3. Athlete Identity Tracking

The system attempts to maintain identity separation between both athletes during the match.

Identity tracking may degrade during moments of heavy overlap.

---

### 4. Simplified 3D Reconstruction

ScrambleIQ Version 1 generates a simplified 3D stick-figure representation of the match.

This reconstruction allows users to:

- view the exchange from multiple angles
- rotate the viewing perspective
- observe movement trajectories

The reconstruction is an estimated representation and should not be interpreted as precise biomechanical reconstruction.

---

### 5. Match Timeline Navigation

Users can navigate the match timeline and review specific moments of the exchange.

The system highlights segments that contain detected events or notable movement patterns.

---

### 6. AI-Generated Coaching Commentary

The system generates coaching-style observations tied to specific timestamps within the match.

These observations are based on detected movement patterns and positional changes.

AI commentary is intended to support coaching analysis and should not be interpreted as authoritative technical judgment.

---

## Match Events Targeted for Detection

Version 1 aims to detect the following types of grappling events.

- takedown attempts
- guard pulls
- sweeps
- scrambles
- guard passes
- reversals
- top control phases
- submission attempts

Detection reliability may vary depending on video quality and athlete visibility.

---

## Interface Capabilities

The Version 1 interface supports:

- video playback
- simplified 3D replay
- timeline navigation
- timestamped analysis notes

The interface is designed for match review rather than live analysis.

---

## Known Technical Constraints

Version 1 operates under several technical limitations.

These include:

- single camera depth estimation limitations
- reduced tracking accuracy during athlete overlap
- limited reconstruction accuracy for complex body entanglement
- reliance on stable video footage

These constraints are expected in early versions of the system.

---

## Excluded Features

The following capabilities are intentionally excluded from Version 1.

- multi-camera reconstruction
- photorealistic athlete models
- real-time match analysis
- mobile recording support
- automated scoring
- referee decision assistance
- athlete performance tracking across matches
- rule-set specific judging systems

These features may be explored in later development phases.

---

## Version 1 Success Criteria

Version 1 is considered successful if the system can:

1. accept and process match footage reliably
2. detect and track athlete joint movement
3. generate a simplified 3D replay of the match
4. highlight meaningful segments of the exchange
5. produce useful coaching observations tied to timestamps

---

## Summary

ScrambleIQ Version 1 focuses on building a reliable match analysis pipeline.

The system ingests grappling footage, extracts motion data, reconstructs a simplified 3D representation of the exchange, and generates AI-assisted coaching commentary.

Future development may expand analysis depth, visualization fidelity, and supported grappling formats.
