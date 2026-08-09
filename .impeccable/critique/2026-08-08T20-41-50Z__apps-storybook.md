---
target: apps/storybook
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-08-08T20-41-50Z
slug: apps-storybook
---
Method: dual-agent (A: design review · B: detector + browser evidence), both isolated, both with browser access against a live dev server.

Target: `apps/storybook`. Inspected at 1280×800, 375×812 and 320×812, light and dark, across all three toolbar globals. Baseline for comparison: 20/40 on 2026-08-08.

**Timing caveat, stated up front.** The working tree changed under Assessment A mid-review (it observed `Consuming.mdx` gaining a License section between two reads). Several findings below were remediated *after* both assessments returned; each is marked. The score is not re-inflated to account for them, because no independent assessment has re-measured the fixed tree.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | All three toolbar globals render permanently in coral whether at default or overridden; "Off" and "Forced colors (simulated)" are visually identical in weight. At 375px the forced-colors control is entirely off-screen. |
| 2 | Match System / Real World | 3 | The physical vocabulary is consistent and earned. Deduction: the Component showcase — where Introduction sends newcomers first — opens with three paragraphs of QA-fixture justification. |
| 3 | User Control and Freedom | 2 | No way to reset globals to default; coral highlight hides which are non-default. No in-page TOC on a Color page measuring 4803px with 51 token rows. |
| 4 | Consistency and Standards | 1 | Prose measure 653px on Foundations MDX vs 901px on all seven component pages. Status is bold prose on eight pages and never a Badge. Release statuses render italic monospace. Manager introduces two untokenized coral derivatives and `#fff`. |
| 5 | Error Prevention | 2 | Excellent content-level prevention (the `isInvalid={false}` trap; "Legacy aliases are a migration path, not an API"). Undercut by the flagship "Proof" link landing on a failing test. |
| 6 | Recognition Rather Than Recall | 2 | Token tables read live values; Type prints specs read back off the rendered element. Deduction: 451–487px of empty gutter between each space bar and its value; color tables hide the DARK column at 375px with no scroll cue. |
| 7 | Flexibility and Efficiency | 3 | ⌘K, deep links, globals in the URL, Copy everywhere, values sourced from `package.json` and `docs/*.md`. Deduction: no filter across 51 color rows; 25–28px docs targets. |
| 8 | Aesthetic and Minimalist Design | 2 | Every code block is a box inside an identical box — 55% dead space at 375px. The space scale wastes ~74% of every row. Four full-width mint panels stack consecutively on Color. |
| 9 | Error Recovery | 1 | The only error surface a reader meets — Storybook's "Connection lost" toast — is stock and untouched by the system. The showcase lede promises "clear recovery language" and the composition contains no error state. |
| 10 | Help and Documentation | 3 | This *is* the documentation and the writing is genuinely non-generic. Deduction: no repo link, no issue tracker, no contribution path, no changelog, no version stated anywhere. |
| **Total** | | **21/40** | **Acceptable — significant improvements needed** |

Cognitive load: **5 of 8 checklist items fail** (single focus, grouping, hierarchy, one-thing-at-a-time, minimal choices, working memory, progressive disclosure). Decision points above four visible options: Foundations group (8), Components group (7), sidebar total (16), Button story list (8), story-view toolbar (13), Color tables (51 rows).

## Design Specificity Verdict

**Specifically authored, generically housed.**

The writing and the live-read apparatus could not be lifted into another design system without a rewrite. "The plate," "the cap travels," "a well in the plate," "a divider separates, it does not enclose" is load-bearing vocabulary. `ThemeScope` / `MotionScope` / `ForcedColorsScope` exist to make *this* system's asymmetries — light casts / dark layers, travel / material — visible side by side without faking the root-scoped contract. The `isInvalid={false}` trap is knowledge that only comes from having built the thing.

The shell is stock Storybook wearing Keycaps paint. Every control a reader touches is Storybook's at Storybook's sizes: canvas toolbar 28×28, Copy 49×25, four panel tabs, Storybook's args table. Where Storybook needed a color it invented one — selected sidebar item `#dc3714`, toolbar text `#9d3723`, neither a Keycaps token — because the theme object gave it a coral and let it derive. The IA is Storybook's default.

