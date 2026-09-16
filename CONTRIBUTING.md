# Contributing

Biljarditutka is intentionally small while a first real-table prototype is being developed. Puksu Room is a proposed pilot venue, pending approval; do not describe it as an approved customer or deployed installation.

## Before adding infrastructure

Prefer evidence from approved real-table experiments over speculative abstraction. New crates, services, databases and network protocols should solve a demonstrated problem.

## Local checks

```bash
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all
```

## Pull requests

Keep changes focused and explain how they move the real-table prototype forward. Camera / vision changes are especially useful when accompanied by publication-cleared test frames or non-sensitive notes about the hardware and lighting conditions used.

## Privacy and venue research

Do not commit identifiable bar footage casually. Prefer synthetic or genuinely non-identifying test material. Cropping and consent claims need review; neither automatically resolves every privacy or image-rights question.

The [Puksu Room research directory](docs/clients/puksuroom/README.md) is for sourced public venue facts and approved public material only. Private correspondence, appointments, negotiations, personal dossiers, credentials and operational security details do not belong in the repository. Do not copy third-party photos or logos without verified reuse rights, and do not assume the project MIT license covers them.
