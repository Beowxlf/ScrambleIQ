# ScrambleIQ
## User Flow Document

### Document Purpose

This document defines the interaction flow for users of ScrambleIQ Version 1.

The purpose of the user flow is to describe how a coach moves through the system from video upload to match analysis review.

This document focuses on user actions, system responses, and navigation through the application interface.

---

# Primary User

Primary user for Version 1:

- Grappling coach

Secondary user:

- Athlete reviewing match footage

The user flow is optimized for coaching workflows.

---

# System Workflow Overview

The typical user workflow consists of the following stages:

1. User uploads match footage.
2. System validates and queues the video.
3. Video is processed by the analysis pipeline.
4. Pose tracking and event detection occur.
5. AI commentary is generated.
6. Analysis results become available to the user.
7. User reviews the match using the analysis interface.

---

# User Flow Stages

## Stage 1: Video Upload

### User Actions

1. User navigates to the upload page.
2. User selects an MP4 match video.
3. User confirms upload.

### System Behavior

The system performs the following actions:

- validates video format
- verifies match duration is under 10 minutes
- accepts the upload
- places the job into the processing queue

### System Response

User receives confirmation that the video has been successfully uploaded and queued for analysis.

---

## Stage 2: Video Processing

### System Actions

The system processes the uploaded video through the analysis pipeline.

Processing steps include:

1. frame extraction
2. pose detection
3. joint tracking
4. athlete identity separation
5. 3D skeletal reconstruction
6. grappling event detection
7. AI commentary generation

### User Visibility

During this stage the user may see a processing status indicator.

Examples:

- queued
- processing
- analysis complete

---

## Stage 3: Analysis Completion

### System Behavior

When processing is complete, the system generates the following outputs:

- processed video with joint tracking overlay
- simplified 3D replay representation
- event timeline
- AI generated coaching observations

### System Response

User receives notification that analysis results are ready for review.

---

# Match Review Interface Flow

## Step 1: Open Analysis

User selects a processed match from the analysis list.

System loads the match review interface.

---

## Step 2: Video Review

The interface displays the original match footage.

Optional overlay displays:

- joint tracking markers
- skeletal movement visualization

Users may play, pause, and navigate the video.

---

## Step 3: 3D Replay

User can switch to the 3D replay view.

The 3D replay allows the user to:

- rotate the viewing perspective
- observe movement trajectories
- replay the match from different angles

---

## Step 4: Timeline Navigation

The timeline displays markers for detected events.

Examples:

- takedown attempt
- guard pass attempt
- sweep
- scramble
- submission attempt

User can click an event marker to jump to the corresponding timestamp.

---

## Step 5: AI Commentary Review

The analysis panel displays AI-generated coaching observations.

Each observation contains:

- timestamp reference
- event description
- coaching-oriented explanation

Users may select commentary entries to jump to the associated moment in the match.

---

# Interaction Between Interface Components

The match review interface contains the following primary components:

1. Video player
2. 3D replay viewer
3. event timeline
4. AI commentary panel

These components are synchronized through the match timeline.

Actions performed in one component update the others.

Example:

- selecting a commentary entry moves the video player to that timestamp
- selecting a timeline event updates the 3D replay frame

---

# Error Handling Flow

If video processing fails, the system should:

1. notify the user
2. provide a brief error message
3. allow the user to attempt upload again

Possible failure causes include:

- unsupported video format
- corrupted video file
- processing interruption

---

# Version 1 User Flow Summary

The Version 1 ScrambleIQ user experience follows this sequence:

1. Upload match video.
2. Wait for analysis processing.
3. Open completed analysis.
4. Review video with pose overlay.
5. View simplified 3D reconstruction.
6. Navigate match events using timeline markers.
7. Review AI-generated coaching commentary.

---

# Design Goal

The primary design goal for the user flow is to reduce the time required for a coach to analyze a match.

The interface should allow users to quickly locate meaningful moments in a match without manually scanning the entire video.

---

# Summary

ScrambleIQ transforms grappling match footage into an analyzable system.

The user workflow begins with video upload and ends with structured match review through synchronized video playback, 3D replay, event timeline navigation, and AI-generated coaching observations.