And the confirmed anti-reference has a foothold in the frame: `preview.css` writes `box-shadow: none` on `.sbdocs-preview` and `.docs-story` and sets their background to `--kc-color-surface`, the same value as the page ground. The containers holding the system's seated objects are shadowless, same-tone boxes that dissolve into the plate — verbatim the "shadowless cards, seamless surfaces" the system names as its anti-reference.

**Deterministic scan.** `detect.mjs` → exit 2, **2 findings**, both `overused-font` on Fraunces at `main.ts:35` and `:47`. Both are false positives the pinned brief overrides. But the clean bill is narrower than it looks: **`.mdx` is not in the detector's scannable extensions**, so it walked 32 of 40 files and read **none of the eight authored Foundations pages**. Verified by replicating the walker and by a positive-control fixture — an `.mdx` file containing `font-family: "Roboto"` produces no finding. The prose surface this whole remediation created is mechanically unscanned.

**Visual overlays.** Mutable injection succeeded; overlays ran in both the manager document and the docs iframe on six pages, with frame attribution verified by DOM ownership rather than console ordering. Server started and confirmed stopped (port refused, no listener, no script tag written into source).

Two overlay findings deserve correction rather than action: `layout-transition` fires on the docs `<body>` on every page, but measured `transition-duration` is **0s** — `transition-property: all` is the CSS initial value, and any layout-transition count not gated on duration is noise. Gated properly, the only real layout transition in Keycaps CSS is `.kc-button`'s `border-block-end-width`, which is the press and is intentional. **No Keycaps rule transitions `width`, `height`, `padding`, or `margin`** — the original critique's `transition: width` finding was this same artifact. Likewise `ai-color-palette` "cyan neon" ×45 is `#7ccbf2` at hsl(200°) — azure, the system's own `--kc-color-link` / `--kc-color-info-text` — not cyan, with `text-shadow: none`.

## Overall Impression

The evidence layer is genuinely excellent and the frame around it is not yet the system's own. Nine components read their values from the running stylesheet, the two `package.json` files, or `docs/*.md`, which eliminates doc drift by construction rather than by discipline. Two comparison labs turn paragraphs into glances. Zero off-origin requests, zero console errors, zero contrast failures across sixteen pages in both themes.

Against that: the site's one "check the claim rather than take it" link landed on a red `FAIL`, and the physics sentence quoted on eight pages was measurably false. Both are now fixed. What remains is that coral — the color reserved for commitment — is spent on wayfinding and toolbar state on every screen, while the one legitimate coral is buried in a canvas.

**The single biggest opportunity: the frame still belongs to Storybook.** Not the colors — those are themed. The controls, the sizes, the IA, and the error surface.

## What's Working

**Documentation that cannot drift, structurally.** `ColorTokens`, `ValueTable`, `TypeRoles`, `MotionValues`, `ComponentStatusMatrix`, `ReleaseLadder`, `ComponentContract`, `PackageExports`, `PeerRange` all read from the running system. The Type page goes furthest: each sample prints the spec read back off the rendered element. `PackageExports` surfaces a new export as an em dash rather than letting it stay invisible — a decision about future maintenance, not just present accuracy.

**Two comparison labs that turn a paragraph into a glance.** `ThemeScope` reads the authored dark declarations rather than nesting a `data-theme`, preserving the root-scoped contract instead of pretending it is scopeable — and says so on the page.

**Globals that drive the shipped contract, not a simulation.** The three toolbar controls set the same attributes a consuming app sets, applied at document level so pure-MDX pages switch too, with URL globals read on cold load. Plus the manager-side scan kick: without it every deep link sat on "Preparing accessibility scan" forever. Verified 0 violations / 6 passes on a cold deep link.

## Priority Issues

### [P0 — FIXED] The site's one "Proof" link landed on a failing test
`Motion.mdx` says the play function "shows the press being exercised rather than described." It failed: `expect(element).not.toHaveAttribute("data-pressed")` received `data-pressed="true"`. Cause: React Aria captures the pointer on press, and `userEvent.pointer({ keys: "[/MouseLeft]" })` without a target is delivered where the capture never sees it.
**Fix applied:** release on the same target, with `waitFor` for the React commit. Verified PASS.

