# Biljarditutka

<p align="center">
  <img src="docs/biljarditutka-logo.svg" alt="Biljarditutka logo" width="1000" />
</p>

**Open-source computer vision for smart pool tables.**

Biljarditutka aims to turn an ordinary billiards / pool table into a smart table with an overhead camera and commodity hardware — without permanently modifying the table.

**Puksu Room** in Helsinki, Finland is a **proposed pilot venue, pending approval**. It is not yet an approved partner, customer or reference installation. The software and hardware documentation are intended to be reusable anywhere. See the [public venue research](docs/clients/puksuroom/README.md) for sourced facts and the distinction between research and an approved case study.

## First target

The first useful milestone is intentionally small:

> Camera → calibrated table view → stable 2D positions for the balls in real time.

No automatic scoring is required for the first milestone. Once table geometry and ball tracking are reliable, scoring, replays, statistics, tournaments and hardware automation can be built on top.

## Direction

Biljarditutka is planned as a local-first system:

- overhead USB camera
- a local Linux computer
- table/camera calibration
- ball detection and tracking
- event stream for shots, pockets and game state
- optional scoreboard / replay clients
- no cloud dependency required for normal operation

Longer-term ideas include automatic scoring, replay capture, nightly high scores, tournament support, funny bar statistics, lighting integrations, sensors, and eventually mechanical table automation.

## Technology

The project is Rust-first and developed primarily on **Omarchy / Arch Linux**.

The initial repository deliberately keeps dependencies minimal while the camera and computer-vision architecture is proven against real hardware.

## Repository layout

```text
biljarditutka/
├── crates/
│   └── core/              # table geometry and domain model
├── src/                   # local Biljarditutka process / CLI
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PUKUROOM_SETUP.md  # proposed setup notes; legacy filename
│   └── clients/
│       └── puksuroom/     # public research, media links and blank survey
└── .github/workflows/     # CI
```

The layout can grow later into separate vision, tracking, rules, replay and UI components when those boundaries are real rather than speculative.

## Development

Install a current stable Rust toolchain, then:

```bash
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all
cargo run -- status
```

On Omarchy, use your normal Rust toolchain setup (`rustup` is recommended). Camera-specific system packages will be documented once the first capture backend is selected.

## Principles

1. **Real table first.** Validate ideas against an approved real-table pilot instead of optimizing for hypothetical installations; Puksu Room is the proposed first venue.
2. **Local first.** The table should keep working without an Internet connection.
3. **No permanent table modification for the MVP.** Camera and compute should be removable.
4. **Vision before rules.** Reliable observation is more valuable than a clever scoreboard that guesses.
5. **Record useful events, not surveillance.** Prefer short replay/event clips and explicit retention over storing endless raw room video. Settle the relevant permissions and privacy responsibilities before capture.
6. **Open hardware when hardware arrives.** Approved, non-sensitive mounts, measurements and mechanical experiments belong in the repository too.

## Status

Very early prototype / scaffold. The next milestone is live camera ingest and calibration against an approved real table. No venue deployment, live ball tracking or automatic scoring is claimed at this stage.

## License

MIT — see [LICENSE](LICENSE). Third-party venue names, branding and externally linked photographs are not relicensed by this project; see the [media inventory](docs/clients/puksuroom/MEDIA.md).
