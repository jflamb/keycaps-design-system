---
target: apps/storybook
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-08T18-30-56Z
slug: apps-storybook
---
Method: dual-agent (A: a1bfda8328a28c1ac · B: a4388d2836a92eaca)

Target: `apps/storybook` — the Keycaps Storybook documentation site. Mode: **Read**. Inspected live at `http://127.0.0.1:6006` (dev server, since stopped) at 1280×800 and 375×812, light and dark.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Accessibility panel sits on "Preparing accessibility scan… Please wait while the addon is initializing…" for 36s+ and never resolves; the theme toolbar reads "Light" on Introduction where `data-theme` is never set. |
| 2 | Match System / Real World | 3 | Guidance prose speaks the reader's language; but the section named "Foundations" documents no foundations. |
| 3 | User Control and Freedom | 3 | Deep links, ⌘K, and Escape all work. The first controls offered are dismiss buttons for Storybook's own onboarding checklist and version toast. |
| 4 | Consistency and Standards | 1 | Three grounds on one screen; `.sbdocs-title` renders Nunito Sans 32px/700 with Fraunces' `opsz`/`SOFT` axes dangling on a face that has no such axes; deployed `<title>` is `storybook - Storybook`. |
| 5 | Error Prevention | 2 | The `isInvalid={false}` trap that suppresses React Aria's native validation is documented only in a source comment (`Field.tsx:31`); `label`/`errorMessage` controls open a JSON editor for a plain string. |
| 6 | Recognition Rather Than Recall | 2 | The Description column is empty in all seven args tables; every prop inherited through `Omit<AriaProps,…>` is absent, including `isRequired`/`isInvalid`/`isDisabled` that the stories themselves demonstrate. |
| 7 | Flexibility and Efficiency | 2 | No `play` functions anywhere, so Interactions is permanently empty; no reduced-motion or forced-colors toolbar globals; no token-copy affordance. |
| 8 | Aesthetic and Minimalist Design | 1 | Prime sidebar space is Storybook's "Get started 28%" checklist — measured occluding the "Default" sidebar link by 93%; `min-block-size: 12rem` + `layout: "padded"` puts a 44px button in a ~330px void; every code panel is forced open. |
| 9 | Error Recovery | 2 | The a11y panel is an unrecoverable non-error state with no diagnosis or retry. Offsetting credit: the error *copy* in the stories is exemplary and models the project's own content standard. |
| 10 | Help and Documentation | 2 | This *is* the documentation and the per-component paragraphs do teach; but tokens, color, type, spacing, motion, elevation, the tokens subpath exports, the `legacy.css` retrofit path, and licensing are all undocumented. |
| **Total** | | **20/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**This is stock Storybook with good prose poured into it. The prose is authored for Keycaps; the design is not authored at all.**

**LLM assessment.** There is no `.storybook/manager.ts`, no `preview-head.html`, no `docs.theme`, no `brandTitle`. `main.ts` is 19 lines: stories, two addons, framework, `docs.defaultName`. That is the entire design investment in the documentation surface of a design system.

Three consequences, each measured:

- **The chrome breaks the system's own Named Rules.** `.sbdocs-wrapper` background is `rgb(255,255,255)` and `.sbdocs-title` ink is `rgb(46,51,56)` — DESIGN.md's Warm Neutral Rule forbids pure white, and `graphite` is `#3a3f47`, not `#2e3338`. The sidebar shows the pink Storybook mark and the word "Storybook." The built artifact's `<title>` is `storybook - Storybook`, which is what the deployed Pages tab and every link preview says.
- **Fraunces never reaches a Storybook-generated heading.** `packages/tokens/src/base.css:29` sets the display face via `:where(h1, h2)` — zero specificity, correct for consumers — so Storybook's emotion class wins `font-family` while `font-variation-settings` from the same rule survives and lands on Nunito Sans. On the showcase page that produces two visible `<h1>`s: `Component showcase` in Nunito at 32/700, and the story's own `A calm foundation for consequential work` in Fraunces at 32/600 — and the wrong one is heavier and higher in the outline. The Two Voice Rule is broken by the docs frame, not by the components.
- **Every rule with teeth lives in `DESIGN.md` and nowhere on the site.** The Commitment Rule, Tone Trio Rule, Warm Neutral Rule, Pressable Edge Rule, Concentric Radius Rule, 320 Rule, Intrinsic Maximum Rule, and Light Lifts / Dark Layers are all unlearnable from this Storybook. Swap the seven component names and the site ships unchanged for any React library.

