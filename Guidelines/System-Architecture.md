# ScrambleIQ
## System Architecture Document

### Document Purpose

This document defines the high level system architecture for ScrambleIQ Version 1.

The purpose of this document is to describe the major technical components of the platform, how those components interact, and how match footage moves through the system from upload to analysis review.

This document describes the architecture of the system at a structural level. It does not define implementation level code details.

---

# System Objective

ScrambleIQ is a coach focused grappling analysis platform that accepts uploaded match footage, processes the video through pose tracking and event detection pipelines, generates a simplified 3D replay, and presents AI generated coaching observations through a review interface.

The Version 1 architecture must support the following core objectives:

1. Accept MP4 match uploads.
2. Validate and queue uploaded videos.
3. Process videos asynchronously.
4. Extract and track athlete joint movement.
5. Generate a simplified 3D skeletal reconstruction.
6. Detect grappling events and positional changes.
7. Generate timestamped AI commentary.
8. Present synchronized analysis results in a review interface.

---

# Architecture Overview

ScrambleIQ Version 1 is composed of the following major layers:

1. **Frontend Application**
2. **Backend API Layer**
3. **Video Processing Pipeline**
4. **AI and ML Inference Layer**
5. **Analysis and Commentary Layer**
6. **Data Storage Layer**
7. **Job Queue and Worker Layer**

Each layer has a defined role in the system.

---

# High Level Component Model

## 1. Frontend Application

The frontend application is responsible for user interaction.

Primary responsibilities include:

1. video upload
2. upload validation feedback
3. processing status display
4. match review interface
5. video playback
6. 3D replay viewing
7. timeline navigation
8. AI commentary display

The frontend must provide a clear workflow for coaches to submit matches and review results.

---

## 2. Backend API Layer

The backend API layer is responsible for application control logic and communication between the frontend and internal services.

Primary responsibilities include:

1. handling upload requests
2. validating metadata
3. creating analysis jobs
4. exposing processing status
5. serving analysis results
6. coordinating access to stored match data

The API layer acts as the central control plane for the application.

---

## 3. Video Processing Pipeline

The video processing pipeline is responsible for converting uploaded match footage into analysis ready intermediate data.

Primary responsibilities include:

1. video decoding
2. frame extraction
3. frame timestamp preservation
4. preprocessing for pose estimation
5. delivery of frames to downstream analysis components

This layer prepares raw video for AI and ML inference.

---

## 4. AI and ML Inference Layer

The AI and ML inference layer is responsible for extracting structured movement information from video frames.

Primary responsibilities include:

1. multi person pose detection
2. joint coordinate extraction
3. cross frame joint tracking
4. athlete identity separation
5. motion smoothing
6. 3D skeletal estimation
7. event detection

This layer transforms visual data into structured movement data.

---

## 5. Analysis and Commentary Layer

The analysis and commentary layer is responsible for turning movement and event data into user facing match insights.

Primary responsibilities include:

1. event timeline construction
2. positional phase summarization
3. timestamp linking
4. AI generated coaching commentary
5. confidence annotation

This layer converts machine outputs into coach usable analysis.

---

## 6. Data Storage Layer

The data storage layer is responsible for storing uploaded media, intermediate analysis artifacts, and final analysis results.

Primary storage domains include:

1. raw uploaded video
2. extracted frame metadata
3. pose tracking data
4. event detection records
5. 3D replay data
6. commentary output
7. job status information

The storage layer must support both active processing and later retrieval.

---

## 7. Job Queue and Worker Layer

The job queue and worker layer is responsible for asynchronous execution of video processing tasks.

Primary responsibilities include:

1. accepting new jobs
2. scheduling work
3. processing jobs in background workers
4. handling retry or failure states
5. updating job progress

This layer prevents long running video analysis tasks from blocking the main application flow.

---

# End to End System Flow

The system operates through the following sequence:

1. User uploads MP4 video through the frontend.
2. Frontend sends upload request to backend API.
3. Backend validates file type and duration.
4. Backend stores uploaded video and creates an analysis job.
5. Job is placed into the processing queue.
6. Worker retrieves job from queue.
7. Video processing pipeline extracts frames and metadata.
8. AI and ML inference layer performs pose tracking and athlete separation.
9. System generates simplified 3D replay data.
10. Event detection logic identifies target grappling events.
11. Analysis layer generates AI commentary tied to timestamps.
12. Processed analysis artifacts are stored.
13. Backend marks job as complete.
14. Frontend retrieves analysis results.
15. User reviews synchronized match analysis.

---

# Logical Architecture by Subsystem

## Upload Subsystem

### Purpose

Accept and validate incoming match footage.

### Inputs

1. MP4 video file
2. upload request metadata

### Outputs

1. stored raw video
2. analysis job record

### Key Constraints

1. MP4 only
2. maximum video duration of 10 minutes
3. stable footage expected

---

## Processing Subsystem

### Purpose

Convert uploaded video into structured analysis inputs.

### Inputs

1. stored raw video
2. job metadata

### Outputs

1. extracted frames
2. frame timestamps
3. normalized video data

### Key Constraints

1. single camera input
2. two athletes expected
3. variable quality footage may degrade results

---

## Pose Tracking Subsystem

### Purpose

Detect and track athlete joints over time.

### Inputs

1. extracted video frames

### Outputs

1. joint coordinates
2. tracked movement trajectories
3. detection confidence values

