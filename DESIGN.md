---
name: Keycaps
description: A quiet plate holding solid objects — warm neutrals, a coral key reserved for commitment, and press physics you can feel.
colors:
  cloud: "#f5f5f3"
  plate: "#fdfdfb"
  fog: "#c3c9d2"
  slate: "#5c6570"
  graphite: "#3a3f47"
  surface-hover: "#f7f7f4"
  divider: "#e7e7e3"
  coral: "#e25a3f"
  coral-key: "#c7452c"
  coral-deep: "#b23a24"
  coral-edge: "#8f2d1a"
  coral-bright: "#f0765c"
  mint: "#4fbfa3"
  mint-deep: "#1b6f5a"
  mint-tint: "#ddf2ec"
  mint-bright: "#63d4b8"
  mustard: "#efb93f"
  mustard-ink: "#7d5a12"
  mustard-tint: "#f9e9c0"
  mustard-bright: "#f5c95e"
  signal-deep: "#22688f"
  signal-bright: "#7ccbf2"
  danger: "#c7302b"
  danger-bright: "#f08a80"
  success-surface: "#eef9f5"
  success-border: "#bbe4d2"
  danger-surface: "#fbf1f0"
  danger-border: "#efb3ac"
  info-surface: "#eaf6fc"
  info-border: "#addcf3"
typography:
  display:
    fontFamily: "Piazzolla, Georgia, Times New Roman, serif"
    fontWeight: 580
    lineHeight: 1.2
  title:
    fontFamily: "Piazzolla, Georgia, Times New Roman, serif"
    fontSize: "1.25rem"
    fontWeight: 640
    lineHeight: 1.2
  body:
    fontFamily: "Sofia Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Sofia Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 580
    lineHeight: 1.45
  micro:
    fontFamily: "Sofia Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 760
    lineHeight: 1
rounded:
  sm: "6px"
  key: "10px"
  plate: "18px"
  pill: "999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.coral-key}"
    textColor: "{colors.plate}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    padding: "calc(0.5rem + 2px) 1.25rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.coral-deep}"
  button-secondary:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    padding: "calc(0.5rem + 2px) 1.25rem"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
  button-quiet:
    textColor: "{colors.signal-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
  button-small:
    typography: "{typography.micro}"
    padding: "0.5rem 0.75rem"
    height: "36px"
  field-input:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.key}"
    padding: "0 1rem"
    height: "50px"
    width: "min(100%, 32rem)"
  card:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.plate}"
    padding: "1.5rem"
    width: "min(100%, 42rem)"
  banner-info:
    backgroundColor: "{colors.info-surface}"
    textColor: "{colors.signal-deep}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
    width: "min(100%, 48rem)"
  badge:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.graphite}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
    padding: "0.25rem calc(0.5rem + 2px)"
    height: "1.5rem"
  popover:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.key}"
    padding: "1rem"
    width: "min(24rem, calc(100vw - 2rem))"
---

# Design System: Keycaps

## Overview

**Creative North Star: "The Quiet Plate"**