**Deterministic scan.** `detect.mjs --json apps/storybook/src apps/storybook/.storybook packages/react/src/components` → **exit 0, zero findings** across 18 enumerated files. The clean pass is genuine, not a silent skip: the detector was validated three ways (it fires `overused-font` on scratch `.tsx` and `.html` fixtures, and its `walkDir` was called directly to confirm all 18 target files were walked). The JSX and story source is mechanically clean.

Two honest caveats on that clean bill:
- Per the markup-only rule, `packages/tokens/src/*.css` and `packages/react/src/styles.css` were not scanned — which is where every `font-family` declaration lives. `Fraunces` is on the detector's own overused-font list, so the rule most likely to fire was structurally out of scope. It would have been a false positive regardless: DESIGN.md pins Fraunces as a brand constant, and a pinned brief overrides a saturated-pattern warning.
- The detector reads source, not rendered output. Everything wrong with this surface is in what is *absent* (no manager theme, no foundations pages, no TSDoc) or in cascade interaction at runtime. A source-pattern scanner cannot see any of it. **The gap between "zero mechanical findings" and 20/40 is the finding.**

**Visual overlays.** Mutable injection succeeded (title set, `<script>` attached *and* executed). The overlay server ran on port 8400 and was stopped with `live-server.mjs stop`, verified refused. The overlay reached both the manager document and the docs iframe via same-origin `contentDocument`, and rendered visible annotations — but **it does not propagate into the story iframe automatically**; that needs its own injection. Both servers are now stopped, so no overlay is currently visible in your browser.

Project-owned overlay findings at a valid viewport (manager 1280×720, docs iframe 980×680): `line-length` ×7 on Introduction at ~122–126 chars/line against an <80 target, `nested-cards` on `ARTICLE.kc-card`, and `layout-transition` (`transition: width`). Everything else the overlay flagged — `undersized-ui-text` on Storybook's 10px "Skip to content", `dark-glow #006dea` on Storybook's focus ring, `ai-color-palette` cyan on the Storybook logo SVG and purple on the Prism syntax theme, `text-occlusion` from the onboarding popup — is Storybook's own emotion-hashed chrome, not your code. Those are **false positives against `apps/storybook`** in the sense that you did not write them, but the occlusion one is a real reading defect on your surface regardless of who shipped the CSS.

One methodology note worth keeping: the first overlay pass ran while the browser tab was backgrounded at `innerWidth 0`, producing seven bogus `body-text-viewport-edge` findings at "right -240px" that vanished entirely once the tab was fronted. Geometry rules run in a hidden tab are worthless. The Button and Field docs pages were only ever measured at 0×0, so their raw counts (13 and 18) are unreliable and are excluded from the numbers above.

## Overall Impression

The engineering is careful and the writing is better than most component libraries ship. The guidance paragraphs contain real prescriptions with negative space — "Choose primary once per decision area," "Do not put long tasks or consequential confirmation flows in a popover" — and every example string models the project's own error-copy standard without announcing it. Zero console errors. Zero third-party network requests. Axe reports 0 violations, 10 passes on the showcase story.

And it is all being presented on someone else's product. The loudest element on your landing page is Storybook's onboarding checklist telling you to "Render your first component." The tokens layer — the thing PRODUCT.md stakes its positioning claim on, the thing Principle 2 puts *before* components — has no page. A reader who wants to know which token is a warning surface will open `tokens.css` in the repo and never come back, which makes the documentation site optional for its primary job.

**The single biggest opportunity: the Named Rules in `DESIGN.md` are already the best documentation this project has. Render them.** Not restated as prose — as live Foundations pages where the coral key can be pressed, the swatch shows its light and dark values side by side, and the reduced-motion substitution sits next to the travel.

## What's Working

