# AppShell draft design QA

- Scope: `AssistantWorkbenchSidebarDraft` and `RetirementDashboardSidebarDraft`
- References: the current Assistant Workbench and retirement-dashboard desktop and mobile captures in `app-shell-audit/`
- Implementations: matching desktop and 390 x 844 compact captures in `app-shell-drafts/`
- Comparison method: each reference and implementation was combined side by side at the same viewport and reviewed as one image.

## Comparison history

1. The first pass confirmed that the retirement dashboard's left-rail hierarchy transferred cleanly, and that both existing compact horizontal navigations clipped destinations.
2. The first draft rail was visibly wider than the retirement reference. It was narrowed to an intrinsic 13 to 14 rem measure.
3. The header pass restored the Workbench protection status and the retirement sign-out action, then verified wrapping at 390 px.
4. The final pass found no cropped content, unintended horizontal scrolling, misleading positional decoration, broken typography, spacing, border, or radius defects.
5. The persistent desktop rail was tightened to 36 px per destination, matching the retirement-dashboard precedent, while the mobile drawer retained the 44 px control floor.

## Interaction and accessibility checks

- Desktop and compact navigation update `aria-current` and the visible page state.
- The compact `Sections` control opens a named start-side dialog containing every destination.
- Persistent desktop rail destinations measure 36 px; the same destinations measure 44 px in the compact drawer.
- Choosing a drawer destination closes the dialog and updates the page heading.
- Workbench `Review approvals` and retirement `Open plan` update the visible story state.
- Both stories retain working theme controls, skip navigation, real header utilities, and realistic status data.
- Browser console review found no warnings or errors on the final stories.
- TypeScript, Storybook production build, package/unit tests, Pages verification, consumer build, and all 47 Playwright tests passed.
- The high-severity audit gate passed. The separate low-severity readback is a dev-only Windows esbuild development-server advisory; this preview runs on macOS and does not change the shipped package runtime.

final result: passed

---

# Layered Plate comparison design QA

- Scope: `AppShellComparison`, `CardGridComparison`, and `PageHeaderComparison`
- Reference: Wispr Flow home-page capture at `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/wispr-flow-reference.png`
- Implementations: the Layered Plate comparison stories in `apps/storybook/src/foundations/LayeredPlate.stories.tsx` and their story-scoped CSS in `apps/storybook/src/foundations/layered-plate.css`
- Comparison input: `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/reference-implementation-board.png`
- Viewports: 1600 x 900 for the side-by-side desktop comparison and 1000 x 500 for focused stacked-treatment review, both at 1x density
- States: light, dark, simulated forced colors, and explicit reduced motion
- Interpretation boundary: this is a conceptual translation of the reference's tonal layering, isolated rotation, and calm motion into existing Keycaps components and tokens; it is not a visual clone of Wispr Flow.

## Comparison history

1. Source review identified four portable visual truths: nested tonal plates, selective high-contrast regions, borders reserved for meaningful edges, and sparse rotation or settle motion.
2. The first implementation kept all proposal styling inside the Storybook fixture and reused the shipped `AppShell`, `Card`, `PageHeader`, `Badge`, `Banner`, and `Button` APIs.
3. Focused light-theme review confirmed that the AppShell reads as nested regions, the card grid exposes a three-step surface ladder, and the PageHeader creates a deliberate chapter break without changing content structure.
4. Wide 1600 x 900 review confirmed equal-width current and proposal panels, no document overflow, and no AppShell overflow in either treatment.
5. Dark-theme review confirmed that the contrast surface self-inverts to a light plate with dark text while the surrounding Keycaps canvas remains dark.
6. Simulated forced-colors review confirmed that tonal distinctions collapse to system colors and structural borders return around the proposal treatment, viewport, shell regions, cards, and PageHeader surface.
7. Reduced-motion review found a residual browser-minimum duration when the custom duration was set to zero. The final CSS removes the settle animation entirely under the system or explicit Keycaps reduced-motion contract while retaining static editorial tilt.

## Accessibility and behavior checks

