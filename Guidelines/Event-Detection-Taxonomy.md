# ScrambleIQ
## Event Detection Taxonomy

### Document Purpose

This document defines the grappling events that ScrambleIQ attempts to detect during match analysis.

The taxonomy establishes standardized event definitions used by the AI and machine learning systems to interpret athlete movement and positional transitions within grappling matches.

Each event definition includes a description of the movement pattern that may indicate the event.

These definitions are used to produce structured event data that supports AI-generated coaching analysis.

---

# Event Classification Structure

Events in ScrambleIQ are grouped into the following categories:

1. Standing Engagement Events
2. Guard Initiation Events
3. Positional Control Events
4. Transition Events
5. Scramble Events
6. Submission Attempt Events

This classification structure allows the system to organize events in a meaningful way for match analysis.

---

# 1. Standing Engagement Events

### Event: Takedown Attempt

Description:

A takedown attempt occurs when an athlete attempts to bring the opponent from a standing position to the ground.

Possible motion indicators:

- rapid level change
- forward body penetration
- grip engagement followed by downward motion
- opponent balance disruption

Output attributes:

- start timestamp
- end timestamp
- initiating athlete
- confidence score

---

### Event: Takedown Completion

Description:

A takedown completion occurs when a standing athlete successfully brings the opponent to the ground and establishes control.

Possible motion indicators:

- opponent vertical displacement toward the ground
- both athletes transitioning from standing to grounded positions
- control stabilization after descent

Output attributes:

- completion timestamp
- initiating athlete
- confidence score

---

# 2. Guard Initiation Events

### Event: Guard Pull

Description:

A guard pull occurs when an athlete intentionally moves from standing to a grounded guard position.

Possible motion indicators:

- athlete lowering body position voluntarily
- leg engagement around opponent torso or hips
- controlled descent initiated by the pulling athlete

Output attributes:

- timestamp
- initiating athlete
- confidence score

---

### Event: Guard Establishment

Description:

Guard establishment occurs when the bottom athlete successfully positions their legs between themselves and the opponent to control distance.

Possible motion indicators:

- bottom athlete hip positioning facing opponent
- leg placement between athletes
- stabilized bottom control posture

Output attributes:

- timestamp
- bottom athlete
- confidence score

---

# 3. Positional Control Events

### Event: Top Control

Description:

Top control occurs when one athlete establishes dominant positioning above the opponent.

Possible motion indicators:

- athlete torso positioned above opponent torso
- opponent flattened toward the ground
- stabilized control posture

Output attributes:

- start timestamp
- controlling athlete
- confidence score

---

### Event: Mount Position

Description:

Mount position occurs when an athlete is positioned above the opponent with legs placed on either side of the opponent’s torso.

Possible motion indicators:

- athlete hips positioned over opponent torso
- leg placement on both sides of opponent body
- opponent torso facing upward

Output attributes:

- timestamp
- controlling athlete
- confidence score

---

### Event: Back Control

Description:

Back control occurs when an athlete positions themselves behind the opponent with control around the torso.

Possible motion indicators:

- athlete torso positioned behind opponent torso
- leg hooks around opponent hips
- chest-to-back alignment

Output attributes:

- timestamp
- controlling athlete
- confidence score

---

# 4. Transition Events

### Event: Guard Pass Attempt

Description:

A guard pass attempt occurs when the top athlete attempts to move past the bottom athlete’s legs to establish dominant control.

Possible motion indicators:

- top athlete lateral movement around opponent legs
- opponent leg disengagement attempts
- forward torso pressure

Output attributes:

- start timestamp
- end timestamp
- initiating athlete
- confidence score

---

### Event: Guard Pass Completion

Description:

A guard pass completion occurs when the top athlete successfully moves beyond the opponent’s legs and establishes dominant positioning.

Possible motion indicators:

- opponent legs no longer positioned between athletes
- top athlete torso positioned past guard line
- stabilization of new control position

Output attributes:

- timestamp
- initiating athlete
- confidence score

---

### Event: Sweep

Description:

A sweep occurs when the bottom athlete reverses position and becomes the top athlete.

Possible motion indicators:

- bottom athlete initiating rotation or off-balancing movement
- positional inversion between athletes
- stabilization of new top position

Output attributes:

- timestamp
- initiating athlete
- confidence score

---

### Event: Reversal

Description:

A reversal occurs when the bottom athlete transitions to a dominant position through positional escape or scrambling.

Possible motion indicators:

- athlete positional inversion
- top athlete losing stabilization
- new control posture established

Output attributes:

- timestamp
- initiating athlete
- confidence score

---

# 5. Scramble Events

### Event: Scramble

Description:

A scramble occurs when both athletes are engaged in rapid positional transitions without stable control.

Possible motion indicators:

- rapid multi-directional joint movement
- unstable positional control
- repeated position changes within short time intervals

Output attributes:

- start timestamp
- end timestamp
- involved athletes
- confidence score

---

# 6. Submission Attempt Events

### Event: Submission Attempt

Description:

A submission attempt occurs when an athlete applies a joint lock or choke intended to force a submission.

Possible motion indicators:

- limb isolation patterns
- choke positioning around the neck
- opponent defensive movements

Output attributes:

- start timestamp
- end timestamp
- initiating athlete
- confidence score

---

# Event Data Structure

Each detected event should produce structured output containing the following attributes.

Example event output:
```
{
event_type: "guard_pass_attempt",
start_time: 124.2,
end_time: 128.7,
initiating_athlete: "athlete_1",
confidence: 0.78
}
```


---

# Event Detection Limitations

Event detection is based on movement pattern inference.

Limitations include:

- partial body occlusion
- overlapping athletes
- ambiguous positional transitions
- camera angle limitations

The system should treat event detection as probabilistic rather than definitive.

---

# Version 1 Event Coverage

Version 1 aims to support detection of the following event categories:

- takedown attempts
- takedown completion
- guard pulls
- guard establishment
- guard pass attempts
- guard pass completion
- sweeps
- reversals
- scrambles
- top control phases
- submission attempts

Additional event types may be introduced in later versions of the system.

---

# Summary

The ScrambleIQ event taxonomy defines the grappling events recognized by the system during match analysis.

These events provide structured data that supports AI-generated coaching insights and allows users to navigate matches based on meaningful transitions rather than raw video alone.