**The guidance prose has a point of view, and it includes "don't."** `Button.stories.tsx:11` — "Choose primary once per decision area." `Card.stories.tsx:20` — "Do not wrap every section in a card; open layout and simple dividers are often clearer." Most component docs state what a prop does and stop. Prescriptions with negative space are rare and hard, and this is the one part of the site that could not be lifted from another library.

**The example content teaches the content standard by osmosis.** Banner Danger: "Reconnect Gmail before relying on inbox coverage." Field Invalid: "Enter an email address in the format name@example.com." Select options carry the real PARA vocabulary. `docs/contributing/components.md:21` demands errors that state what happened and what to do next — and every string on the site models it, so a reader absorbs the standard without being told it exists.

**The Foundations showcase is a genuinely good artifact and it survives both themes.** One composition exercises all seven components with a real heading structure, live dismiss state, and a popover launched from a card footer. Verified in dark: canvas `#15181d`, `.kc-card` box-shadow `none` — Light Lifts / Dark Layers holds correctly. The Field measures exactly 512px, so the Intrinsic Maximum Rule holds. This is the one page where the system reads as intentional — and it is the last node in the sidebar, filed under a section a reader would rationally skip, referenced from `Introduction.mdx:33` as **plain unlinked text**.

## Priority Issues

### [P0] "Foundations" documents no foundations — including the press, which is the system's thesis

The Foundations section contains exactly one item: `Component showcase`. Zero pages document the ~60 `--kc-*` custom properties, the four semantic tones, the four radii, the eight-step space scale, the two shadows, the light-lifts/dark-layers asymmetry, the five typographic roles, or the 120ms press. `preview.tsx:18-29` wires exactly one toolbar global (`theme`) — no reduced-motion, no forced-colors — and there is no `play` function in any story file, so Interactions is permanently empty. The press (`translateY(3px)` coupled to a 4px→1px edge compression over 120ms) is one clause in `Button.stories.tsx:11`.

**Why it matters:** the reader's most frequent question is "what token do I use for X," and the site cannot answer it. PRODUCT.md's positioning claim — that non-React consumers can take the framework-neutral tokens alone — has zero documentation supporting it; none of `./tokens.css`, `./base.css`, `./fonts.css`, or `./legacy.css` appear anywhere in Storybook, and `legacy.css` is the retrofit path Principle 4 calls "first-class." And the one thing that makes Keycaps memorable is unavailable in the artifact whose job is to make it memorable.

**Fix:** three authored MDX pages under Foundations, ordered above Components in `main.ts`. **Color** — a swatch grid rendering live `var(--kc-color-*)` with semantic name, underlying primitive, and dark value side by side, with the Commitment and Tone Trio Rules stated as rules. **Type** — the five roles rendered in their actual faces, with the Two Voice and Optical Constant Rules. **Depth & Motion** — plate vs overlay shadow in both themes, and the press shown three ways: a key you can hold, the same key with motion suppressed beside it, and the coupled 3px/4px→1px values annotated on the gesture. Add toolbar globals for `prefers-reduced-motion` and `forced-colors` so the substitution is operable, not just illustrated. Add a fourth page documenting the tokens package subpaths and the `legacy.css` retrofit.

**Suggested command:** `/impeccable shape` (to structure the Foundations IA), then `/impeccable animate` (to build the press documentation).

### [P0] The docs chrome is unbranded stock Storybook, and the shipped artifact is titled "storybook - Storybook"

No `.storybook/manager.ts` exists. `main.ts` has no theme, brand, or head configuration. Measured: `.sbdocs-wrapper` background `rgb(255,255,255)`, `.sbdocs-title` `rgb(46,51,56)` in Nunito 32px/700 with Fraunces' variation axes dangling. `storybook-static/index.html` title is `storybook - Storybook`. In dark mode the showcase docs page is a luminance sandwich: white `.sbdocs-wrapper` → `#15181d` canvas → white sheet.

Separately, the theme control is a per-canvas toy rather than a site mode. `preview.tsx:6-14` sets `data-theme` inside the preview iframe via a story decorator, so on Introduction — pure MDX, no story — `data-theme` is `null` in every configuration, including `&globals=theme:dark`. Tokens there fall back to `prefers-color-scheme`, so on a dark-preferring machine `body` computes `rgb(21,24,29)` while the toolbar reads "Light" and Storybook paints white on top. It does not currently produce visible contrast failures (a full TreeWalker sweep found 0 elements below 4.5:1 on Introduction) because Storybook sets explicit colors on every text-bearing element — but any future token-driven MDX, such as the Color page above, will silently render dark values in Light mode.

