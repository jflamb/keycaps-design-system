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
    fontFamily: "Fraunces Variable, Georgia, Times New Roman, serif"
    fontWeight: 600
    lineHeight: 1.2
    fontVariation: "'opsz' 11, 'SOFT' 80"
  title:
    fontFamily: "Fraunces Variable, Georgia, Times New Roman, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    fontVariation: "'opsz' 11, 'SOFT' 80"
  body:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  micro:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
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

Warmth comes from material, not from saturation. The neutrals are warm-shifted rather than gray (`plate` #fdfdfb, `divider` #e7e7e3), the display face is Fraunces held at a constant optical size with softened terminals, and the accent is coral rather than blue. Coral appears at full strength on exactly one kind of thing — an action that commits — which is why the plate reads as calm. The scarcity is semantic, not budgeted: commitments are rare, so the color that marks them is rare.

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
- **Danger** (`danger` #c7302b): error text and invalid-field borders. Deliberately close to coral in hue and clearly darker in tone — errors belong to the same warm family, so the interface never turns alien when something goes wrong.

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

**Display Font:** Fraunces Variable (with Georgia, Times New Roman, serif)
**Body Font:** Nunito Sans (with ui-sans-serif, system-ui, -apple-system, sans-serif)
**Label/Mono Font:** ui-monospace, Cascadia Mono, SF Mono, Menlo, Consolas (system stack; no bundled mono)

**Character:** A softened transitional serif over a humanist sans. Fraunces ships at `opsz 11` and `SOFT 80` — a low optical size with softened terminals, which keeps it warm and slightly bookish rather than sharp and editorial. Nunito Sans has rounded terminals and open apertures, so the pairing reads friendly at small sizes without becoming informal. Both are local WOFF2; nothing is fetched at runtime.

### Hierarchy

- **Display** (600, size set by context, 1.2): `h1` and `h2`. Fraunces with its optical settings applied. Sizes are not tokenized — the surface decides, the face does not.
- **Title** (600, 1.25rem, 1.2): card titles. The only place Fraunces appears inside a component rather than in page-level headings.
- **Body** (400, 1rem, 1.55): default running text and input values. The generous 1.55 leading is what makes dense forms breathable.
- **Label** (600, 0.875rem, 1.45): field labels, button text, descriptions. Semibold rather than bold, because a label should be findable, not loud.
- **Micro** (700, 0.75rem, 1): badges and small keys. Bold and tight-leaded — at this size, weight is the only hierarchy signal that survives.

### Named Rules

**The Two Voice Rule.** Fraunces speaks in page headings and card titles. Nunito Sans does everything else — every label, every value, every button, every error. A third face, or Fraunces creeping into body copy, breaks the system.

**The Optical Constant Rule.** Fraunces is always set at `font-variation-settings: var(--kc-font-variation-display)`, which is `"opsz" 11, "SOFT" 80`. The variable axes are a brand constant, not a per-surface control, and they are declared in exactly one place. Changing them changes the voice.

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

### Cards / Containers

**Character:** the plate itself, not an object on it.

- **Corner Style:** plate radius (18px), the largest in the system.
- **Background:** `plate` on a `cloud` page.
- **Shadow Strategy:** `--kc-shadow-plate` in light, none in dark (see Elevation).
- **Border:** 1px `divider` — lighter than the interactive `fog`, because a card encloses without demanding.
- **Internal Padding:** step 6 (1.5rem), tightening to step 5 below 30rem. Header and body stack at step 2; the footer separates with a `divider` rule and step 4 of top padding.
- **Title:** the one place Fraunces appears inside a component.

### Inputs / Fields

**Character:** a well in the plate, not a box on it.

- **Style:** 50px tall, `plate` fill, 1.5px `fog` border, keycap radius. The half-pixel border weight is deliberate — heavier than a divider, lighter than a key edge.
- **Hover:** border darkens to `slate`.
- **Focus:** the standard 3px coral ring at 3px offset.
- **Invalid:** border shifts to `danger-border`, with error text in `danger` at semibold. The error element collapses when empty rather than reserving space.
- **Structure:** label, description, control, and error stack in a grid at step 2, capped at 32rem.

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

### Popover

**Character:** genuinely detached — the one thing in the system that floats.

- **Style:** keycap radius, `plate` fill, 1px `fog` border, overlay shadow in both themes, capped at `min(24rem, calc(100vw - 2rem))` so it never overruns a small viewport.
- **Motion:** 140ms ease-out fade with a 4px rise; removed entirely under reduced motion.

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
- **Don't** put a weighted bottom edge on something that doesn't depress. The edge promises travel; a static element wearing one is a false affordance.
- **Don't** add a plate shadow in dark mode. Depth there is the surface ladder, not a cast.
- **Don't** use coral for anything but a committing action. Not for emphasis, not for decoration, not for a hover state on something that isn't a key.
- **Don't** introduce a third typeface, or let Fraunces into body copy.
- **Don't** override Fraunces' `opsz 11` / `SOFT 80` per surface. The axes are brand constants.
- **Don't** write raw color values in component CSS. If a needed color has no token, add the token.
- **Don't** fetch anything at runtime — fonts, styles, or icons. Everything ships with the package.
- **Don't** remove or restyle the focus ring below 3px at 3px offset.
- **Don't** use pure gray, pure black, or pure white. Every neutral carries a bias.
