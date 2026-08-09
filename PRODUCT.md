# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: Jaime Lamb, building and maintaining React projects under `jflamb.com`. The situation is starting a new app or retrofitting an existing one and needing accessible, themed, production-ready UI without re-deriving primitives per project. The job is consuming `@jflamb/keycaps-tokens` and `@jflamb/keycaps-react` and reading Storybook for API and interaction guidance.

Anticipated secondary audience: developers outside jflamb. They are not a current audience, but decisions should avoid foreclosing external adoption — API surface, documentation, and licensing should stay adoption-ready rather than assuming an informed insider.

## Product Purpose

Keycaps is the owned visual and interaction foundation for jflamb React projects. It exists so that visual language, accessibility behavior, and theming are defined once and consumed everywhere, instead of being re-derived per app and drifting.

Success is every jflamb app — current apps retrofitted onto it, and future apps starting from it — building on Keycaps rather than its own primitives.

## Positioning

Keycaps owns its CSS tokens, styling, React wrapper APIs, documentation, and release policy, and borrows only accessible interaction behavior from React Aria Components. Two consequences a neighboring approach could not truthfully claim:

- The public API is owned, so it can outlive the behavior dependency. React Aria can be replaced without a consumer-visible API break.
- Tokens are framework-neutral CSS custom properties in a separate package, so non-React consumers use the visual system without pulling in React styles.

## Operating Context

- pnpm monorepo, Node >= 22, three layers: `packages/tokens` (framework-neutral), `packages/react` (owned components on React Aria), `apps/storybook` (documentation and interaction examples).
- Storybook is the documentation site and deploys to GitHub Pages after main CI passes. VitePress was deliberately rejected; a separate standards site is reconsidered only when Storybook navigation becomes the constraint.
- The two public packages publish only from a GitHub Release whose tag matches their shared version.
- `pnpm check` is the complete local gate: typecheck, unit tests, build, Pages build, package-consumption test, Playwright e2e, and a high-severity audit.
- Retrofitting existing jflamb apps is a committed workflow, not a hypothetical. The opt-in `@jflamb/keycaps-tokens/legacy.css` export carries unprefixed jflamb aliases to support that migration; new projects should not use them.

## Capabilities and Constraints

- Components: Button, Field, Select, Popover, Banner, Badge, Card — all currently `beta`.
- Component contract: semantic tokens rather than raw colors; React Aria behavior where a matching primitive exists; visible focus indicator and 44×44 CSS-pixel minimum target where practical; support for system, explicit light, explicit dark, reduced-motion, and forced-color preferences; reflow without horizontal scrolling at 320 CSS pixels; no third-party runtime requests; API guidance, representative states, unit tests, an axe check, and browser interaction proof.
- Theme contract: follows the system color scheme by default; `data-theme="light"` or `data-theme="dark"` on the root element for an explicit choice. Keycaps defines only the CSS contract and does not write cookies or local storage. Apps may retain the existing `jflamb-theme` preference key.
- Motion contract: the system `prefers-reduced-motion` preference is authoritative; `data-kc-motion="reduce"` or `"full"` on the root element is the explicit override, mirroring `data-theme`. Every value the substitution touches is a token, so the tokens package owns the whole switch and component CSS carries no reduced-motion branch. See the Motion Contract rule in `DESIGN.md`.
- Token naming: canonical tokens use the `--kc-` prefix. Unprefixed jflamb aliases exist only through the opt-in legacy export.
- Release statuses: `experimental`, `beta`, `stable`, `deprecated`. A component reaches `stable` only after API review, automated interaction and accessibility checks, responsive and forced-color verification, and manual assistive-technology coverage documented in the release record.
- API policy: prefer small owned props over re-exporting primitive parts. Breaking API changes require a major version after the first public release.
- Peer range: React >= 18.2 < 20.
- Astryx is a future evaluation candidate, not a dependency. The deprecated MCP console is out of scope.
- Licensing: **MIT**, decided 2026-08-08. `@jflamb/keycaps-react` declares `MIT`; `@jflamb/keycaps-tokens` declares `MIT AND OFL-1.1` because it redistributes Piazzolla, Sofia Sans and Lilex WOFF2 binaries under the SIL Open Font License 1.1, which MIT cannot cover. The OFL texts ship beside the binaries in `dist/fonts/`, and neither face declares a Reserved Font Name. The runtime dependency tree is permissive throughout — Apache-2.0 for React Aria, MIT and 0BSD for the rest — so nothing forced the choice. This removes the last blocker on external adoption readiness.

## Brand Commitments

- Name: Keycaps. Package scope: `@jflamb`.
- Canonical token prefix `--kc-`.
- The `jflamb-theme` preference key contract in existing apps must keep working.
- Fonts ship as local WOFF2 assets; no third-party font requests at runtime.

## Evidence on Hand

- `docs/decisions/0001-foundation.md` — accepted ADR covering ownership, package separation, naming, and the accessibility baseline.
- `docs/component-status.md` — per-component status and automated coverage.
- `docs/contributing/components.md` — the component contract and release-status definitions.
- `docs/research/design-system-foundation-options.md` — foundation research behind the ADR.
- `DESIGN.md` — the visual specification, and the authority for palette, type, motion, depth, and the named rules.
- The `app-auth` design directory — the historical origin of the visual language. **Superseded:** Keycaps is now the visual authority. `README.md` and ADR 0001 previously framed it as the canonical visual source; both were corrected on 2026-08-08 to record it as origin rather than current authority.
- Assistant Workbench — a representative consumer, never a second source of truth.

Local filesystem paths are deliberately omitted here: this repository is public, and the two projects above are private and not resolvable by a reader.

Absences future work must not fabricate: there are no external users, no adoption metrics, no testimonials, no case studies, no benchmarks, and no published stable release. No component has reached `stable`.

## Product Principles

1. **Own the API, borrow the behavior.** Public surface stays owned so a behavior dependency can be swapped without breaking consumers.
2. **Tokens before components, framework-neutral before React-specific.** Anything expressible as a CSS custom property belongs in the tokens layer.
3. **Accessibility is a release gate, not a feature.** The documented baseline is what `beta` means; manual AT verification is what `stable` costs.
4. **Retrofit is a first-class path.** Existing jflamb apps must be able to migrate incrementally, not only greenfield apps.
5. **Nothing from a third party at runtime.** Fonts, styles, and behavior ship with the packages.

## Accessibility & Inclusion

Automated baseline: accessible names, keyboard operation, axe checks, light and dark themes, reduced motion, forced colors, reflow at 320 CSS pixels, and package consumption — verified across Chromium in the browser matrix.

`stable` additionally requires documented manual VoiceOver/Safari and Windows screen-reader/browser verification.

Content requirements: direct labels describing the action or data requested; error messages stating what happened and what to do next; never color alone to convey status.