**Why it matters:** this is a design system's showroom. Every judgment a reader forms about whether Keycaps has taste is formed on a surface that expresses none of it — and the frame violates two of the system's own Named Rules. For PRODUCT.md's secondary audience, "this visual system is worth adopting" is the entire pitch, made on a page branded for someone else.

**Fix:** add `.storybook/manager.ts` with `addons.setConfig({ theme: create({ base: "light", brandTitle: "Keycaps", fontBase: '"Nunito Sans", …', appBg: "#f5f5f3", appContentBg: "#fdfdfb", textColor: "#3a3f47", colorSecondary: "#c7452c" }) })`. Set a matching `docs.theme` in `preview.tsx`. Add `preview.css` rules at class specificity mapping `.sbdocs-wrapper` → `var(--kc-color-surface)`, `.sbdocs-content` → `var(--kc-color-text)`, and `.sbdocs-title` → the display face, so they beat Storybook's emotion classes. Set `<title>` via `managerHead`. Move the theme decorator to a global that also stamps `data-theme` on the docs document, not just the story canvas. Disable Storybook's onboarding and whats-new panels.

**Suggested command:** `/impeccable polish`

### [P1] The API reference has an empty Description column and omits the props the stories use

Verified across all seven components: **every Description cell is empty**, because no TSDoc exists on any prop in `packages/react/src/components/*.tsx`. Every prop inherited through `Omit<AriaButtonProps,…>` / `Omit<TextFieldProps,…>` / `Omit<AriaSelectProps<…>,…>` is missing from the table — `isDisabled`, `onPress`, `isRequired`, `isInvalid`, `value`, `onChange`, `type`, `defaultSelectedKey`. Three of Field's four stories and one of Select's three demonstrate props their own table does not list. `SelectOption` (`Select.tsx:17-22`) never gets a table at all.

**Why it matters:** the primary reader is here for API guidance. A table that reprints the TypeScript type with no prose is strictly worse than hovering the import in their editor, and a table that omits `isRequired` on a form field is actively misleading about what the component can do.

**Fix:** TSDoc every exported prop — that alone fills the column. Add explicit `argTypes` for the inherited Aria props the stories use, or configure `reactDocgen` to follow the `Omit<…>` base. Add a `SelectOption` shape table to the Select page. Document the `isInvalid={false}` validation trap from `Field.tsx:31-35` on the page rather than in a comment, and surface each component's beta status from `docs/component-status.md`.

**Suggested command:** `/impeccable clarify`

### [P1] The Accessibility panel never resolves — while axe is actually clean

`preview.tsx:33-36` sets `parameters.a11y.test = "error"`, which in Storybook 10 hands the panel to the Vitest test provider. `apps/storybook/package.json` has `@storybook/addon-a11y` and `@storybook/addon-docs` and **no `@storybook/addon-vitest`**. Verified on two stories for 36s: "Preparing accessibility scan / Please wait while the addon is initializing…", with zero console errors. Meanwhile axe-core 4.11.0 *is* loaded in the iframe, and running it manually against `#storybook-root` with `wcag2a/wcag2aa/wcag21a/wcag21aa` returns **0 violations, 10 passes, 0 incomplete**.

**Why it matters:** "Accessibility is a release gate, not a feature" is PRODUCT.md Principle 3, and `Introduction.mdx:25` promises accessibility checks live alongside the docs. The components genuinely pass — and the site's single accessibility affordance is a spinner that never resolves, so a reader auditing the claim concludes the claim is decorative. This is the rare defect that makes verified-good work look unverified.

**Fix:** either add `@storybook/addon-vitest` and the test provider so `test: "error"` has a runner, or drop `test: "error"` so the panel falls back to a live axe scan of the rendered story. Do not ship both a promise and a spinner. Separately, add stories for the a11y-relevant props that currently have none: `CardTitle level` (`Card.tsx:30-32`, while `Card.stories.tsx:20` instructs "Use heading levels that preserve the page outline"), `Banner`'s `status`/`alert` role switch (`Banner.tsx:30`), and `Button size="small"` — the sole documented exception to the 44px rule.