- All three stories render both named treatments and their play assertions complete without browser errors.
- The 12-story-state matrix reported no horizontal document overflow at 1000 CSS px.
- The AppShell desktop comparison reported no shell-level horizontal overflow at 1600 CSS px.
- Muted text on the proposal's high-contrast surface measures 6.30:1 in light theme and 5.89:1 in dark theme across all three screens.
- Simulated forced colors resolves the proposal surface to `Canvas`, text to `CanvasText`, and restores 1 px structural borders.
- Explicit reduced motion resolves `animation-name` to `none` for the AppShell header, all proposal cards, and the PageHeader surface.
- The story preview produced no errors. Storybook's manager emitted its existing Storybook 11 `PopoverProvider` deprecation warning; it is outside the comparison fixture.

## Browser annotation correction

- The selected `Settled motion` heading inherited `.kc-card__title`'s default text token instead of the contrast card's foreground token, making the title effectively invisible in both color themes.
- The fixture now explicitly maps the contrast card title to `--kc-layered-on-contrast`; descriptive and note text retain the quieter on-contrast-muted token.
- The title now measures 10.40:1 in light theme, 13.87:1 in dark theme, and 21:1 in simulated forced colors.
- Reduced motion still resolves the card animation to `none`, and none of the four checked states introduces horizontal overflow.
- Corrected capture: `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/card-grid-settled-motion-fixed.png`

## AppShell divider preference correction

- The Layered Plate AppShell now retains the baseline's simple dividers between the header and body and between the sidebar and main content.
- The shell is again one composed container with zero inter-region gaps; tonal fills and the strong PageHeader surface remain available for hierarchy inside the content region.
- Light, dark, simulated forced-colors, and reduced-motion states preserve 1 px structural dividers without shell or document overflow.
- At the compact breakpoint, the sidebar's end divider correctly becomes a bottom divider before the main content.
- Corrected capture: `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/app-shell-layered-dividers-light.png`

## AppShell coherence polish

- The proposal's `Review` and `Open comparison` button labels now use the 16 px body size instead of the 12 px small-button label, and the controls retain a 44 px minimum target height.
- The content card now uses a 20 px stack gap, 12 px title-to-description spacing, and 12 px body spacing, producing a steadier vertical rhythm without changing the shipped `Card` component.
- Workspace counts now read as compact keycaps: 28 x 24 px, 6 px radius, tabular numerals, raised surface, and state-aware text. The active count measures 5.95:1 in light, 8.85:1 in dark, and 21:1 in simulated forced colors.
- The proposal `PageHeader`, banner, and content card now share the 18 px plate radius.
- Utility navigation and the workspace switcher now use scoped segmented-control tracks with 1 px meaningful edges, zero item gaps, and an inset active segment. Compact layouts retain the sidebar-to-main bottom divider.
- Light, dark, simulated forced-colors, reduced-motion, 700 px compact, and 390 px mobile checks found no document or shell overflow. Reduced motion still resolves the PageHeader animation to `none`.
- Corrected captures: `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/app-shell-polish-pass-light.png`, `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/app-shell-polish-pass-dark.png`, and `/Users/jaime/Documents/Codex/2026-08-16/product-design-advisor/work/keycaps-layered-plate/app-shell-polish-pass-mobile.png`.

## AppShell inset selector correction

- In this intermediate pass, the utility and workspace tracks moved from a flat tonal fill to shallow control wells. Later annotation corrections below simplify both tracks to one transparent inset outline.
- The active item now uses the raised surface, a 1 px face edge, a 3 px accent wall, a 1 px upward offset, and a soft downward shadow. This adapts the Keycaps button's face-and-wall dimensionality without changing the shipped `AppShell` API.
- `Overview`, `Activity`, `Inbox`, `Decisions`, and `Sources` now use the 16 px body size and label line height in the proposal. The utility links remain 44 px high; the compact workspace links remain 36 px high and exceed WCAG 2.5.8's 24 px minimum target size.
- Active selector text measures 5.95:1 in light, 8.85:1 in dark, and 21:1 in simulated forced colors. Simulated forced colors removes shadows and preserves selection with `ButtonText` borders and a 3 px bottom edge.
- Reduced motion collapses the selector transitions to the browser's effective zero duration. The selector remains static and legible without relying on motion.
- Checks at 1000 x 700 and 390 x 844 found no horizontal overflow. At the compact breakpoint the sidebar's right divider still becomes the required bottom divider.

