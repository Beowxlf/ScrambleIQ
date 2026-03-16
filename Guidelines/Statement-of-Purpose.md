# ScrambleIQ
## Statement of Purpose

### Overview

ScrambleIQ is a grappling analysis application designed to transform match footage into structured technical analysis. The system allows coaches to upload match video, process that footage using computer vision and machine learning, generate a simplified 3D skeletal reconstruction of the exchange, and produce AI-generated coaching commentary based on key movement and positional events.

The purpose of ScrambleIQ is to improve the speed, consistency, and depth of grappling match analysis.

Manual video review is currently limited by the reviewer’s time, experience, and ability to consistently identify technical details during fast exchanges. Important moments such as posture breaks, positional transitions, joint positioning, and movement patterns are often missed or require repeated viewing.

ScrambleIQ addresses this limitation by converting raw match footage into structured movement data and presenting that information through an analyzable interface designed specifically for coaching.

---

### Product Objective

The primary objective of ScrambleIQ is to allow coaches to review grappling matches through a structured analysis system rather than raw video alone.

The system processes uploaded match footage and produces:

- tracked athlete joint positions over time
- a simplified 3D stick-figure reconstruction of the match
- detection of key match events and positional phases
- AI-generated coaching observations tied to specific timestamps

This allows coaches to quickly identify meaningful technical moments within a match without needing to manually review the entire video repeatedly.

---

### Initial Product Scope

The first version of ScrambleIQ is intentionally limited in scope in order to establish a stable technical foundation.

Version 1 includes:

- MP4 video upload
- single camera video input
- maximum match duration of 10 minutes
- requirement for stable footage
- support for two athletes on screen
- joint detection and motion tracking
- simplified 3D stick-figure replay
- rotatable viewing perspective
- timestamped AI coaching commentary

Version 1 is focused on **No-Gi grappling analysis**.

Future versions may expand to additional grappling formats and rule sets.

---

### Target Users

The primary users of ScrambleIQ are **grappling coaches**.

Secondary users include **athletes reviewing their own matches**.

The interface is designed to support users across multiple skill levels, from beginner to advanced practitioners, while still providing value to experienced coaches.

---

### Intended System Behavior

ScrambleIQ analyzes match footage and presents a processed representation of the exchange rather than simply displaying the original video.

The system performs the following high-level functions:

1. Accept uploaded match footage.
2. Detect and track athlete joints over time.
3. Estimate athlete movement positions.
4. Reconstruct motion using a simplified 3D skeletal model.
5. Identify key match events and positional phases.
6. Generate coach-style analytical commentary.

The goal is to assist human analysis, not replace expert coaching judgment.

---

### Technical Boundaries

ScrambleIQ makes no claim of perfect biomechanical reconstruction.

The system provides **estimated movement analysis** based on available video input.

Limitations include:

- single camera video limits depth estimation accuracy
- joint tracking may degrade during heavy body overlap
- event detection may contain uncertainty
- AI commentary is based on detected movement patterns and should be interpreted as analytical assistance rather than authoritative judgment

Confidence indicators may be used to signal uncertain analysis results.

---

### Long-Term Direction

While Version 1 focuses on No-Gi grappling analysis, the long-term direction of ScrambleIQ includes:

- additional grappling rule sets
- expanded event detection
- improved 3D reconstruction
- enhanced positional analytics
- athlete performance tracking
- match comparison tools
- clip generation and coaching reports

The platform is intended to evolve into a comprehensive grappling analysis system while maintaining a structured and controlled feature expansion process.

---

### Summary

ScrambleIQ exists to make grappling match analysis faster, more structured, and more accessible.

By combining video ingestion, pose tracking, simplified 3D replay, and AI-generated coaching insights, the system transforms raw match footage into a tool that supports deeper technical review and more effective coaching.
