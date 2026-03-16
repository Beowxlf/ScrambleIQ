# ScrambleIQ
## Problem Statement

### Overview

Grappling match analysis is currently performed primarily through manual video review. Coaches and athletes typically watch recorded matches and attempt to identify technical details such as posture breaks, positional transitions, control sequences, and mistakes during exchanges.

This process is slow, inconsistent, and highly dependent on the reviewer’s experience.

ScrambleIQ is intended to address this limitation by transforming match footage into structured analytical data that can be reviewed more efficiently and consistently.

---

### Current State of Match Analysis

Most grappling analysis today relies on one of the following methods:

1. Manual video review by coaches or athletes.
2. Slow-motion replay during repeated viewing.
3. Clip editing and timestamp annotations.
4. Post-match discussion and subjective interpretation.

These methods depend heavily on human attention and expertise. As a result, the depth and accuracy of analysis varies significantly between reviewers.

Even experienced coaches may miss technical details during complex exchanges due to the speed of grappling transitions and the visual complexity of two athletes interacting simultaneously.

---

### Key Limitations of Current Analysis Methods

#### 1. Time Consumption

Reviewing a grappling match in detail often requires watching the video multiple times.

Coaches frequently pause, rewind, and replay sections in order to identify key moments. This slows the review process and limits how many matches can realistically be analyzed.

---

#### 2. Human Perception Limits

Fast transitions such as scrambles, guard passes, and takedown attempts involve multiple joint movements and positional shifts occurring simultaneously.

Important technical details such as:

- hip angle changes
- weight distribution
- posture breaks
- frame placement
- hand positioning

may occur too quickly to reliably observe during normal playback.

---

#### 3. Skill Dependency

The quality of match analysis depends on the experience and knowledge of the reviewer.

Highly skilled coaches may identify subtle details that less experienced practitioners overlook. This creates a gap in analysis quality between different users.

Manual analysis therefore does not scale well across large groups of athletes or teams.

---

#### 4. Lack of Structured Data

Current video review tools treat matches as simple media files.

They do not extract structured information such as:

- joint movement patterns
- positional transitions
- movement timelines
- event detection
- positional control duration

Without structured data, deeper analysis requires significant manual effort.

---

#### 5. Limited Visualization

Traditional video footage is restricted to the camera angle used during recording.

This limits the viewer’s ability to observe certain technical details such as:

- body alignment
- limb positioning relative to the opponent
- angle of movement during transitions

Changing perspective is not possible without multiple cameras or manual animation.

---

### Resulting Problem

Because of these limitations, grappling analysis today is:

- slow
- inconsistent
- difficult to scale
- dependent on reviewer skill
- constrained by video perspective

This reduces the effectiveness of match review as a training tool.

---

### Desired Outcome

An improved analysis system should allow grappling footage to be processed into structured information that highlights meaningful moments in a match.

Such a system should:

1. Allow direct video upload.
2. Detect and track athlete movement.
3. reconstruct movement using simplified 3D visualization.
4. identify key positional transitions.
5. generate timestamped analytical observations.

The goal is to reduce the time required for analysis while improving the consistency and clarity of technical review.

---

### ScrambleIQ Approach

ScrambleIQ addresses these limitations by applying computer vision and machine learning to match footage.

The system processes uploaded videos to extract movement data and represent the exchange through a simplified 3D skeletal reconstruction.

Key match events and positional changes can then be identified and summarized through AI-generated coaching commentary.

This approach converts grappling footage from passive media into an analyzable dataset that supports faster and more structured coaching review.

---

### Scope Constraint

ScrambleIQ Version 1 intentionally limits its scope in order to establish a stable technical foundation.

The first version focuses on:

- No-Gi grappling matches
- single camera video input
- MP4 video format
- maximum match length of 10 minutes
- stable footage requirements
- two athletes on screen

These constraints allow the system to deliver reliable functionality before expanding to additional rule sets and analysis capabilities.

---

### Summary

The central problem ScrambleIQ addresses is the inefficiency and inconsistency of manual grappling match analysis.

By transforming raw match footage into structured motion data, simplified 3D replay, and AI-assisted coaching observations, ScrambleIQ aims to improve the speed, clarity, and accessibility of grappling analysis.
