# Contributing

Biljarditutka is intentionally small while the first real table installation is being proven.

## Before adding infrastructure

Prefer evidence from the Pukuroom prototype over speculative abstraction. New crates, services, databases and network protocols should solve a demonstrated problem.

## Local checks

```bash
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all
```

## Pull requests

Keep changes focused and explain how they move the real-table prototype forward. Camera / vision changes are especially useful when accompanied by representative test frames or notes about the hardware and lighting conditions used.

## Privacy

Do not commit identifiable bar footage casually. Prefer cropped / synthetic / consented test material, and document any fixture that contains real people.
