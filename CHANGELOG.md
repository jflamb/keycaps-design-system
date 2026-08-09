# Changelog

All notable changes to the fixed-version Keycaps package train are documented here.

## Unreleased

### Changed

- **Monospace is now bundled: Lilex, replacing the system stack.** `--kc-font-mono` resolves to `"Lilex", ui-monospace, …`, adding one variable file (`wght` 100–900, ~40KB). The stack cost nothing but was never one face — SF Mono, Consolas and Liberation Mono have different x-heights, so inline code paired with the body face differently on every platform. Lilex sets a 0.516em x-height against Sofia Sans' 0.488em, where SF Mono set 0.547em and read a size larger than its surroundings.
- **The body face is now Sofia Sans, replacing Nunito Sans.** `--kc-font-body` resolves to `"Sofia Sans", ui-sans-serif, system-ui, -apple-system, sans-serif`, shipped as two variable files (upright and italic, `wght` 1–1000) in place of four static Nunito Sans files. Its x-height sits within 1.2% of Piazzolla's, and every weight and emphasis combination in the body voice is now real — including emphasis inside bold copy, which previously fell back to upright under `font-synthesis: none`.
- **Role weights are tuned optically rather than snapped to the ladder.** Display 580, Title 640, Label 580, Micro 760, Body an untuned 400. Both faces are continuously variable, so these are real weights rather than nearest matches. See the Optical Weight Rule in `DESIGN.md`.
- **The display face is now Piazzolla, replacing Fraunces.** `--kc-font-display` resolves to `"Piazzolla", Georgia, "Times New Roman", serif`, and `piazzolla-latin-opsz-normal.woff2` replaces the Fraunces binary. The display payload drops from 121KB to 51KB. Both faces remain SIL OFL 1.1, so the `MIT AND OFL-1.1` declaration is unchanged.
- Headings now carry vertical rhythm and the documented heading leading. `:where(h1…h6)` sets `margin-block` from the new `--kc-space-heading-above` / `--kc-space-heading-below` tokens and `line-height: var(--kc-line-height-heading)`. Previously a consuming app inherited symmetric UA margins and `line-height: normal`.

- **Field and Card spacing now groups.** A field's label, description, control and error stacked at a uniform step 2, and `.kc-card__body` stacked whole fields at step 2 as well — so a label sat exactly as far from its own description as it did from the next field, and proximity carried no information. Fields now step 1 / 3 / 2 internally; card bodies stack at step 5, matching the Layout section's rule that composition between components uses steps 5 and 6.

### Added

- **A prose layer — `@jflamb/keycaps-tokens/prose.css`.** Long-form content styling for the elements a CMS, a markdown pipeline, or an author emits, scoped to `.kc-prose`: headings and rhythm, the semantic inline set (`abbr`, `kbd`, `mark`, `samp`, `var`, `output`, `dfn`, `del`, `ins`, `q`, `time`, `sub`, `sup`, `small`), code blocks with a copy control, quotes and floated asides, every list kind, native `details` disclosures, tables with a scroll container, callouts in four tones, `progress` and `meter`, a table of contents, footnotes, back-to-top, external-link marking, print, and forced colors. Opt-in rather than part of the default import, because a product surface that renders no articles should not pay for it. Icons are CSS masks drawn inline — nothing is fetched at runtime.
- **`.kc-skip-link`** in `base.css`, beside `.kc-sr-only`. A skip link is a visually hidden element that stops hiding once focused, and every page with repeated navigation above its content needs one.
- Prose sizes are exposed as `--kc-prose-measure`, `--kc-prose-flow`, and `--kc-prose-h1` through `--kc-prose-h6` on `.kc-prose`. The token package still ships no heading sizes — the surface decides, and a prose stylesheet is a surface.
- **`--kc-font-size-code`** (0.8em), replacing five hard-coded `0.85em` literals. Inline code is sized relative to its parent rather than on the size ramp, because it appears inside body, label and table text alike. The reduction from 0.85em compensates for a structural width gap no face can close: monospace convention is a ~0.6em advance against Sofia Sans' ~0.41em average.
- **Role weight tokens** — `--kc-font-weight-body`, `-display`, `-title`, `-label`, `-micro` — plus `--kc-font-weight-medium` (500) on the generic ladder.
- **`--kc-font-weight-shift`**, a dark-mode optical compensation of `-20` applied to every role weight through `calc()`. Light glyphs on a dark ground irradiate and read heavier than the same weight on white. Set it to `0` to disable the behavior. This is only possible because both faces are variable.
- `--kc-line-height-label` (1.45) and `--kc-line-height-micro` (1), replacing six literals that restated committed roles.
- `--kc-space-heading-above` (1.6em) and `--kc-space-heading-below` (0.6em), expressed in `em` so heading rhythm scales with whatever size the surface chooses.
- A true italic for the body voice. With `font-synthesis: none`, `<em>` previously rendered upright and indistinguishable in any consuming app.

### Removed

- **`--kc-font-variation-display`.** Piazzolla's only non-weight axis is optical size, which runs on `font-optical-sizing: auto` and must not be pinned, so the token had no value left to carry. It also leaked the previous face's axes onto elements that had no such axes. Consumers referencing it should delete the reference; no replacement is needed.

## 0.1.0 - 2026-08-08

- Added framework-neutral tokens, local fonts, semantic light/dark themes, reduced-motion support, and forced-color support.
- Added Button, Field, Select, Popover, Banner, Badge, and Card React components.
- Added Storybook guidance, unit/accessibility tests, browser verification, and package-consumption proof.
