# ScrambleIQ
## Known Limitations Document

### Document Purpose

This document defines the known technical limitations of ScrambleIQ Version 1.

The purpose of this document is to clearly describe where the system may produce reduced accuracy, incomplete analysis, or uncertain results.

These limitations arise from constraints in computer vision, machine learning, single-camera video analysis, and the complexity of grappling movement.

The limitations described here should be understood as expected behaviors for the first version of the platform.

---

# Video Input Limitations

## Single Camera Constraint

ScrambleIQ Version 1 processes match footage from a single camera source.

Single camera footage limits the system’s ability to accurately estimate depth and spatial relationships between athletes.

As a result:

- reconstructed 3D positions are approximations
- some positional relationships may be estimated incorrectly
- overlapping athletes may produce ambiguous joint positions

---

## Camera Stability Requirements

Version 1 assumes that uploaded footage is relatively stable.

Highly unstable footage may degrade the accuracy of pose tracking and event detection.

Examples of problematic footage include:

- handheld recordings with excessive motion
- frequent camera repositioning
- rapid zoom changes
- partial field of view shifts

The system may still process such footage but analysis quality may be reduced.

---

## Lighting Conditions

Pose detection accuracy depends on sufficient lighting and contrast.

Poor lighting conditions may result in:

- missed joint detections
- unstable tracking
- inconsistent pose estimation

Low contrast backgrounds may also reduce detection accuracy.

---

## Athlete Visibility

ScrambleIQ assumes that both athletes remain visible for most of the match.

Situations that may reduce detection accuracy include:

- athletes moving outside the camera frame
- partial body visibility
- obstruction by referees or other individuals

When athletes are partially or fully outside the frame, tracking continuity may degrade.

---

# Pose Tracking Limitations

## Body Occlusion

Grappling matches frequently involve close body contact between athletes.

During these moments, limbs and joints may become hidden from the camera.

This may cause:

- temporary loss of joint detection
- misidentified joints
- identity switching between athletes

The system may mark segments with low confidence when this occurs.

---

## Athlete Identity Continuity

The system attempts to maintain identity separation between two athletes.

However, heavy overlap during scrambles or positional transitions may cause identity ambiguity.

Examples include:

- rapid position reversals
- body stacking positions
- limb entanglement

During these moments, athlete identity tracking may become uncertain.

---

# 3D Reconstruction Limitations

## Depth Estimation

Depth estimation is derived from single-camera pose inference.

Because only one camera angle is available, true depth measurements are not available.

This means:

- depth values are estimated rather than measured
- some spatial relationships may appear distorted
- reconstructed body positions may differ from actual positions

The 3D replay should be interpreted as an analytical visualization rather than a precise biomechanical model.

---

## Simplified Skeletal Representation

Version 1 uses a simplified stick-figure model for match reconstruction.

The system does not produce:

- full body mesh models
- muscle or body shape representation
- realistic athlete animation

The purpose of the stick-figure representation is to highlight movement patterns rather than provide visual realism.

---

# Event Detection Limitations

## Probabilistic Event Detection

Event detection in ScrambleIQ is based on movement patterns and positional changes inferred from pose tracking.

Because grappling exchanges are complex, event classification may sometimes be uncertain.

Examples include:

- scrambles that resemble sweeps
- transitions that resemble guard passes
- overlapping positional phases

Event detection should therefore be interpreted as probabilistic rather than definitive.

---

## Ambiguous Grappling Positions

Certain grappling positions may appear visually similar from a single camera perspective.

Examples include:

- half guard vs partial guard recovery
- loose side control vs guard passing attempts
- scramble transitions vs reversals

In such cases, the system may detect the closest matching event category.

---

# AI Commentary Limitations

## Commentary Source Data

AI-generated commentary is based on structured movement data and detected events.

If upstream detection contains uncertainty, the commentary may reflect that uncertainty.

The system does not independently verify grappling technique correctness.

---

## Interpretation Boundaries

AI commentary must not be interpreted as authoritative technical judgment.

The system does not replace coaching expertise.

The commentary system should be treated as an analytical aid rather than a definitive evaluation.

---

## Prohibited AI Claims

AI commentary must not produce claims related to:

- injury diagnosis
- medical recommendations
- official match scoring
- referee decision authority
- guaranteed technique correctness

The system provides observations rather than final judgments.

---

# Environmental Limitations

## Video Quality Variation

User-submitted footage may vary significantly in:

- resolution
- frame rate
- lighting
- camera stability

These variations may affect analysis accuracy.

The system does not currently enforce strict recording standards.

---

## Athlete Body Types

Large variation in athlete body shapes, clothing, and movement styles may affect pose detection accuracy.

Examples include:

- loose clothing
- non-standard grappling attire
- unusual camera angles

The pose estimation system is trained on general human pose datasets and may require adaptation for specific grappling scenarios.

---

# System Scope Limitations

Version 1 intentionally excludes several capabilities.

Examples include:

- multi-camera analysis
- real-time match analysis
- automatic scoring systems
- photorealistic 3D models
- athlete performance tracking across matches
- rule-set aware judging systems

These features may be introduced in future versions of the platform.

---

# Expected Improvement Areas

Several known limitations may improve in future versions of ScrambleIQ.

Potential improvements include:

- improved multi-person pose tracking
- enhanced occlusion handling
- better depth estimation methods
- expanded grappling event detection models
- refined AI commentary generation

These improvements depend on further model training, dataset expansion, and system iteration.

---

# Summary

ScrambleIQ Version 1 operates under known constraints related to single-camera video analysis, pose tracking limitations, event detection uncertainty, and simplified reconstruction methods.

These limitations are typical for early-stage computer vision systems operating on unconstrained user-submitted footage.

Despite these constraints, the platform aims to provide meaningful analytical insight by transforming match footage into structured movement data and AI-assisted coaching observations.
