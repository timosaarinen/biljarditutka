# Physics-based website replay

The website previously used independent easing curves for the cue ball and the eight. The cue approached a predetermined endpoint at almost zero speed; the eight then started a separate tween with a much higher speed. That was an animation, not a collision.

The replacement is a deterministic, planar rigid-sphere simulation. The initial layout and shot are authored; the contact times, outgoing velocities, paths, cushion rebound, pocket event and resting positions are computed. All seven displayed balls are dynamic bodies. A weaker shot or different aim can fail to pot the eight.

## Model and units

Distances are metres, times seconds, masses kilograms and linear/rim speeds metres per second. The example uses a **2.0 × 1.0 m** playing surface, **57.15 mm** ball diameter and **0.17 kg** equal masses. These are illustrative inputs, **not measurements of Puksu Room's equipment**.

Default coefficients are ball-ball restitution **0.96**, cushion restitution **0.78**, sliding friction **0.2** and rolling resistance **0.012**, with gravity **9.81 m/s²**. They are plausible example values, not fitted venue data. Their reference ranges come from [Dr. Dave's physical-property summary](https://drdavepoolinfo.com/faq/physics/physical-properties/), checked 2026-09-16.

Ball-ball contact uses the normal impulse

```text
n = (position_b - position_a) / distance
relative_normal_speed = (velocity_b - velocity_a) · n
J = -(1 + restitution) * relative_normal_speed / (1/mass_a + 1/mass_b)
velocity_a -= J * n / mass_a
velocity_b += J * n / mass_b
```

An impulse is applied only when the balls approach. It conserves linear momentum; restitution below one removes kinetic energy. Tangential velocities and spin are unchanged by this frictionless central contact. In an equal-mass, head-on elastic test, the incoming ball stops and the other takes its velocity. A cut transfers only the normal component.

The cloth model retains horizontal angular velocity through `s = R*(omega_y, -omega_x)`. Contact-point slip is `u = v - s`. Sliding friction opposes **slip**, not necessarily centre-of-mass velocity, and changes `s` through the solid-sphere inertia `I = 2/5*m*R²`. This supports follow/draw instead of artificially freezing the cue after impact. The sliding-to-rolling transition is solved without overshooting; rolling resistance then slows the ball to rest. See [Evan Kiefl's pooltool physics derivation](https://ekiefl.github.io/2020/04/24/pooltool-theory/), especially ball-cloth and ball-ball interactions.

The default shot starts immediately after an idealized stroke, with a naturally rolling cue ball and no vertical-axis sidespin. Its initial speed is **1.05 m/s**. The visible cue stick is presentation, not a simulated flexible cue or tip contact.

## Integration and replay

A **240 Hz fixed physics timestep** uses cloth half-kicks around a continuous swept-contact drift. Ball-ball, cushion-segment and cushion-endpoint time-of-impact tests resolve contacts inside each tick, rather than waiting until balls visibly overlap. This is a numerical split approximation to simultaneous cloth forces and collision dynamics; the timestep-halving regression checks convergence.

Six actual mouth gaps interrupt the cushion segments. A ball is pocketed only when its centre crosses a geometric throat region. There is no pocket magnet, preset target path or scheduled pot. The renderer uses the same cushion/pocket coordinates. The below-throat fall is a clipped visual effect with gravity-based depth, not a full simulation inside a pocket.

The shot is simulated once and stored with a key at **every collision and capture**, as well as fixed-step boundaries. Rendering linearly samples only between adjacent physical events; it never eases a ball toward a collision or interpolates through a contact. The simulation ends at rest, followed by a short still hold. Scrubbing, pause, refresh rate and quarter-speed playback cannot change the physical outcome. Trail overlays show already-travelled paths, not prescribed future paths. Number patches move with the ball's integrated angular velocity; their small-screen glyph projection is illustrative.

The kernel remains inline under `<script id="pool-physics">` so the HTML still works as one offline file. `physics.test.cjs` extracts and tests that exact shipped kernel with Node's built-in test runner—there is no second implementation and no npm dependency.

## Regression checks

```sh
node --test physics.test.cjs
python3 smoke_test.py
```

The Node suite covers head-on/cut/moving-ball collisions, momentum and energy, separating contacts, preserved spin, rolling distance and stop, sliding-to-rolling conversion, follow/draw, fast-ball tunnelling, cushions/jaws, all six mouths, no pocket attraction, deterministic replay/scrubbing, contact-time interpolation, weaker/misaimed shots, final rest and timestep convergence. `.github/workflows/site-physics.yml` runs it on relevant pushes and pull requests.

Browser checks cover actual displayed impact speeds, quarter-speed playback, seek/restart, end state, languages, visibility pause, reduced motion, no-JavaScript fallback and responsive widths. Chromium screenshots of the shot sequence were reviewed. This does not claim testing on physical phones or Safari.

## Scope limits

This is now a physics-based **demonstration**, not a calibrated billiards prediction engine. It omits ball-ball tangential friction/throw, vertical-axis sidespin, cushion spin transfer/deformation, cloth anisotropy, jumps, masse, detailed pocket shelf/rattle dynamics and cue-tip mechanics. Cushion noses and jaws are simplified. Advanced collision research or a production engine can replace these components later; do not use this demo to adjudicate matches or infer tracking accuracy.