## PageHeader parent-surface correction

- All proposal buttons now use the 16 px body size and retain 44 px minimum targets. The baseline treatment remains unchanged so the comparison still represents current Keycaps accurately.
- The PageHeader proposal treatment now uses the same raised white parent surface as the current light-theme treatment instead of the gray Layered Plate canvas. Dark theme maps the same semantic surface to its native raised dark value.
- The intermediate viewport container no longer renders as a rounded plate. It has no side or bottom border, no radius, and no separate fill; one 1 px top divider now separates the treatment's introductory content from the PageHeader child surface.
- The child PageHeader keeps its 18 px contrast surface and the follow-up content remains in normal parent flow with 20 px separation. Simulated forced colors preserves the same relationship with one `ButtonText` divider.
- Light, dark, simulated forced-colors, reduced-motion, and 390 px checks found no horizontal overflow. Reduced motion still resolves the PageHeader animation to `none`.

## AppShell navigation containment and selector motion

- The Layered Plate sidebar now reserves an 11 rem rail and constrains every workspace row with border-box sizing, 8 px inline padding, and explicit minimum/maximum inline sizes. `Inbox`, `Decisions`, and `Sources` each remain 5 px inside both edges of the selector track at 1000 px and 390 px.
- The utility navigation is now stateful: activating `Overview` or `Activity` updates both `aria-current="page"` and the track's active-item state.
- One shared raised selector face travels between the two destinations over 210 ms using `cubic-bezier(0.16, 1, 0.3, 1)`. The labels stay stationary, so the motion explains selection continuity without moving text or layout.
- Explicit and system reduced-motion states remove the selector transition entirely; selection state still changes without animation. Simulated forced colors removes the shadow and preserves the moving face with `ButtonText` edges.
- Light, dark, simulated forced-colors, reduced-motion, 1000 px, and 390 px checks reported no document overflow and no workspace-row overflow.

## AppShell utility selector simplification

- The utility selector track is now transparent and exactly 44 px high, matching the selected face rather than wrapping it in a larger filled well.
- The track has no padding or layout border. A single 1 px inset divider defines its perimeter, while the opaque 44 px selected face covers the line beneath its active half.
- The selected face still travels between `Overview` and `Activity` over 210 ms, updates `aria-current="page"`, and retains the established raised-face edge. Explicit reduced motion removes the transition without changing selection state.
- Dark theme preserves the transparent track with the semantic divider token. Simulated forced colors maps the inset line to `ButtonText` and the selected face to `ButtonFace`.
- Checks at 1000 x 700 and 390 x 844 reported no document or AppShell overflow. The workspace selector was aligned in the subsequent correction below.

## AppShell workspace and spacing alignment

- The workspace control now uses the same visual grammar and dimensions as the utility selector: a transparent track, one 1 px inset outline, 44 px rows, 12 px inline padding, and a 44 px raised selection face that covers the track line beneath the active row.
- `Inbox`, `Decisions`, and `Sources` are stateful in the fixture. Activating a row updates `aria-current="page"` and moves one shared face over 210 ms; reduced motion removes that transition.
- Counts use transparent borders and quiet tonal fills rather than nested raised keys. Inactive counts use a 6% neutral mix; the selected count borrows the face's accent-edge color at 12% opacity. Their light-theme text contrast measures 4.91:1 and 5.44:1 respectively.
- The PageHeader, success banner, and content card now use the same 20 px internal padding. The previous 20 px, 12 x 16 px, and 24 px values had no content-driven rationale.
- Light, dark, simulated forced-colors, reduced-motion, 1093 px, and 390 px checks reported no row, document, or AppShell overflow. Simulated forced colors preserves both selector tracks with `ButtonText` inset outlines and `ButtonFace` selected faces.

