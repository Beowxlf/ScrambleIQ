# ScrambleIQ
## Functional Requirements Specification (FRS)

### Document Purpose

This document defines the functional behavior required for ScrambleIQ Version 1. Functional requirements describe the system actions and responses necessary to support the core capabilities of the platform.

These requirements define **what the system must do**, not the implementation details of how those functions are built.

---

# System Overview

ScrambleIQ is a grappling analysis platform that processes uploaded match footage and converts the video into structured analytical outputs.

The system performs the following primary functions:

1. Accept match footage uploads.
2. Process video frames for athlete movement tracking.
3. Detect and track athlete joint positions.
4. Generate simplified 3D skeletal reconstructions of the match.
5. Identify grappling events and match phases.
6. Generate AI-assisted coaching commentary.
7. Present results through an interactive match review interface.

---

# Functional Requirement Categories

The system functional requirements are divided into the following categories:

1. Video Upload and Validation
2. Video Processing Pipeline
3. Joint Detection and Pose Tracking
4. Athlete Identity Tracking
5. 3D Reconstruction
6. Event Detection
7. AI Commentary Generation
8. Match Review Interface
9. Timeline Navigation
10. Data Storage and Retrieval

---

# 1. Video Upload and Validation

### FR-1.1 Video Upload

The system shall allow users to upload match footage for analysis.

Accepted video format:

- MP4

---

### FR-1.2 Upload Duration Limit

The system shall reject videos exceeding the maximum match duration.

Maximum duration:

- 10 minutes

---

### FR-1.3 File Validation

The system shall validate uploaded files before processing.

Validation checks include:

- file format
- file size
- video duration

If validation fails, the system shall return an error message to the user.

---

### FR-1.4 Upload Confirmation

The system shall notify the user when a video upload has been successfully received and queued for processing.

---

# 2. Video Processing Pipeline

### FR-2.1 Frame Extraction

The system shall extract video frames from uploaded match footage.

Extracted frames will be used for movement analysis.

---

### FR-2.2 Frame Sequencing

The system shall maintain chronological ordering of frames during processing.

Frame timestamps must be preserved.

---

### FR-2.3 Processing Queue

Uploaded videos shall be placed into a processing queue.

The system shall process queued jobs sequentially or through parallel workers.

---

# 3. Joint Detection and Pose Tracking

### FR-3.1 Joint Detection

The system shall detect human body joints within video frames.

Tracked joints may include:

- shoulders
- elbows
- wrists
- hips
- knees
- ankles

---

### FR-3.2 Joint Tracking Across Frames

The system shall track detected joints across sequential video frames.

Joint motion trajectories shall be recorded.

---

### FR-3.3 Tracking Confidence

The system shall associate a confidence value with detected joints.

Low confidence detections may be flagged during analysis.

---

# 4. Athlete Identity Tracking

### FR-4.1 Athlete Separation

The system shall attempt to maintain identity separation between two athletes throughout the match.

---

### FR-4.2 Identity Continuity

The system shall track each athlete consistently across frames.

Identity tracking may degrade during full body overlap.

---

# 5. Simplified 3D Reconstruction

### FR-5.1 3D Skeleton Generation

The system shall generate a simplified 3D skeletal representation of the match using tracked joint data.

---

### FR-5.2 Perspective Rotation

Users shall be able to rotate the viewing perspective of the reconstructed match.

---

### FR-5.3 Motion Playback

The reconstructed 3D scene shall support playback synchronized with the original match timeline.

---

# 6. Event Detection

### FR-6.1 Event Identification

The system shall attempt to detect grappling events within the match.

Target events include:

- takedown attempts
- guard pulls
- sweeps
- scrambles
- guard passes
- reversals
- top control
- submission attempts

---

### FR-6.2 Event Timestamping

Detected events shall be associated with timestamps within the match timeline.

---

### FR-6.3 Event Confidence

Each detected event shall include a confidence estimate.

---

# 7. AI Commentary Generation

### FR-7.1 Commentary Generation

The system shall generate AI-assisted commentary based on detected movement patterns and events.

---

### FR-7.2 Timestamp Referencing

Generated commentary shall reference specific timestamps within the match.

---

### FR-7.3 Coaching Style Output

Commentary output shall be written in a coaching analysis style.

---

# 8. Match Review Interface

### FR-8.1 Video Playback

Users shall be able to view the original match footage.

---

### FR-8.2 Pose Overlay

The system shall display joint tracking overlays on the video playback.

---

### FR-8.3 3D Replay View

Users shall be able to view the simplified 3D reconstruction.

---

### FR-8.4 Commentary Panel

AI-generated commentary shall be displayed in a dedicated analysis panel.

---

# 9. Timeline Navigation

### FR-9.1 Timeline Scrubbing

Users shall be able to navigate the match timeline.

---

### FR-9.2 Event Highlighting

Detected events shall be visually marked on the timeline.

---

### FR-9.3 Timestamp Navigation

Users shall be able to jump directly to timestamps referenced in commentary.

---

# 10. Data Storage and Retrieval

### FR-10.1 Video Storage

Uploaded match footage shall be stored for the duration required to complete processing.

---

### FR-10.2 Analysis Storage

Generated analysis data shall be stored for later retrieval.

Stored analysis data may include:

- joint movement data
- event detection results
- AI commentary
- 3D reconstruction data

---

### FR-10.3 Result Retrieval

Users shall be able to access analysis results after processing is complete.

---

# Summary

ScrambleIQ Version 1 must provide a complete analysis workflow that includes:

1. video upload
2. frame processing
3. joint detection
4. athlete tracking
5. simplified 3D reconstruction
6. grappling event detection
7. AI-assisted coaching commentary
8. interactive match review interface

These functional requirements define the system capabilities necessary to deliver the core ScrambleIQ analysis experience.