### [P0 — FIXED] The documented press physics was not what shipped
Measured with transitions disabled: rest bottom 380.86 → pressed bottom **383.86**. Δ = **+3.00px**. DESIGN.md, `Motion.mdx` and all seven component pages assert "the object's lower boundary never moves." It moved. Cause: `min-block-size: 44px` pinned the border box against a natural height of 41.8px, so compressing the wall changed nothing and `translateY(3px)` pushed the whole key down. The play function asserted only the token arithmetic (3 + 1 = 4), which is exactly why it survived.
**Fix applied:** the pressed key now drops its `min-block-size` by the travel distance, so the box shrinks 44 → 41 as the cap descends 3. Re-measured: Δbottom **0.00**, Δtop +3, Δheight −3, 44px resting target preserved; under reduced motion all deltas 0. Added a Playwright assertion on the invariant, and documented in DESIGN.md that a container which centers its items contributes 1.5px of its own.

### [P1] Coral is spent on chrome; the Commitment Rule is broken by the site's own frame
Selected sidebar item `background: rgb(220,55,20)` with `color: rgb(255,255,255)`; all three toolbar globals `rgb(157,55,35)` on a 7% coral wash, permanently. `#dc3714` and `#9d3723` are not Keycaps tokens — Storybook derived them from `colorSecondary`. `#fff` violates The Warm Neutral Rule outright.
**Why it matters:** on every page the loudest coral belongs to wayfinding, while the one legitimate coral — a primary key — is buried in a canvas. The rule that opens the Color page is contradicted by the chrome the reader is looking at while reading it.
**Fix:** give the manager theme a non-coral wayfinding treatment (graphite/slate selection with a mint or fog marker), reserve coral for the preview, and add real `--kc-` tokens for what the manager needs so Storybook stops inventing colors.
**Suggested command:** `/impeccable polish`

### [P1 — FIXED] Every code block was a box inside an identical box
`preview.css` styled both `.sbdocs-content > pre` and the `.docblock-source` Storybook nests inside it: two concentric 10px corners 26px apart, on the site that publishes The Concentric Radius Rule, 128px of box around 61px of code at 1280 and **172px around 78px at 375 (55% dead space)** — the first thing on the landing page.
**Fix applied:** the outer `pre` drops its border, background, radius and margin when it contains a source block.

### [P1 — RESOLVED BY DECISION] Licensing
Assessment A flagged that `Consuming.mdx` asserted MIT while `PRODUCT.md` recorded licensing as undecided. It read the tree mid-flight. You decided MIT during the run; the manifests, three `LICENSE` files, the READMEs and `PRODUCT.md` now agree, and the docs table is generated from the manifests.

### [P2 — FIXED] Prose measure broke on the seven pages an adopter reads most
Foundations MDX prose 653px; every component Guidance page **901px (~110–129 characters per line)**. Cause: `.sbdocs-content > p` is direct-child only, and autodocs nests description blocks one level deeper.
**Fix applied:** added coverage for nested unclassed paragraphs and tightened to 58ch, since `ch` is the width of `0` and 68ch was still rendering ~97 characters. Re-measured at 487px / 46–65 characters.

### [P2 — FIXED] The space scale wasted ~74% of every row
`grid-template-columns: 5.5rem minmax(0, 1fr) 4rem` parked every value at the far right — **451–487px of gutter** between a bar and its own number, each value closer to the next row's than to its own.
**Fix applied:** `5.5rem auto 1fr` with the value start-aligned immediately after the bar.

### [P2] Mobile loses a global control and half the color page
Toolbar at 375px: `scrollWidth 497 / clientWidth 375` — the forced-colors control is off-screen behind scroll inside the bar; at 320px "System motion pre…" cuts mid-word. All five color tables hide 51–95px with no fade or hint, and the hidden column is **DARK**, on a page titled "Every color token, in both themes." Hex values wrap mid-value (`#f5f5` / `f3`).
**Fix:** collapse the toolbar into an overflow menu below ~600px; add a scroll-affordance gradient to `.kc-table-scroll`; `white-space: nowrap` on token chips; or stack light/dark per row at narrow widths.
**Suggested command:** `/impeccable adapt`

### [P3] Status is never a Badge, and renders in a typeface the system doesn't own
All seven component pages print `**Status: beta.**` as bold prose; the Release status matrix prints seven identical plain-text "Beta" cells. The four release statuses render **italic monospace**, inherited from Storybook's `dt` styling, on the page that defines the release vocabulary. The system ships a Badge with four tones built for exactly this.
**Suggested command:** `/impeccable typeset`

