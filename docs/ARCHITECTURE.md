# Architecture

Biljarditutka should earn its architecture from the real table. The initial design therefore defines a pipeline and data boundaries without prematurely splitting every stage into a service or crate.

## North-star pipeline

```text
USB camera
   │
   ▼
Capture ──► Calibration ──► Vision ──► Tracking ──► Events ──► Game rules
                                                     │            │
                                                     ├──► Replay   └──► Scoreboard
                                                     └──► Stats
```

### 1. Capture

Owns camera discovery, format selection and timestamped frames. The first Linux target is Omarchy / Arch Linux and a commodity USB webcam.

### 2. Calibration

Maps camera pixels into a stable top-down table coordinate system. Perspective correction belongs here, not in game rules.

The core representation uses normalized table coordinates:

- `(0, 0)` = one table corner
- `(1, 1)` = opposite table corner
- pixel resolution and camera placement are implementation details outside the domain model

### 3. Vision

Turns a calibrated image into observations: candidate balls, cue ball, rails, pockets and later cues / hands when useful. This stage may change substantially while prototypes are tested.

### 4. Tracking

Maintains stable identities and trajectories across frames. Tracking should tolerate short occlusions and should attach confidence to observations rather than pretending uncertain detections are facts.

### 5. Events

Derives meaningful transitions such as:

- balls started moving
- shot settled
- ball entered a pocket
- cue ball scratched

Events are the preferred boundary for replays, statistics and game rules.

### 6. Rules and clients

Rules engines, scoreboard UI, tournament support and bar-specific features should consume tracked state / events rather than depend directly on camera pixels.

## Process model

Start as one local process. Split components only when there is a concrete reason such as a separate display machine, sandboxing a heavy vision backend, or reusing a stable component independently.

A local network API is likely useful later for scoreboards and displays, but is deliberately not part of the initial scaffold.

## Crate layout

`biljarditutka-core` currently contains only backend-independent domain values. Camera, CV and UI crates should be added when an implementation exists to justify the boundary.

Avoid a speculative forest of crates.

## Data retention and privacy

The intended installation is in a bar / restaurant. Design for event-driven replay buffers rather than indefinite room recording. Raw video retention, if enabled at all, should be explicit and documented for the installation.

## MVP definition

The first technical milestone is complete when a real Pukuroom camera feed can be calibrated and the system can continuously output stable 2D positions for visible pool balls with enough confidence to inspect failures.

Automatic scoring is intentionally outside that milestone.
