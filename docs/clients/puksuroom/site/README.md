# Puksu Room × Biljarditutka — website concept

A working, responsive **restaurant-website redesign**, with Biljarditutka as the opening attraction rather than a technical proposal appended to a venue profile.

**Independent concept; venue approval pending.** This is not the restaurant's official website, a confirmed partnership, an installed system or a launch announcement. It contains public venue material only. The existing Puksu Room website has not been changed.

## Open it

- [Self-contained HTML source](index.html). Save/open this single file in a modern browser; CSS, physics and JavaScript are embedded. No application install, npm build, API key or server is needed for the demo.
- [Browser preview through raw.githack](https://raw.githack.com/timosaarinen/biljarditutka/main/docs/clients/puksuroom/site/index.html#demo). This is a third-party rendering service, not project-owned hosting. It may show a confirmation page before opening HTML and may cache changes. The committed HTML and local browser tests were verified; third-party cache freshness is not guaranteed. The physical-replay version includes the **¼× Hidastus / Slow motion** button and ball-speed readouts.
- Append `?lang=en` before the fragment on a hosted URL to start in English, or use the FI / EN switch.

For a local HTTP preview, the directory also works unchanged with any static file server. For example, from this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. This is an optional development method, not a runtime dependency.

## What's implemented

- Finnish-first copy and a working English switch, including navigation, controls, image text and accessibility labels.
- Biljarditutka-led hero: **Biljardi. Uudella tasolla.** / **Pool. A whole new level.**
- Physics-based pool replay: fixed 240 Hz stepping, swept collisions, momentum transfer, sliding/rolling friction, horizontal spin, cushion noses/jaws and six pocket mouths.
- Play, pause, restart, deterministic timeline scrubbing, quarter-speed playback, actual simulated speeds in m/s and an illustrative tracking overlay of travelled paths.
- Restaurant introduction, food/menu navigation, tournament and private-event links, public contacts, map link and sourced opening hours.
- Responsive mobile navigation, keyboard focus and Escape handling, reduced-motion behavior, image-error fallback and basic no-JavaScript content/navigation.
- No autoplay; animation stops when the demo leaves view or the document becomes hidden.
- No application analytics, cookies, camera/microphone access, forms, sign-up, checkout or backend.

The replay now **is a physical simulation**, rather than independent scripted ball tweens. The initial shot is authored; the contact times, trajectories, pot and resting positions are calculated. It is not actual camera footage, a tracking implementation or a calibrated model of the venue. The on-screen tracking overlay remains illustrative. Real ball tracking remains a separate Rust milestone. See [PHYSICS.md](PHYSICS.md) for equations, sources, constants and scope limits, including simplified cushion/pocket geometry and omitted sidespin/throw/jump mechanics.

## Source and publication boundaries

Public facts and third-party destinations were checked on **2026-09-16** against the [venue website](https://puksuroom.fi/), its linked menu/event services, [MyHelsinki](https://www.myhelsinki.fi/places/puksu-room/), [Venuu](https://venuu.fi/tilat/puksu-room) and [CueScore](https://cuescore.com/puksuroom). See the [public source register](../README.md) and [media inventory](../MEDIA.md).

The site links to the real menu instead of copying prices or inventing availability. Published closing-hour inconsistencies are disclosed. No upcoming tournament date, table booking, customer testimonial, product price or owner identity is invented.

One externally hosted Venuu photo is embedded as a visibly attributed reference; its bytes are not committed. The browser makes an ordinary request to that image host. `object-fit: contain` preserves the complete image and watermark. Offline/image-failure mode uses a typographic fallback. Reuse permission and current layout have not been confirmed. Before a venue-approved launch, obtain the relevant image/branding permissions or replace the photo with an approved asset. Third-party photos and venue branding are not covered by the project's MIT license.

`noindex,nofollow,noarchive` is included to discourage indexing. It is not access control: this repository and the concept file are public. No private briefing, personal contact dossier, appointment details or commercial negotiations are present.

## Physics checks

```sh
node --test physics.test.cjs
```

Node 22's built-in test runner checks the exact inline kernel in `index.html`; no npm dependencies or duplicate physics implementation are involved. The **34 regression tests** cover impact speeds, momentum/energy, head-on and cut shots, cloth friction and spin, no tunnelling, cushions/jaws, all six pockets, frame-rate-independent replay, non-anticipating contact interpolation and timestep convergence. Weaker or misaimed shots are tested to ensure that pocketing is not programmed in advance. The Website physics GitHub Actions workflow runs these checks on relevant changes.

## Browser checks

`smoke_test.py` uses Playwright/Chromium and exercises the HTML directly with `set_content`. It intentionally blocks the remote photo so it can verify the fallback without network dependencies. It does not test the external menu/booking services or claim Safari/device validation.

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
python3 smoke_test.py
```

An already installed Chromium may be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium`.

Checked: displayed speeds immediately before/after impact, quarter-speed playback, playback/pause, completed shot/rest, restart, seeking, tracking toggle, both languages and ARIA labels, mobile menu/Escape, hidden/out-of-view pause, reduced motion, no-JS fallback, internal anchor integrity, external-link safety and no JavaScript exceptions. Both languages were checked for horizontal overflow at **360, 390, 768, 1024 and 1440 pixels**. Desktop/mobile screenshots and a 12-frame shot sequence were visually reviewed. No Rust application code or README logo was changed by this website work.