## Persona Red Flags

**Jordan (first-timer).** Lands on a page with no components on it. Takes the top recommendation — "Start here if you want to know what this looks like" — and reads three paragraphs about `main` landmarks and `h1` nesting before seeing anything. The landing page ends on GitHub Release tag matching with no next step. There is no "your first component in thirty seconds" moment anywhere.

**Sam (accessibility-dependent).** The component focus ring is exemplary — 3px coral at 3px offset, verified. But the documentation chrome ships the targets the system gates on: Copy **49×25**, canvas toolbar **28×28**, Show code **101×28** — against a contract of 44×44 with one documented 36px exception. Interaction status is an unlabeled coral square. The site is admirably honest that `stable` is blocked on the VoiceOver/Windows verification Sam represents, and never says how Sam could contribute it.

**Casey (distracted mobile).** At 375px the forced-colors control does not exist as far as Casey can tell. Color tables silently truncate the DARK column; hex values break across lines and are easy to mis-transcribe. The Motion PressLab's two panes stack, look identical at rest, and depend on press-and-hold — a gesture touch handles badly — so the page's entire lesson evaporates on the device Casey is holding.

**The outside developer evaluating adoption.** Now gets a real license answer. Still gets: no repository link, no issue tracker, no contribution path, no changelog, and no version stated anywhere except incidentally in a table caption. The question they actually have — *how likely is this to break under me?* — is unanswered. Release status explains what `beta` means but never who decides, on what cadence, or what happens to their code when it changes.

## Minor Observations

- `docs.toc` is not enabled anywhere. Color is 4803px with 51 rows and no in-page navigation.
- Four measures coexist on one Foundations page: content 901px, prose 653px, rule panels 768px, tables 100%. The rule panels are wider than the prose they qualify.
- `Rule` uses mint — "the system's yes" — for RULE and danger red for DON'T; the space-scale bars also use mint. Status tones are being spent on editorial furniture, which is the dilution the Tone Trio Rule exists to prevent.
- The Type page's labelled "DISPLAY" sample renders at 36px while the page's own unlabelled `h1` renders at 40px — the sample is smaller than the thing it samples.
- `sb-unstyled` is applied to `ComponentStatusMatrix` and `PackageLicenses` but not to `PackageExports` or `PeerRange`. Inconsistent.
- The Introduction has no "Next" link; Type, Depth and Release status all end with one.
- The `Small` story asserts `minBlockSize === "36px"`. No story asserts the 44px floor on `medium` — the number the accessibility contract actually turns on.
- The showcase footer pairs "Save settings" with a full secondary key labelled "Why this matters" — a help disclosure at near-equal weight to the commit, where `quiet` is the variant the system defines.
- The showcase lede promises "clear recovery language" and the composition contains no error, invalid, disabled or loading state.
- The site never states its own version.
- One redundant same-origin font request remains: Storybook's 400-weight Nunito Sans is fetched and activated alongside ours. Its declarations live in the manager template with no configuration hook. The comment in `main.ts` that claimed otherwise has been corrected.
- Storybook's own `PopoverProvider` emits an `ariaLabel` deprecation warning on story pages. Manager-internal, not Keycaps' Popover, which already labels its Dialog.

## Questions to Consider

1. If the press is the one expressive thing the system does, why is there nothing pressable on the landing page — and why is the first coral a reader ever sees a navigation highlight?
2. The physics sentence was written, quoted on eight pages, and never measured until now. What else in DESIGN.md is prose rather than a verified fact?
3. Coral is reserved for commitment everywhere except the two surfaces on screen 100% of the time. Is The Commitment Rule about components, or about the system? If the chrome is exempt, the rule should say so.
4. The system ships a Badge with four tones, and writes "beta" as bold prose on eight pages and plain table text on a ninth. What is the Badge for, if not this?
5. Every *table* reads its values from the running system so it cannot drift. Why do the *claims* — the sentences a reader acts on — get no equivalent treatment?
6. If Rules wear the mint that means "yes" and Don'ts wear the red that means "error," has the system spent its semantic palette on its own documentation furniture before a consuming app gets to use it?
7. The detector cannot read `.mdx`. Eight authored pages are mechanically unscanned. Does the prose surface need its own check, or is that what critique is for?