### Key Constraints

1. overlap may reduce accuracy
2. occlusion may create uncertainty
3. identity continuity is probabilistic

---

## 3D Reconstruction Subsystem

### Purpose

Generate a simplified 3D stick figure replay from tracked movement data.

### Inputs

1. tracked joint data
2. frame timestamps

### Outputs

1. 3D joint positions
2. skeleton connection data
3. replay timeline state

### Key Constraints

1. single camera depth estimation is approximate
2. reconstruction is not photorealistic
3. replay is analytical, not biomechanically authoritative

---

## Event Detection Subsystem

### Purpose

Infer grappling events from movement and positional patterns.

### Inputs

1. pose trajectories
2. athlete identity data
3. reconstructed positional changes

### Outputs

1. event type
2. event timestamps
3. event confidence values

### Key Constraints

1. events are probabilistic
2. complex scrambles may be ambiguous
3. event classification is not official scoring

---

## Commentary Subsystem

### Purpose

Generate coaching oriented analysis from structured event and movement data.

### Inputs

1. event records
2. positional summaries
3. trajectory features
4. confidence scores

### Outputs

1. timestamped coaching observations
2. commentary segments
3. summary analysis

### Key Constraints

1. commentary must stay grounded in structured data
2. commentary must not claim medical or judging authority
3. uncertain outputs should be limited or flagged

---

# Interface Architecture

The Version 1 frontend includes the following primary interface modules:

## 1. Upload Interface

Functions:

1. file selection
2. upload initiation
3. validation feedback
4. job creation confirmation

---

## 2. Processing Status Interface

Functions:

1. display queued status
2. display active processing state
3. display completion state
4. display failure state

---

## 3. Match Review Interface

Functions:

1. original video playback
2. pose overlay display
3. 3D replay panel
4. event timeline
5. commentary panel

This interface is the primary review environment for coaches.

---

# Data Architecture

## Data Categories

The system stores the following categories of data:

1. **Raw Video Data**
2. **Processing Metadata**
3. **Pose Tracking Data**
4. **3D Replay Data**
5. **Event Detection Data**
6. **Commentary Data**
7. **Job State Data**

---

## Example Logical Entities

### Match

Stores information about a submitted match.

Example attributes:

1. match_id
2. upload_time
3. source_filename
4. duration
5. processing_status

### Pose Frame

Stores tracked pose data for one point in time.

Example attributes:

1. frame_id
2. timestamp
3. athlete_1_joint_positions
4. athlete_2_joint_positions
5. confidence_values

### Event Record

Stores one detected grappling event.

Example attributes:

1. event_id
2. match_id
3. event_type
4. start_time
5. end_time
6. athlete_id
7. confidence

### Commentary Record

Stores one AI generated observation.

Example attributes:

1. commentary_id
2. match_id
3. timestamp
4. text
5. related_event_id
6. confidence

---

# Job Processing Architecture

## Job Lifecycle

Each uploaded match passes through the following states:

1. uploaded
2. validated
3. queued
4. processing
5. analyzed
6. complete
7. failed

## Worker Responsibilities

Workers are responsible for:

1. loading queued jobs
2. running video processing
3. running AI and ML inference
4. generating analysis outputs
5. storing results
6. updating job status

This design allows the frontend and API to remain responsive while long running jobs execute in the background.

---

# Synchronization Model

The match review interface relies on synchronized time based analysis.

The following components must remain aligned to the same match timestamp:

1. original video playback
2. pose overlay
3. 3D replay
4. event timeline
5. commentary selection

Any timeline interaction in one component must update the others.

Example:

1. clicking an event marker updates the video frame
2. selecting commentary jumps to the associated timestamp
3. scrubbing playback updates the 3D replay state

---

# Security and Access Considerations

Version 1 architecture should account for the following baseline controls:

1. controlled upload validation
2. secure storage of uploaded video
3. separation of raw video and processed outputs
4. controlled access to analysis results
5. protection against malformed file uploads

Detailed security requirements should be defined in a separate non functional or security document.

---

# Logging and Observability

The system should maintain logs for the following events:

1. upload attempts
2. validation results
3. job creation
4. processing start and completion
5. worker failures
6. analysis generation errors
7. result retrieval events

Observability is required for debugging failed analysis jobs and tracking pipeline performance.

---

# Version 1 Architectural Constraints

The architecture of Version 1 intentionally assumes the following constraints:

1. single camera video only
2. MP4 uploads only
3. No Gi grappling only
4. maximum 10 minute match duration
5. two athlete assumption
6. offline post match analysis only
7. simplified 3D stick figure replay only

These constraints reduce initial system complexity and support more reliable delivery of core functionality.

---

# Future Architectural Expansion Areas

The architecture should allow future support for:

1. additional grappling rule sets
2. multi camera ingestion
3. richer 3D reconstruction
4. athlete history and cross match analytics
5. clip export generation
6. report generation
7. team and gym level dashboards

Version 1 does not implement these capabilities but should avoid blocking them unnecessarily.

---

# Summary

ScrambleIQ Version 1 is structured as a layered system composed of a frontend application, backend API, asynchronous processing pipeline, AI and ML inference layer, commentary generation layer, storage layer, and worker based job execution model.

This architecture is designed to support a complete coach focused workflow from video upload through processed match review while maintaining clear separation between user interaction, heavy analysis tasks, and stored results.
