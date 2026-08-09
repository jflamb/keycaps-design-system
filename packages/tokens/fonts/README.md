# Font assets

Keycaps packages Latin WOFF2 assets for Piazzolla, Sofia Sans and Lilex so consuming applications do not make third-party runtime font requests.

- Piazzolla: SIL Open Font License 1.1; see `LICENSE-PIAZZOLLA.txt`. Variable `opsz` 8–30 and `wght` 100–900.
- Sofia Sans: SIL Open Font License 1.1; see `LICENSE-SOFIA-SANS.txt`. Variable `wght` 1–1000, upright and italic.
- Lilex: SIL Open Font License 1.1; see `LICENSE-LILEX.txt`. Variable `wght` 100–900.

All three were sourced from the Fontsource v5 `latin` subset.

Four files carry the whole system, and all three faces are continuously variable. That is what lets each role take the weight it needs rather than the nearest hundred, and what makes the dark-mode weight compensation possible at all — see the Optical Weight Rule in `DESIGN.md`.

Piazzolla's `opsz` axis is deliberately left to `font-optical-sizing: auto`; see the Optical Sizing Rule.

Lilex replaced a system monospace stack. The stack cost nothing but was never one face — SF Mono on macOS, Consolas on Windows, Liberation Mono on Linux — so the pairing with the body face was left to whichever platform the reader happened to be on. See the Inline Code Rule.

Keep the license files with redistributed font binaries.