**Suggested command:** `/impeccable harden`

### [P1] Reading density: one artifact per screenful, and the install command is clipped on mobile

`preview.css:7-9` sets `.kc-docs-canvas { min-block-size: 12rem }` on top of `layout: "padded"`, so a 44px Button occupies a ~330px canvas. `preview.tsx:41` sets `sourceState: "shown"`, forcing every code block open — five on the Button page, four on Field. Introduction runs 122–126 characters per line against an <80 target.

At 375×812 the numbers get worse. Page-level reflow is clean (`scrollWidth === clientWidth === 375` on both manager and docs iframe, so the 320 Rule holds at the page level), but the story canvas measures **233px** — 87px below the system's own declared floor, meaning a mobile reader evaluates every component below spec. And the single most important string on the site, the install command, renders as `pnpm add @jflamb/keycaps-tokens @jf` and stops: the inner `<pre>` is 592px inside a 293px container with `overflow-x: scroll`, and macOS overlay scrollbars draw no affordance, so it reads as truncated rather than scrollable. The import block clips at `"@jflamb/keycaps-react/style`.

**Why it matters:** comprehension in reference docs comes from comparison — seeing variants near each other. This layout guarantees they never share a screen. And a reader who cannot copy the install command has been stopped at step one.

**Fix:** set `min-block-size: auto` and scope the 12rem only to the Popover and Select stories that need drop space. Default `sourceState: "hidden"`. Add `layout: "fullscreen"` for the showcase. Give code blocks a visible horizontal-scroll affordance or `white-space: pre-wrap` at narrow widths. Add a fluid `clamp()` to the showcase `h1`, which currently renders 198px tall across four lines at 375px. Cap Introduction's measure — DESIGN.md's Intrinsic Maximum Rule applies to prose too.

**Suggested command:** `/impeccable layout`

## Persona Red Flags

**Jordan (First-Timer).** Lands on Introduction. The most visually prominent element is Storybook's own onboarding checklist at 28%, instructing them to "Render your first component" and "Publish your Storybook for feedback" — instructions for building a Storybook, not for using Keycaps. Bottom-left, a "Storybook 10.4" toast overlaying the "Package boundaries" heading. Their actual first question, "what does this thing look like," is answered only by `Foundations / Component showcase` — the last node in the sidebar, referenced from `Introduction.mdx:33` as unlinked plain text, so there is no click path to it from the landing page. Nothing on Introduction says what to read second. The install command they came for is clipped on a phone.

**Sam (Accessibility-Dependent).** Clicks Accessibility on any story → infinite "Preparing accessibility scan." Verified heading outline on the showcase docs page: **two visible `<h1>`s** (`Component showcase` from Storybook, `A calm foundation for consequential work` from the story) followed by `H2 Project settings` — plus two hidden 0×0 `<h1>`s from Storybook's no-preview scaffold. The prop that would fix heading outlines, `CardTitle level`, is in no args table and has no story. The Field error element carries no `role` and the docs never state how errors are announced. Genuine credit: the coral focus ring renders correctly at 3px/3px offset on the Select trigger, the Banner dismiss measures exactly 44×44 with `aria-label="Dismiss message"`, the Select trigger is 512×50, and axe finds 0 violations. Sam's problem is that the site cannot prove any of this to them.

**Casey (Distracted Mobile).** At 375px: install command clipped at `@jf`, import block clipped mid-path, story canvas 233px, showcase `h1` 198px tall across four lines, six-plus scrolls before a single control appears, and the version toast covering a section heading. No page-level horizontal scroll, so the reflow gate passes — but every artifact Casey came to see is either clipped or presented below the width the system promises to support.