## Card-grid boundary simplification

- The Layered Plate card grid no longer sits inside a rounded interstitial plate. Its viewport is transparent, square-edged, and defined only by a 1 px top divider between the treatment description and the child cards.
- The proposal treatment now uses the raised surface token, producing a white parent in light mode and the corresponding semantic raised surface in dark mode.
- The cards now align directly with the parent content and begin 20 px below the divider. Their surface ladder is explicit in context: the minimal card is a 4% tonal shift from the parent, the raised-contrast card uses an 8% tonal shift, and the strong card retains its full contrast surface. No proposal card carries a drop shadow, so tone is the only depth rule. The 16 px gaps, editorial tilt, and settle motion remain unchanged.
- Dark theme maps the divider to the dark semantic divider token. Simulated and native forced colors collapse the minimal tone and raised surface to `Canvas`, retain a `ButtonText` boundary around each card, and remove elevation. Reduced motion still resolves all three card animations to `none`.
- Checks at 1093 x 863 and 390 x 844 reported no document or treatment overflow. The compact layout still collapses to one card column.

## PageHeader secondary-action edge correction

- The Layered Plate `View evidence` action now retains the shared secondary Button's 4 px neutral bottom edge while keeping its full perimeter border transparent against the contrast header.
- The primary and secondary actions now share the same seated-key geometry without implying that both actions have the same commitment level: coral remains exclusive to the primary action, while the secondary edge uses the semantic border token.
- Forced colors continues to restore a `ButtonText` boundary, and the existing press interaction compresses both controls from the 4 px edge to the 1 px pressed edge.

## Verification

- `pnpm --filter @jflamb/keycaps-storybook typecheck` passed.
- `pnpm --filter @jflamb/keycaps-storybook build` passed. Vite retained its existing large-chunk advisory; the build completed and generated only the local Storybook artifact.
- `git diff --check` passed.
- `pnpm review:changed` was not applicable to the uncommitted work because the repository command requires explicit base and head commits.

## Shipping design-system propagation

- The accepted surface ladder now ships from `@jflamb/keycaps-tokens` as `surface-minimal`, `surface-tonal`, `surface-contrast`, and the matching inverse text roles. The 210 ms settle duration, easing, offset, and rotation are also token contracts, including zeroed reduced-motion values and forced-color mappings.
- `Card` now owns `surface="raised|minimal|tonal|contrast"`. The default preserves the existing bordered, shadowed plate; tonal surfaces remove both perimeter border and shadow, and contrast owns its inverse title and description colors.
- `PageHeader` now owns `surface="plain|tonal|contrast"`. `tonal` is the normal Layered Plate opening and `contrast` is explicitly documented as a rare chapter break. The inverse treatment preserves the secondary key's neutral 4 px bottom edge.
- `AppShellNav` and `AppShellNavGroup` now own `treatment="selector"`. They derive one raised indicator's size and position from their direct children and `isCurrent`, animate the face without moving labels, preserve 44 px rows, and provide quiet state-aware count chips without colored outlines.
- Every Button size now uses the 16 px body size with Label weight. The 36 px small-target exception is retained with tighter block padding rather than Micro text.
- The Layered Plate comparison now consumes these shipped capabilities. Its private CSS is limited to comparison layout, structural dividers, the deliberately editorial tilt, and the example settle entrance.
- Shipping verification passed: token tests (16), React tests (103), workspace and Node 16 type checks, token and React builds, Storybook production build, and the external consumer build with its Mode 1 prerender proof.
- Browser verification of the shipped component stories confirmed 44 px selector rows, no row or document overflow at 320 px, 16 px labels, 210 ms selector motion, effective-zero reduced motion, neutral and coral 4 px button edges, no tonal-card shadows, and light-theme text contrast of 5.08:1 or better across the tonal and contrast card descriptions.
- No commit, push, release, deployment, or consumer application migration was performed.

final result: passed