Keycaps is a plate, and a small number of solid objects seated on it. The plate is the protagonist: a warm near-white ground (`cloud` #f5f5f3) that asks for nothing, holds everything, and stays quiet under whatever is placed on it. Objects that sit on the plate are unmistakably *objects* — they have a border, a radius, a bottom edge, and a shadow that says they occupy space rather than float above it. Nothing dissolves into the page.

The system is tactile but restrained. It contains real physical feedback, and it spends it almost nowhere. A primary key travels 3px on press while its 4px bottom edge compresses to 1px — the cap descends and the wall it stands on absorbs the travel, which is the motion of a key hitting the plate beneath it. That press is the single most expressive thing the system does, it lasts 120ms, and it is the reason the rest of the interface holds still. If everything moved, the press would mean nothing.

Warmth comes from material, not from saturation. The neutrals are warm-shifted rather than gray (`plate` #fdfdfb, `divider` #e7e7e3), the display face is Piazzolla drawing itself for the size it is set at, and the accent is coral rather than blue. Coral appears at full strength on exactly one kind of thing — an action that commits — which is why the plate reads as calm. The scarcity is semantic, not budgeted: commitments are rare, so the color that marks them is rare.

**Key Characteristics:**
- Warm near-white ground; nothing is pure gray and nothing is pure white
- Objects are seated, not floating — border, radius, and edge are the default vocabulary
- One expressive gesture (the 120ms key press) surrounded by stillness
- Coral marks commitment; every other status speaks in mint, mustard, or signal blue
- Depth is cast in light and tonal in dark — the same object, two different physics
- Every state has a non-color carrier, because forced-colors and screen readers are release gates

## Colors

A warm-neutral plate carrying four semantic hues: coral for commitment, mint for affirmation, mustard for caution, and signal blue for information and links.

### Primary

- **Coral Key** (`coral-key` #c7452c): the face of a primary key in light mode. This is the committing action's color and it appears nowhere else at full strength.
- **Coral Edge** (`coral-edge` #8f2d1a): the key's side wall — the darker band beneath the face that makes the cap read as a physical object with height. Also the pressed-state fill when motion is suppressed.
- **Coral Deep** (`coral-deep` #b23a24): the hover face. Darker than rest, so hovering reads as the finger already bearing down.
- **Coral** (`coral` #e25a3f): the focus ring in light mode, and the key edge in dark mode. The brightest legible coral that still holds against a near-white plate.
- **Coral Bright** (`coral-bright` #f0765c): the dark-mode key face and focus ring. Lifted in lightness to survive a #15181d ground.

### Secondary

- **Mint** (`mint` #4fbfa3): the accent border, and the marker on a selected option. The system's "yes."
- **Mint Deep** (`mint-deep` #1b6f5a): accent and success text on light surfaces.
- **Mint Tint** (`mint-tint` #ddf2ec): the accent surface — the wash behind a focused or hovered list option.
- **Mint Bright** (`mint-bright` #63d4b8): accent and success text in dark mode.

### Tertiary

- **Mustard** (`mustard` #efb93f): warning borders. Warm enough to belong to the plate rather than interrupt it.
- **Mustard Ink** (`mustard-ink` #7d5a12): warning text on light surfaces — a deep olive-brown, not a yellow, because yellow text is unreadable at body sizes.
- **Signal Deep** (`signal-deep` #22688f): links and informational text. The only blue in the system, and it is reserved for "this is information or a destination," never for "this is the primary action."
- **Signal Bright** (`signal-bright` #7ccbf2): links and informational text in dark mode.
- **Danger** (`danger` #c7302b): error text, invalid-field borders, and the wall and ink of the destructive key. Deliberately close to coral in hue and clearly darker in tone — errors belong to the same warm family, so the interface never turns alien when something goes wrong. That closeness is affordable precisely because danger is never a *face*: it draws lines and letters, never fills a key. A filled danger key beside a filled coral one would differ in one color channel, which is why the destructive key is outlined instead — see Buttons.

### Neutral

- **Cloud** (`cloud` #f5f5f3): the plate itself. Page background in light mode.
- **Plate** (`plate` #fdfdfb): raised surfaces — cards, inputs, popovers, secondary keys. Warmer and lighter than the ground, which is what makes a raised object read as raised before its shadow does any work.
- **Surface Hover** (`surface-hover` #f7f7f4): the one-step warm-up under a hovered secondary or quiet key.
- **Fog** (`fog` #c3c9d2): borders on interactive objects. Cool enough to recede, dark enough to define an edge.
- **Divider** (`divider` #e7e7e3): card borders and internal rules. Lighter than `fog` because a divider separates, it does not enclose.
- **Slate** (`slate` #5c6570): muted text — descriptions, placeholders, secondary copy.
- **Graphite** (`graphite` #3a3f47): body text. A warm near-black, never #000.

### Dark theme

Dark mode is not an inversion. The plate becomes #15181d, raised surfaces #1e2228, and hover #262b33 — a three-step tonal ladder that does the job the cast shadow does in light. Text lands at #edeff2 with #a8b0bb muted, borders at #4a515c, dividers at #2a2f36. Every semantic hue swaps to its `-bright` variant for text and its deep variant for borders, so contrast direction reverses without the hue identity changing.

### Named Rules

**The Commitment Rule.** The coral key face is worn only by actions that commit or confirm. Multiple commitments on one screen may all wear it — coral marks a *kind* of action, not a rank. The plate stays quiet because genuine commitments are rare, not because a budget caps them.

**The Tone Trio Rule.** Every status tone sets surface, border, and text together. A tone expressed by only one of the three is incomplete, and a status expressed by color alone is a defect — there is always a label, an icon, or a role carrying the same meaning.

**The Warm Neutral Rule.** No pure grays, no #000, no #fff. Every neutral in the system carries a warm or cool bias; a value with equal RGB channels has escaped the palette.

## Typography

**Display Font:** Piazzolla (with Georgia, Times New Roman, serif)
**Body Font:** Sofia Sans (with ui-sans-serif, system-ui, -apple-system, sans-serif)
**Mono Font:** Lilex (with ui-monospace, Cascadia Mono, SF Mono, Menlo, Consolas)

**Character:** A warm, slightly eccentric serif over a neutral grotesque. Piazzolla carries an optical size axis from 8 to 30, left to run automatically, so the face redraws itself between a card title and a page heading rather than being scaled up and down. That is what keeps it warm and a little idiosyncratic at display sizes without becoming fussy at 1.25rem. Sofia Sans is the quiet half by design — it carries every label, value, button and error, and its job is to recede so the serif is the voice. All three are local WOFF2; nothing is fetched at runtime.

The pairing was chosen on measurement as well as voice: at a common size the two x-heights sit within 1.2 percent of each other (0.482em against 0.488em), which is why they hold together where they actually meet — a card title above its description.

All three faces are continuously variable — Piazzolla 100–900, Sofia Sans 1–1000, Lilex 100–900 — and the system uses that rather than snapping to hundreds. See the Optical Weight Rule.

### Hierarchy

- **Display** (580, size set by context, 1.2): `h1` and `h2`. Piazzolla with optical sizing left automatic. Sizes are not tokenized — the surface decides, the face does not.
- **Title** (640, 1.25rem, 1.2): card titles. The only place Piazzolla appears inside a component rather than in page-level headings.
- **Body** (400, 1rem, 1.55): default running text and input values. The generous 1.55 leading is what makes dense forms breathable.
- **Label** (580, 0.875rem, 1.45): field labels, button text, descriptions. Just under semibold, because a label should be findable, not loud. Button text takes the role's weight and size but a tighter 1.2 leading — at 1.45 the content box exceeds `--kc-control-min-size` and the button sizes to its content instead of to the 44px floor, which the press depends on.
- **Micro** (760, 0.75rem, 1): badges and small keys. Heavier than bold and tight-leaded — at this size, with no ascenders or descenders in all-caps, weight is the only hierarchy signal that survives.

### Named Rules

**The Two Voice Rule.** Piazzolla speaks in page headings and card titles. Sofia Sans does everything else — every label, every value, every button, every error. Piazzolla creeping into body copy breaks the system. Lilex is the third voice and it is not an exception to this rule — it speaks only in code, where the distinction it draws is semantic rather than decorative.

**The No Faux Type Rule.** `font-synthesis: none` is on, so the browser never fakes a weight or a slant. That makes shipped coverage the real contract. Sofia Sans is variable across its whole range in both upright and italic, so every weight and every emphasis combination in the body voice is real — including emphasis inside bold copy, which under the previous static body face fell back to upright. Piazzolla ships upright only, so italic inside a heading still renders upright rather than being synthesized; a faked slant on the display face reads worse than no slant at all. Reach for something the system does not ship and it fails silently, which is the intended cost.

**The Inline Code Rule.** Code is set in Lilex at `--kc-font-size-code` (0.8em), relative to its parent rather than on the size ramp, because it appears inside body, label and table text alike.

The size is doing work a face cannot. Monospace convention is a ~0.6em advance; Sofia Sans averages ~0.41em. Code therefore always sets wider than the prose around it, and no monospace face closes that gap — every candidate measured on this system landed at 0.6em, including the one that shipped before. What a face *can* fix is apparent size: the previous system stack set a 0.547em x-height against Sofia Sans' 0.488em, so code read a size larger than its surroundings. Lilex sets 0.516em.

Bundling it also ends a quieter problem. A system stack is not one face — it was SF Mono on macOS, Consolas on Windows, Liberation Mono on Linux, three different x-heights, and the pairing had only ever been judged against one of them.

**The Optical Weight Rule.** Roles carry the weight they need, not the nearest hundred. Apparent stroke weight falls as size falls, so a single number spanning a 40px heading and a 12px badge does not read as one system. Display sits at 580 and Title at 640 — the same intent at twice the size apart, bracketing 600 rather than sharing it. Label sits at 580, findable without being loud. Micro carries 760 because 12px uppercase has no ascenders or descenders left to help it. Body is deliberately untuned at 400: running text belongs at the face's own text weight.

The generic ladder — regular 400, medium 500, semibold 600, bold 700 — remains for consumers reaching for a step. Both faces are variable, so every rung is a real weight in both voices rather than a nearest match.

**Dark mode shaves weight, and only a variable face can.** Light glyphs on a dark ground irradiate: the bright stroke bleeds into its surround and reads heavier than the same weight on white. Every role weight is therefore `calc(base + var(--kc-font-weight-shift))`, where the shift is `0` in light and `-20` in dark. It is one value, and setting it to `0` disables the behavior entirely. The direction is a judgment about these two faces — both are low-contrast enough that irradiation, rather than thin strokes breaking up, is the dominant effect. A high-contrast face would want the opposite sign.

**The Optical Sizing Rule.** Piazzolla's `opsz` axis is never pinned. It runs on `font-optical-sizing: auto` — the browser default — so the face draws itself for the size it is actually set at, and there is no `font-variation-settings` anywhere in the system.

This replaces the Optical Constant Rule, which pinned the previous display face's axes to fixed values. The reasoning inverted with the face. Fraunces was pinned because its `SOFT` and `WONK` axes were brand choices that had to stay put; Piazzolla's only non-weight axis is optical size, which exists precisely to vary. Its range of 8–30 spans the whole system, from a 1.25rem card title to a 2.5rem page heading, and pinning it would trade away the small-size drawing that makes the Title role work. That capability is why this face was chosen over candidates with more character and no optical axis.

A practical consequence: `--kc-font-variation-display` no longer exists. It was a token whose value could only have been `normal`, and while it existed it leaked the old face's axes onto elements that had no such axes.

**The Heading Rhythm Rule.** A heading gets more space above it than below — `--kc-space-heading-above` (1.6em) against `--kc-space-heading-below` (0.6em), a ratio near 2.67:1. The heading belongs to the section it opens, not the one it closes, and the gap above is what says so.

Both values are `em`, so they scale with whatever size the surface chose. This is the same reasoning that keeps heading sizes untokenized: the surface decides the size, and the space has to follow it rather than a fixed step. It also means the rule survives a display heading at 2.5rem and an `h4` at body size without either looking wrong.

Spatial contrast is doing real work here, not decoration. The size ramp steps by a constant 0.125rem, so its largest ratio is 1.167:1 — below the ~1.2 threshold at which a size change reads as a role change on its own. Where a heading and its body text are close in size, the space around the heading is the hierarchy.

## Layout

Content is measured, not stretched. Every container carries an intrinsic maximum expressed as `min(100%, Xrem)` so components self-limit without a grid: fields and selects cap at 32rem, cards at 42rem, banners at 48rem, popovers at `min(24rem, calc(100vw - 2rem))`. The result is that dropping a component into any container produces a reasonable measure with no wrapper.

Spacing is an eight-step rem scale (0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 2.5rem). Internal component rhythm concentrates in steps 1–4; composition between components uses 5 and 6. Cards use step 6 padding with step 5 gaps, tightening to step 5 padding below 30rem.

The system is single-breakpoint. One `max-width: 30rem` query tightens card and banner padding; everything else adapts through intrinsic sizing, `min()`, and flex wrapping. Logical properties are used throughout (`inline-size`, `block-size`, `padding-inline`, `border-block-end`), so the system flips for RTL without a stylesheet.

### Named Rules

**The 320 Rule.** Every surface reflows at 320 CSS pixels with no horizontal page scroll. `html` and `body` carry `min-width: 320px` as the floor, and it is verified in the browser matrix — not a guideline, a release gate.

**The Intrinsic Maximum Rule.** Components declare their own measure ceiling with `min(100%, Xrem)`. Never constrain a Keycaps component from the outside when it already knows its comfortable width.

## Elevation & Depth

Depth is physical in light and tonal in dark, and this asymmetry is deliberate. In light mode a card casts `--kc-shadow-plate` — a two-layer shadow combining a 1px contact shadow at 6% with a 28px ambient at 10%, both tinted with the graphite ink rather than black. In dark mode that shadow becomes `none` entirely, and depth is carried by the #15181d → #1e2228 → #262b33 surface ladder instead. A shadow on a dark ground reads as grime; a lighter surface reads as closer.

Overlays are the exception. `--kc-shadow-overlay` survives in both themes — 0 14px 40px at 20% in light, deepening to 0 18px 44px at 45% pure black in dark — because a popover is genuinely detached from the plate rather than resting on it, and detachment must be legible in both physics.

Under forced-colors both shadows resolve to `none` and depth is carried entirely by system border colors.

### Shadow Vocabulary

- **Plate** (`box-shadow: 0 1px 2px rgb(58 63 71 / 0.06), 0 10px 28px rgb(58 63 71 / 0.1)`): a card or panel resting on the plate. Light mode only.
- **Overlay** (`box-shadow: 0 14px 40px rgb(58 63 71 / 0.2)`): popovers and select menus. Both themes, deeper in dark.

### Named Rules

**The Light Lifts, Dark Layers Rule.** Cast shadow belongs to light mode. In dark mode, depth comes from surface tone alone. Adding a plate shadow to a dark surface is a defect, not an enhancement.

**The Overlay Exception Rule.** Only genuinely detached surfaces — popovers, select menus, dialogs — cast in both themes. If it rests on the plate, it does not cast in dark.

## Shapes

Four radii, each with a job. `sm` (6px) belongs to the tone carriers — banners and badges, the two components that speak in info, success, warning, and danger. `key` (10px) is the keycap radius and the system's default: buttons, inputs, select triggers, popovers. `plate` (18px) is reserved for the largest containers, cards, which read as the plate itself rather than an object on it. `pill` (999px) is available but unused, and deliberately so — a pill reads as a floating token rather than a seated object.

The two families are calibrated to the same corner character rather than to the same number. A key is 10px on a 44px control, a ratio near 0.23; a badge is 6px on a 24px box, near 0.25. The badge is not a softer corner than the key — it is the same corner at a smaller size.

Nested radii are computed, not guessed: a select option inside a `key`-radius popover uses `calc(var(--kc-radius-key) - 3px)`, so inner and outer curves stay concentric. The `calc()` form is reserved for genuine nesting; a component that sits on the plate rather than inside another component takes a token directly.

The bottom edge is the system's signature. A primary key carries a 4px `border-block-end` in `coral-edge`; a secondary key carries the same 4px in the border color. This is the keycap's side wall, and it is what makes a button read as an object with height rather than a colored rectangle.

Interactive targets never fall below 44×44 CSS pixels (`--kc-control-min-size`), with a documented 36px exception for the explicit `small` button size.

### Named Rules

**The Pressable Edge Rule.** A bottom edge promises travel. Anything wearing a `border-block-end` heavier than its other borders must depress when activated. A static element with a weighted bottom edge is a false affordance.

**The Motion Contract.** The system's `prefers-reduced-motion` preference is authoritative. An app that offers its own in-product motion preference declares it on the root element — `data-kc-motion="reduce"` or `"full"` — exactly as it declares `data-theme`. Every value the substitution touches is a token (`--kc-press-travel`, `--kc-press-edge-width`, `--kc-chevron-open-turn`, `--kc-duration-press`, `--kc-duration-overlay`, `--kc-color-key-face-pressed`), so the tokens package owns the whole switch and component CSS carries no reduced-motion branch at all.

**The Leading Edge Rule.** A heavier `border-inline-start` marks a block that is *quoted from or attributed to* something outside the flow — a Banner's tone, a callout, a `blockquote`, a `samp` showing real program output. It is the one place the system uses a weighted side border, it is always on the inline-start edge so it flips for RTL, and it is never decoration.

It is deliberately not the keycap's bottom edge. The bottom edge promises travel and belongs to things that depress; a leading edge promises provenance and belongs to things that do not move. Two different weighted borders, two different meanings, and neither is available to the other.

This is a considered exception to the general advice against colored side borders. The blocks that carry it are the ones where the convention predates the system — a quotation rule is centuries old — and where the alternative is spending a second color to say the same thing.

**The Concentric Radius Rule.** A nested corner is the parent's radius minus the gap between them, computed with `calc()`. Never restate a nested radius as a literal.

## Components

### Buttons

**Character:** a keycap. Solid, seated, and satisfying exactly once per interaction.

- **Shape:** keycap radius (10px), 44px minimum height, 4px bottom edge.
- **Primary:** coral key face with a `coral-edge` side wall and `plate` text. Hover darkens the face to `coral-deep`.
- **Secondary:** raised `plate` surface with `fog` borders on all four sides, bottom included. Hover warms to `surface-hover`.
- **Quiet:** no surface, no borders, `signal-deep` text. Still travels on press.
- **Press:** `translateY(var(--kc-press-travel))` with the bottom edge compressing to `var(--kc-press-edge-width)` over `var(--kc-duration-press)` — 3px, 4px → 1px, 120ms. The two values are coupled: the cap descends exactly as far as its wall shrinks, so the wall reads as absorbing the travel. Changing one without the other breaks the physics.
- **The press is transform-only, and that is a constraint, not an accident.** `min-block-size` pins the border box, so compressing the wall redistributes space inside a box that never resizes. The whole key — bottom edge included — translates 3px; the wall shrinking by the same 3px is what makes it read as compression rather than as the object sliding. Animating the box height instead would hold the outer boundary still on paper, and in practice it relayouts every frame and re-centers the key inside any container that centers its items: measured as a 1.1px upward flick followed by a slide that lands 1.5px low. A wobble, not a press. If a future version wants a genuinely fixed lower boundary, it has to come from a compositor-only wall — a scaled pseudo-element — not from animating layout.
- **Reduced motion:** travel is removed and the edge stays at full 4px; a primary key instead fills with `--kc-color-key-face-pressed`, which resolves to `coral-edge`. The press is still legible, expressed in material instead of movement. The whole substitution lives in the tokens layer (see Motion), so no component implements it and none can forget it.
- **Focus:** 3px `coral` outline at 3px offset, outside the object so the edge stays readable.
- **Small size:** 36px height, micro type, tighter padding.
- **Danger:** the destructive key, and deliberately *not* a filled key in the danger hue. `danger` (#c7302b) and `coral-key` (#c7452c) differ only in their green channel, so two filled keys on one approvals row — "Approve" beside "Reject" — would be indistinguishable at a glance. The difference is carried by form instead: a raised `plate` surface with `danger-border` sides, a `danger` wall, and `danger` ink, against a filled coral face. Filled versus outlined survives forced colors, monochrome print, and every color vision deficiency; 21 points in one channel does not. It keeps the wall and it travels, so the Pressable Edge Rule's promise holds. Under reduced motion the pressed state fills with the wall color and takes raised-surface ink — the same substitution a primary key makes, not an exception to it.
- **The destructive key carries the danger shape, and the component supplies it.** Outlining solves the collision with coral and creates a nearer one: against a `secondary` key, a danger key differs only by a pink border and red ink, and under `forced-colors: active` both resolve to the same system colors, leaving no destructive signal at all. Shape is the only carrier that survives, so the danger variant renders the octagon by construction. This is the Tone Trio Rule read strictly — a second carrier a caller can forget to pass is not a second carrier. An icon-only danger key is exempt, because its glyph already *is* the shape and a second mark would crowd a key whose whole label is one.
- **Icon-only:** a square key at the 44px floor. The glyph is the whole label, so the accessible name has to be supplied, and the type requires it rather than suggesting it.
- **Link:** the one Button that is not a key. No surface, no wall, no control height, and no travel — the edge promises travel, this variant wears none, so it owes none. It is the system's second documented exception to the 44×44 minimum, after `small`: WCAG 2.5.8 exempts a target inside a block of text, because meeting it would mean opening the leading of the paragraph around it. The underline is not optional in exchange, because the link blue does not clear 3:1 against body ink.
- **A key that navigates** is a `LinkButton`, an anchor wearing the same key. Choose by what happens, not by how it should look: navigating is a link, doing is a button.

### Cards / Containers

**Character:** the plate itself, not an object on it.

- **Corner Style:** plate radius (18px), the largest in the system.
- **Background:** `plate` on a `cloud` page.
- **Shadow Strategy:** `--kc-shadow-plate` in light, none in dark (see Elevation).
- **Border:** 1px `divider` — lighter than the interactive `fog`, because a card encloses without demanding.
- **Internal Padding:** step 6 (1.5rem), tightening to step 5 below 30rem. Header, body and footer stack at step 5, and the body stacks its own children at step 5 too — what sits in a card body is whole components, and composition between components is what steps 5 and 6 are for. The footer separates with a `divider` rule and step 4 of top padding.
- **Title:** the one place Piazzolla appears inside a component.
- **Navigating:** a card can be a link two ways, and they are not interchangeable. As one anchor, the accessible name is everything inside it — right for a short row, wrong the moment the card carries a title, a description, and a metadata line. With the link around the title and an overlay covering the rest, the name stays the title. The overlay's cost is real: body copy inside a linked card cannot be selected. Either way the card warms one step on hover rather than lifting, because the plate shadow is `none` in dark and a hover expressed as elevation would exist in one theme only. It does not depress — a card is the plate, and the plate has no wall.

### Inputs / Fields

**Character:** a well in the plate, not a box on it.

- **Style:** 50px tall, `plate` fill, 1.5px `fog` border, keycap radius. The half-pixel border weight is deliberate — heavier than a divider, lighter than a key edge.
- **Hover:** border darkens to `slate`.
- **Focus:** the standard 3px coral ring at 3px offset.
- **Invalid:** border shifts to `danger-border`, with error text in `danger` at semibold. The error element collapses when empty rather than reserving space.
- **Structure:** three groups, not four evenly spaced rows, capped at 32rem. Label and description sit at step 1 — the description finishes the sentence the label starts, so they are one unit. The control takes step 3, because moving from reading to doing is a change of activity and deserves a real interval. The error returns at step 2, closer to the control than the control is to the text above it, so it reads as belonging to the input rather than floating between fields.

  Spacing carries the grouping here because nothing else can: every part is the same face at the same size, and only the error changes colour. Set uniformly, the parts of one field sat exactly as far apart as two different fields, and proximity conveyed nothing.

- **Multiline:** a composer, not a taller input. It takes the Body role's 1.55 leading rather than a control's and starts at a four-line floor instead of the 50px control height, because the reader is writing sentences rather than a value. Resizing is block-only — a composer draggable past the 32rem measure its field declares breaks the Intrinsic Maximum Rule from the inside.
- **Search:** the field plus the three things a field does not have — the `searchbox` role, Escape-to-clear, and a clear control. The magnifier and the clear key sit *over* the input rather than beside it in a wrapper, which is structural rather than visual: the border, fill, and focus ring stay on the input, so no second set of state rules is needed. The clear control is absent from the markup while the field is empty rather than hidden by CSS; an announced control with no effect is worse than no control.

### Select

**Character:** a field that opens into a plate of its own.

- **Trigger:** identical to a field input, plus a chevron that rotates 180° over 120ms (suppressed under reduced motion).
- **Popover:** matches trigger width via `--trigger-width`, minimum 12rem, step 1 padding, overlay shadow, entering with a 140ms fade and 4px rise. The 24rem measure that caps a standalone Popover does not apply here — a menu narrower than the field it belongs to reads as broken, so only the viewport (`calc(100vw - 2rem)`) bounds it.
- **Listbox:** scrolls past `min(22rem, calc(100vh - 4rem))`, which holds five options carrying descriptions before it starts to scroll.
- **Option:** step 3 padding at a concentric radius. Focused or hovered options take the mint accent wash; the selected option carries an `inset 3px 0 0` mint marker on its leading edge — a marker, not a fill, so selection and focus can coexist without fighting.

### Banner

**Character:** a strip of tone laid across the plate.

- **Style:** small radius (6px), 1px border with a 4px leading edge in the tone's border color, tone surface fill, capped at 48rem.
- **Tones:** info (default), success, warning, danger — each setting surface, border, and text together.
- **Dismiss:** a 44×44 target with a negative margin so the visual padding stays tight while the hit area stays legal.

### Badge

**Character:** a label, not a control.

- **Style:** 1.5rem tall, micro type, `plate` fill, `sm` radius (6px), and a uniform 1px border on all four sides.
- **No bottom edge.** A badge never receives input, so under the Pressable Edge Rule it must not wear the weighted edge that promises travel. Its height floor is set just above its natural 22px so the box stays close to what the padding declares rather than opening a gap the padding never asked for.
- **Tones:** info, success, warning, danger, following the Tone Trio Rule.
- **Icon:** the tone's own shape — a circled i, a circled check, a triangle, an octagon — drawn from the same paths `prose.css` masks for its callouts. This is the Tone Trio Rule's second carrier, and the shape is selected by tone rather than chosen by the caller, so a warning cannot wear a check. `neutral` has no shape and renders none.
- **Pill:** the `pill` radius, reached for only when the thing being labelled is genuinely in motion — a live connection state rather than a version number. "Floating token" is the right connotation for the first and the wrong one for the second, which is what makes the shape carry a distinction rather than a preference. The seated badge stays the default.

### Popover

**Character:** genuinely detached — the one thing in the system that floats.

- **Style:** keycap radius, `plate` fill, 1px `fog` border, overlay shadow in both themes, capped at `min(24rem, calc(100vw - 2rem))` so it never overruns a small viewport.
- **Motion:** 140ms ease-out fade with a 4px rise; removed entirely under reduced motion.

### Dialog

**Character:** a plate that has detached, and the drawer is the same plate pinned to an edge.

- **It is a native `<dialog>` opened with `showModal()`, and that is the design decision.** Inertness, the focus trap, Escape, and top-layer stacking are the platform's, and a component that re-implements them ships a subset. This is the opposite conclusion to `Disclosure`'s only in appearance: both take the platform element, and the difference is that a `<details>` needs no runtime while a `<dialog>` cannot open without one. That is why `renderStatic` throws on this and renders that.
- **Style:** plate radius (18px), `plate` fill, 1px `fog` border, overlay shadow in both themes under the Overlay Exception Rule, capped at `min(42rem, calc(100vw - 2rem))`. Both maxima are restated rather than left to the UA, which otherwise caps a `dialog` at `calc(100% - 6px - 2em)` in each axis — a measure the component did not choose.
- **The scrim is `--kc-color-scrim`**, graphite-tinted in light and black in dark at the same 0.68 alpha, and opaque `Canvas` under forced colors, where the overlay shadow is `none` and the scrim is the only separator left.
- **The head does not scroll.** The body is the scroll container and the head and footer are flex items that do not shrink, so the close control is reachable at every scroll offset without a sticky offset that has to be kept clear of the radius.
- **The drawer is a `placement` prop.** `inline-end` and `inline-start` pin the same dialog to one edge at full height, 35rem wide, square-cornered and border-free on the edge it is flush with. A sibling `Drawer` would be two components for one object.
- **The title is the Title role in the display face**, which follows from the same sentence as the radius: a plate's title is a card title.
- **Nested overlays portal into it.** A `Select` or `Popover` inside a modal would otherwise be portalled to `document.body`, outside the top layer and inside the inert half of the document — painted under the scrim and impossible to open. The system solves this between its own components rather than through a prop a caller can forget.
- **It locks the page behind it**, which the platform does not do, compensating exactly for the scrollbar it removes.

### App shell

**Character:** the frame, not a thing in it.

- **Structure:** a bar, a body, a footer, and a skip link before all of them. The shell contributes no interactive element of its own except a navigation link, so it composes with whatever router an app already has and needs almost nothing on the static path.
- **The skip link is rendered by construction**, inside its own navigation landmark. Page content outside every landmark is a real gap for anyone moving through a page by landmark, and the one control that exists to help them skip should not be the thing they cannot reach that way.
- **The sidebar split uses flex wrapping, not a second breakpoint.** The system is single-breakpoint, and a sidebar that reflows on its own content's terms is what the Intrinsic Maximum Rule asks for anyway. The sidebar separates itself by surface tone as well as by a rule, so it still reads as a distinct region once it has wrapped.
- **The current destination takes the Select option's treatment** — accent wash with a mint marker on the leading edge — not the coral key. A sidebar is a list of options, and navigating somewhere commits to nothing.
- **Measure:** the content region carries `min(100%, 72rem)`, centered. A page needs no layout wrapper.

### Page header

**Character:** what this is, what it is for, and what you can do to it.

- **The heading's own margins are zeroed and the header owns the rhythm.** That follows the Heading Rhythm Rule rather than breaking it: a heading opening its container has nothing above it to separate from, and the space that matters belongs to the header as a block rather than to the heading as a line.
- **Heading sizes live here**, and only here among the components — the surface decides how large a heading is, and a page header is a surface. They clamp with the viewport rather than stepping at a breakpoint.
- **Level and size are set independently.** The outline is a document decision; the size is a visual one. The eyebrow is a paragraph in the Micro role, never a heading, so it stays out of the outline.

### Empty state

**Character:** the shape content would fill.

- **A recess, not a raised object.** It takes the page ground rather than the plate, inside a `divider` border at the plate radius. A card is a thing on the plate and reads as content; the absence of content reads as a well. It is still an object — the border and the radius keep it from dissolving into the page.
- **The heading is the body face** at the Title weight. Under the Two Voice Rule Piazzolla speaks in page headings and card titles, and this is neither.
- **Name what is absent, not the emptiness.** "No approvals waiting" tells the reader something; "Nothing here" tells them the screen loaded.

### Description list

**Character:** a label and its value, fifteen times a page.

- **Each pair is wrapped**, which HTML permits inside a `dl`, and that wrapper is what makes three layouts one stylesheet: the pair becomes a box to lay out rather than two siblings to place by index.
- **Layouts:** `rows` for a detail panel the reader scans down, stacking below the measure on its own; `stacked` for a narrow column; `grid` for a strip of independent facts.
- **The term is muted Label type and the value is body ink**, because the value is the content and the label is the way in.
- **Numeric values take tabular figures and align to the end edge**, the same reasoning `prose.css` applies to a numeric table column.

### Disclosure

**Character:** a key that happens to be the width of the thing behind it.

- **It is a native `<details>`, and that is the design decision, not an implementation one.** The alternative was React Aria's `Disclosure` — a `<button aria-expanded>` whose open state lives in a client runtime. The platform element brings the press, the keyboard, the announcement, and exclusive grouping with no JavaScript, which is the whole reason this component exists: it is the one interactive thing a statically rendered page can have.
- **The treatment is one rule shared with `prose.css`, and it lives in `base.css`.** It could live in neither of the two obvious files. `styles.css` is data-attribute-only and may hold no `:hover` or `:active`; `prose.css` is opt-in, so a component styled there would be unstyled on the product surfaces the component is for. The token layer is the file every delivery mode loads, which is where the skip link and the focus ring already are.
- **The summary is a two-slot key**: a label, and an optional description on the line beneath it. Beneath rather than beside, because a description wraps and a column does not — both repos that invented this shape gave the second slot a column, and both squeeze the label to nothing at 320 pixels.
- **The chevron is the registry's `caret-down`**, drawn as a real glyph. The same path `prose.css` masks onto its pseudo-element, from one vendoring run. It rotates by `--kc-chevron-open-turn`, which resolves to `0deg` under reduced motion — the open content is the signal and the rotation is the flourish.
- **Grouping is a prop, not a variant.** `name` makes siblings an exclusive accordion, which is native behavior and therefore free on a page with no runtime.
- **The body is not quoted from anywhere**, so it wears no leading edge. It is the thing the summary promised, not something attributed to somewhere else — the Leading Edge Rule, read the way it is written.
- **There is no controlled `open`.** A `<details>` owns its own state, which is exactly what lets it work without JavaScript. `onToggle` is there for an app that needs to know.

### Code block

**Character:** the inline code treatment, one step larger, in a box you can reach.

- Deliberately the same treatment `prose.css` gives a `pre`. A code sample in a product surface and one in an article are the same thing, and the reader should not have to notice which page they are on.
- **It is focusable**, per the Prose Markup Rule: long code lines scroll by default, and a scrollable region a keyboard cannot reach is a 2.1.1 failure. No focus rule ships with it — `base.css` rings every `:focus-visible` at zero specificity, so the indicator arrives from the token layer in every delivery mode.
- **Four syntax roles, and only two of them are colors.** A `pre` carrying five hues is the loudest thing on any page it appears on. Comments and punctuation recede to the muted ink; a string — usually the value the reader is scanning for — takes the accent; a keyword is carried by weight. Coral appears nowhere, because nothing in a code sample commits to anything.
- **The copy control sits above the block, not over its corner.** An overlaid control is always covering the first line, and one revealed on hover is invisible to touch and to the keyboard.

## Delivery

The visual system reaches non-React projects two ways, and the split is
structural rather than documentary.

`styles.css` expresses every interactive state through React Aria's data
attributes and contains no `:hover`, `:active`, or `:focus-visible` rule. A
hand-written `.kc-button` therefore renders correctly at rest and does nothing on
interaction — which is what makes hand-authoring an unsupported path in practice
and not only in an ADR.

Statically rendered pages get those states from a separate opt-in stylesheet,
imported only by a prerender path. Moving a rule from it into `styles.css` would
make hand-authored markup work and is the one change this system cannot absorb.
`Select` and `Popover` appear in neither: a listbox that cannot open is not a
degraded Select.

`Dialog` is in `styles.css` and not in `static.css`, which is the same answer
arrived at from the other side. It is styled through `[open]` and `::backdrop` —
an attribute and a pseudo-element, so the data-attribute-only rule is untouched —
and it has no static counterpart because a `<dialog>` opens only when something
calls `showModal()`. There is no state for a prerender path to restore, because
there is no page without JavaScript on which it does anything at all.

Three things need no static counterpart because they already work everywhere: the
skip link, the focus ring, and the disclosure all live in the token layer, since
an accessibility floor that depends on which stylesheet a page happened to import
is not a floor.

The disclosure is the sharpest of the three, and it is the one case where a state
rule is *right* to be a pseudo-class. `styles.css` is data-attribute-only so that
hand-authored markup is visibly inert — but a `<details>` breaks that rule's
premise rather than the rule itself. Its press belongs to the browser, so
hand-written disclosure markup genuinely opens, genuinely takes the keyboard, and
genuinely announces itself. There is nothing to be inert about, and rendering it
inert would be a lie in the opposite direction: the control works, and the
treatment would be saying it does not. So the whole treatment sits in `base.css`,
`styles.css` carries no rule for it, and `static.css` has nothing to restore.

## Long-form content

Articles are the one surface the system cannot reach with components. Content arrives as bare `h2`, `blockquote`, `table`, `kbd` — emitted by a CMS, rendered from markdown, or typed by an author — and none of it can be passed a prop. `@jflamb/keycaps-tokens/prose.css` therefore styles those elements by tag inside a `.kc-prose` container, and is opt-in rather than part of the default import, because a product surface that renders no articles should not pay for it.

Nothing in it is new vocabulary. A callout is the Banner's shape built from bare markup and a `data-tone`; a code block is the inline code treatment one step larger; the measure is the Intrinsic Maximum Rule applied to text, at `--kc-prose-measure` (58ch, about 80 rendered characters in Sofia Sans). Coral appears nowhere, because nothing in an article commits to anything.

Heading sizes live here and only here. The token package ships none — the surface decides how large a heading is and the face does not — and a prose stylesheet is a surface, so `--kc-prose-h1` through `--kc-prose-h6` are declared on `.kc-prose` as the override point.

### The two elements the Pressable Edge Rule decides

**`kbd` does not get the bottom edge.** A keycap design system rendering a keyboard key as an actual keycap is the obvious move, and the rule forbids it: the edge promises travel, and a `kbd` never travels because it is a picture of a key on a different device. This is the same reasoning that denies the Badge an edge. It costs the system its most obvious joke.

**`summary` does.** A disclosure is a real control, so it wears the edge and keeps the promise — 3px down, 4px compressing to 1px, from the same tokens a Button reads. The implementation differs because a Button pins its border box with `min-block-size` and a `summary` wraps to as many lines as its label needs; the padding does that job instead, giving up exactly what the edge takes over the same duration, so the border box is the same height on every frame and nothing below reflows while the key is down.

The rule that says so is not in `prose.css`. It is in `base.css`, and every selector in it names `.kc-prose summary` and the `Disclosure` component's `.kc-disclosure > summary` together — one declaration block for both surfaces rather than two that agree today. See Disclosure under Components for why the treatment could live in neither of the two files it might have.

### Named Rules

**The Prose Markup Rule.** CSS cannot add a role, a name, or an `id`, so four patterns are incomplete without markup doing its half: table scroll containers and `pre` blocks need `tabindex="0"` (a scrollable region a keyboard cannot reach is a 2.1.1 failure), callouts need `role="note"` and a label, external links are marked by `target="_blank"` and need a visually hidden "opens in a new tab", and icon-only links need a `.kc-sr-only` name.

**The Tone Trio Rule reaches prose too.** Every callout tone sets a surface, a border, ink, and a distinct icon *shape* — not the same shape in a different color — so the distinction survives forced colors, monochrome print, and color vision deficiency.

## Do's and Don'ts

### Do:

- **Do** couple the press values. `translateY(3px)` and the 4px → 1px edge compression are one gesture; changing either alone breaks the key's physics.
- **Do** give every status a second carrier. Surface, border, and text move together, and a label, icon, or ARIA role carries the meaning when color is unavailable.
- **Do** compute nested radii with `calc()` from the parent (`calc(var(--kc-radius-key) - 3px)`), so curves stay concentric.
- **Do** let components set their own measure with `min(100%, Xrem)` rather than constraining them from outside.
- **Do** reach for semantic tokens (`--kc-color-key-face`, `--kc-color-danger-text`) in component CSS. Brand primitives are the palette's source, not its interface.
- **Do** express every state change in a way that survives `forced-colors: active` — the system already maps every semantic token to a system color, and new components must too.
- **Do** use logical properties (`inline-size`, `border-block-end`, `padding-inline`) so the system flips for RTL for free.

### Don't:

- **Don't** drift toward borderless flat minimalism — shadowless cards, seamless surfaces, objects that dissolve into the page. Keycaps is built on things being seated and visibly distinct from their ground. This is the system's confirmed anti-reference.
- **Don't** put a weighted bottom edge on something that doesn't depress. The edge promises travel; a static element wearing one is a false affordance. This is why `kbd` is not a keycap, however much it wants to be.
- **Don't** distinguish two committing actions by hue alone. Coral and danger differ by one channel, so a filled destructive key beside a filled primary key is a coin flip. Form carries the difference; color confirms it.
- **Don't** add a `:hover`, `:active`, or `:focus-visible` rule to the component stylesheet. Those states ship separately so hand-authored markup stays visibly inert — see Delivery.
- **Don't** add a plate shadow in dark mode. Depth there is the surface ladder, not a cast.
- **Don't** use coral for anything but a committing action. Not for emphasis, not for decoration, not for a hover state on something that isn't a key.
- **Don't** introduce a fourth typeface, or let Piazzolla into body copy. Three faces is the ceiling: display, body, code.
- **Don't** pin Piazzolla's `opsz` axis, per surface or globally. Optical sizing runs automatically; fixing it to one value breaks the Title role.
- **Don't** set symmetric margins on a heading, or leave it on the UA default, which is symmetric. More space above than below is what makes the heading read as opening its section.
- **Don't** write raw color values in component CSS. If a needed color has no token, add the token.
- **Don't** fetch anything at runtime — fonts, styles, or icons. Everything ships with the package.
- **Don't** remove or restyle the focus ring below 3px at 3px offset.
- **Don't** use pure gray, pure black, or pure white. Every neutral carries a bias.
