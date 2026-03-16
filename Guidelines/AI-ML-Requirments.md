# ScrambleIQ
## AI and Machine Learning Requirements

### Document Purpose

This document defines the requirements for the artificial intelligence and machine learning components used in ScrambleIQ Version 1.

The purpose of these components is to extract structured movement information from grappling match footage and generate coaching-oriented analytical observations.

This document describes the responsibilities, outputs, limitations, and constraints of the AI and ML systems used within ScrambleIQ.

---

# AI and ML System Overview

ScrambleIQ uses machine learning and computer vision techniques to convert match footage into analyzable movement data.

The AI and ML systems are responsible for the following functions:

1. Human pose detection.
2. Joint tracking across frames.
3. Athlete identity separation.
4. Movement trajectory estimation.
5. Simplified 3D skeletal reconstruction.
6. Grappling event detection.
7. AI-generated coaching commentary.

These systems operate on uploaded match footage and produce structured analytical outputs used by the application interface.

---

# AI and ML Processing Pipeline

The AI/ML processing pipeline operates in the following stages.

1. Video frame extraction.
2. Pose estimation on each frame.
3. Joint tracking across frames.
4. Athlete identity separation.
5. Movement trajectory smoothing.
6. 3D skeletal reconstruction estimation.
7. Grappling event detection.
8. AI-generated commentary generation.

Each stage produces intermediate data that may be used by later stages of analysis.

---

# Pose Detection Requirements

### ML-1 Human Pose Estimation

The system shall detect human body joint positions within each processed video frame.

Tracked joints include:

- head
- shoulders
- elbows
- wrists
- hips
- knees
- ankles

The model shall output 2D coordinates for detected joints.

---

### ML-2 Multi-Person Detection

The system shall detect up to two athletes within the match footage.

The model must support multi-person pose estimation.

---

### ML-3 Joint Confidence Scores

Each detected joint shall include a confidence score indicating detection reliability.

Low-confidence detections may be flagged during analysis.

---

# Joint Tracking Requirements

### ML-4 Cross-Frame Joint Tracking

The system shall track joint movement across sequential frames.

Joint motion trajectories shall be recorded over time.

---

### ML-5 Movement Smoothing

The system may apply smoothing techniques to reduce noise in joint position tracking.

Smoothing must preserve meaningful movement transitions.

---

# Athlete Identity Tracking

### ML-6 Athlete Identity Separation

The system shall attempt to maintain consistent identity assignment for each athlete throughout the match.

Athletes shall be assigned persistent identifiers.

Example:

- athlete_1
- athlete_2

---

### ML-7 Identity Degradation Handling

If identity tracking becomes uncertain during heavy overlap, the system shall flag the segment as uncertain.

---

# 3D Reconstruction Estimation

### ML-8 3D Pose Estimation

The system shall estimate a simplified 3D skeletal representation using detected joint data.

This reconstruction is an estimated representation derived from single-camera input.

---

### ML-9 Reconstruction Output

The 3D reconstruction shall output:

- joint positions
- skeletal connections
- frame timestamps

---

### ML-10 Depth Estimation Constraints

Single-camera video limits the accuracy of depth estimation.

The system must treat reconstructed depth values as approximations.

---

# Grappling Event Detection

### ML-11 Event Detection Objective

The system shall attempt to detect grappling events based on movement patterns and positional changes.

Target events include:

- takedown attempts
- guard pulls
- sweeps
- scrambles
- guard passes
- reversals
- top control phases
- submission attempts

---

### ML-12 Event Timestamping

Detected events shall include:

- start time
- end time
- event type
- confidence score

---

### ML-13 Event Detection Limitations

Event detection is based on movement heuristics and model predictions.

Event detection may contain uncertainty and should not be treated as official match scoring.

---

# AI Commentary System

### AI-1 Commentary Generation

The system shall generate coaching-style analytical observations based on detected events and movement patterns.

---

### AI-2 Timestamp References

Generated commentary must reference timestamps within the match.

---

### AI-3 Coaching-Oriented Tone

The commentary system shall produce analysis written in a coaching-oriented style.

---

### AI-4 Commentary Inputs

The AI commentary system shall use structured inputs including:

- detected events
- movement trajectories
- positional transitions
- event confidence values

---

### AI-5 Commentary Constraints

The AI system must not generate claims outside the available data.

The system must avoid:

- injury diagnosis
- intent attribution
- definitive judging decisions
- claims of guaranteed technical correctness

---

# Confidence Scoring

### ML-14 Confidence Outputs

All AI-generated outputs shall include confidence indicators where applicable.

Confidence values may apply to:

- joint detections
- event detection
- positional phase estimation

---

# Data Outputs

The AI/ML pipeline shall produce structured data outputs including:

- joint position data
- athlete identifiers
- movement trajectories
- event detection records
- commentary results

Outputs shall be structured in machine-readable format suitable for downstream processing.

---

# Training Data Considerations

Training data used for pose detection and event detection may include:

- grappling match footage
- synthetic pose data
- publicly available pose datasets

Training datasets must contain examples of two interacting athletes to improve detection accuracy.

---

# Known Limitations

The AI/ML system operates under several limitations.

These include:

- occlusion during athlete overlap
- depth estimation uncertainty from single-camera video
- reduced accuracy in poor lighting conditions
- event detection ambiguity during complex scrambles

These limitations are expected in early versions of the platform.

---

# Summary

The AI and machine learning systems in ScrambleIQ convert grappling match footage into structured movement analysis.

These systems perform pose detection, joint tracking, 3D skeletal reconstruction, event detection, and AI-generated coaching commentary.

The outputs of these systems support the core functionality of the ScrambleIQ analysis platform.