**The outside developer evaluating adoption** (PRODUCT.md's anticipated secondary audience). `Introduction.mdx:12` leads with `pnpm add @jflamb/keycaps-tokens @jflamb/keycaps-react`. The site never mentions a license; `packages/react/package.json` declares `"license": "UNLICENSED"` beside `publishConfig: { access: "public", provenance: true }`. The docs instruct installation of a package the reader has no grant to use — PRODUCT.md:48 confirms this is unresolved, not an oversight. Then the two workflows the product explicitly commits to both have zero documentation: non-React token consumption (none of the tokens subpath exports appear anywhere in Storybook) and incremental retrofit via `legacy.css`. This reader can evaluate the components and cannot evaluate the product.

## Minor Observations

- **The Select menu is narrower than its trigger.** `styles.css:171-173` caps `.kc-select__popover` at `min(24rem, calc(100vw - 2rem))` = 384px while `:200` sets `inline-size: var(--trigger-width)` = 512px. Measured: 384 vs 512. DESIGN.md:319 claims the popover "matches trigger width." The docs display the mismatch without flagging it.
- **The flagship Select example already overflows.** `.kc-select__listbox` max-block-size resolves to 288px against 290px of content, so the site's showcase Select scrolls at four options — exactly the pattern its own guidance recommends.
- **Opening the Select on its docs page destroys the text you were reading.** React Aria flips to `data-placement="top"` and the 298px menu covers the page `h1` and the guidance paragraph, because the trigger sits low in a 12rem-minimum canvas.
- **The Dismissible banner does not dismiss.** `Banner.stories.tsx:44` passes `() => undefined` rather than `fn()`, so clicking ✕ on the story named *Dismissible* does nothing and the Actions panel stays empty.
- **Nunito Sans is registered twice from two sources** — Storybook's `sb-common-assets/nunito-sans-{regular,bold}.woff2` and the tokens package's `nunito-sans-latin-{400,600,700}-normal.woff2`. Eight faces resolve in the docs iframe, four loaded (yours) and four unloaded (Storybook's). The docs chrome runs on Storybook's copy.
- **The flagship composition is the one example you cannot copy.** `Foundations.stories.tsx:96-98` uses `render: () => <Showcase />`, so the code panel prints `{ render: () => <Showcase /> }`. Every other multi-element story inlines its JSX.
- **`Field` Invalid shows an empty field with a placeholder.** Real errors happen after input; the story never shows a bad value.
- **Documented-but-unstoried:** `Button size="small"`, `SelectOption.isDisabled` (`Select.tsx:67`), `Card as`, `CardTitle level`.
- **Undocumented shipped utility:** `.kc-sr-only` (`base.css:45-55`) ships in the tokens package with no page.
- **`docs/component-status.md` and `docs/contributing/components.md` are not surfaced in Storybook at all** — the beta matrix and the release-status ladder exist only in the repo. No component page states its own status.
- **Nested cards:** the overlay flagged `ARTICLE.kc-card` inside a card on the showcase, which is worth a deliberate decision given `Card.stories.tsx:20` warns against exactly that.
- **`transition: width`** triggers a `layout-transition` finding on every view — animating a layout property.
- **One Storybook-internal deprecation warning:** `PopoverProvider` `ariaLabel` becomes mandatory in Storybook 11.
- **Credit:** zero console errors, zero console warnings, zero failed network requests, and every request local — PRODUCT.md Principle 5 holds cleanly.

## Questions to Consider

1. **If a reader can learn every `--kc-` token faster by opening `tokens.css` in the repo than by reading this site, what is the site actually for?** Right now it is a story gallery with a paragraph attached; the reference role it claims belongs to a file in `packages/`.
2. **Which is the real documentation surface — this Storybook, or `DESIGN.md`?** Every rule with teeth is in the file. Should the Named Rules *become* the Foundations pages, rendered live, rather than being restated?
3. **The press is the thesis and it lives in one clause of prose.** What would the Button page look like if it *opened* with the press — a key you can hold down, the same key with motion suppressed beside it, the coupled values annotated on the gesture?
4. **"Foundations" currently means "one composite story."** If the section were renamed to what it contains, would the gap still be tolerable — or is calling it *Foundations* precisely what lets the gap survive unnoticed?
5. **The site tells an outside developer to install a package licensed `UNLICENSED`.** Is documenting the licensing question openly better than the current silence, given PRODUCT.md says adoption-readiness depends on resolving it?
