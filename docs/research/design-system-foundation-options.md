# Design system foundation options for Keycaps

**Research date:** August 8, 2026  
**Scope:** A reusable React foundation and starter for future projects under `jflamb.com`, carrying forward the visual language now emerging in Assistant Workbench. This is not an attempt to preserve compatibility with every legacy repository or the deprecated MCP console.

## Recommendation

Build Keycaps as an owned design system on **React Aria Components**, with **CSS custom properties as the framework-neutral token layer**. Use **shadcn/ui's React Aria base as a starter and study its registry as an optional distribution mechanism**, but publish Keycaps components from this repository rather than copying ungoverned shadcn code independently into every app.

This separates the decisions that should remain Jaime's—brand, tokens, component APIs, content guidance, visual states, and release policy—from the interaction code that is expensive to get right. React Aria supplies accessible behavior, focus management, keyboard and touch interaction, internationalization, and state hooks without imposing a visual design. Its official guidance explicitly positions it as an unstyled base for an application or design system; it works with vanilla CSS, Tailwind, and CSS-in-JS, and lets a team drop from components to lower-level hooks when necessary. ([React Aria getting started](https://react-spectrum.adobe.com/react-aria/getting-started.html), [Adobe repository](https://github.com/adobe/react-spectrum))

The practical starting stack should be:

1. `@jflamb/keycaps-tokens`: dependency-free CSS variables for color, typography, spacing, shape, shadow, motion, light/dark/high-contrast behavior, and the existing `jflamb-theme` preference contract.
2. `@jflamb/keycaps-react`: owned, styled React components built primarily on `react-aria-components`.
3. A Storybook documentation site with usage, content, accessibility, and do/don't guidance—not only prop tables.
4. An optional Keycaps shadcn-compatible registry for source-distributed patterns or app shells where local ownership is useful. shadcn/ui now supports React Aria as a first-class base (`--base aria`), so it can accelerate scaffolding without forcing Radix or Base UI underneath. ([shadcn React Aria announcement](https://ui.shadcn.com/docs/changelog/2026-07-react-aria), [shadcn registry base format](https://ui.shadcn.com/docs/registry/examples))

**Runner-up:** Base UI is an excellent alternative if a short implementation spike shows its compound-component and `render`-prop ergonomics fit Keycaps better. It is stable, well staffed, unstyled, and more granular than React Aria. React Aria wins narrowly because accessibility across interaction modes, internationalization, date/time controls, and its longer stable public history matter more for a design-system foundation than API fashion.

**Do not make Astryx the production foundation yet.** It is real, public, MIT-licensed, and unusually capable—but the externally consumable line is still beta and pre-1.0, requires React 19, has already shipped breaking changes, and deliberately accepts degraded overlay positioning on browsers that do not support CSS anchor positioning. Reassess it after a stable 1.0 and a public-site browser-support story that does not leave common browsers with misplaced menus, popovers, or tooltips.

## What Keycaps already has

Assistant Workbench's local `apps/web/public/ledger.css` is more than a loose palette. It already contains the beginnings of a sound token architecture:

- recognizable brand primitives: coral, mint, mustard, signal blue, graphite, Fraunces, and Nunito Sans;
- semantic aliases such as text, surface, border, action, focus, and status tokens;
- component-level shape and behavior cues such as key and plate radii, a key edge, press duration, and plate shadow;
- light, dark, explicit theme-preference, and forced-color considerations;
- accessibility intent documented next to the mustard contrast correction and focus-ring tokens.

That layer should be normalized and promoted, not replaced by another system's palette. The missing maturity is mostly component behavior, API consistency, documentation, testing, packaging, versioning, and governance. An unstyled behavior foundation therefore fits Keycaps better than adopting a second visual identity and overriding it.

## Decision matrix

| Option | Status and ownership as of Aug. 8, 2026 | Accessibility and styling | Portability and composition | Keycaps fit |
| --- | --- | --- | --- | --- |
| **React Aria Components** | Adobe-owned open source; Apache-2.0; stable `1.x`, with `1.20.0` released July 31, 2026. The component package reached `1.0.0` in December 2023. ([latest release](https://github.com/adobe/react-spectrum/releases/tag/react-aria-components%401.20.0), [license](https://github.com/adobe/react-spectrum/blob/main/LICENSE)) | Unstyled. Adobe says it is tested across devices, interaction modes, and assistive technologies. Includes accessibility, internationalization, interactions, and behavior; exposes classes/data attributes and lower-level hooks. ([getting started](https://react-spectrum.adobe.com/react-aria/getting-started.html)) | React 16.8–19 peer range. SSR has longstanding support; React 18+ works without the older `SSRProvider`, and official guidance covers Next.js, Remix, and Gatsby. ([SSR guide](https://react-spectrum.adobe.com/v3/ssr.html), [npm package](https://www.npmjs.com/package/react-aria-components)) | **Best foundation.** Mature behavior without a competing look. Strongest choice where accessibility and internationalization are non-negotiable. Keycaps must still own all visual styles, component wrappers, and conformance testing. |
| **Base UI** | MUI-owned open source; MIT; stable since `1.0.0` on Dec. 11, 2025; `1.7.0` released Aug. 4, 2026. The named team includes veterans of Radix, Floating UI, Material UI, and Fluent UI. ([releases](https://base-ui.com/react/overview/releases), [team and support](https://base-ui.com/react/overview/about), [v1.7.0](https://github.com/mui/base-ui/releases/tag/v1.7.0)) | Fully unstyled, no bundled CSS, WAI-ARIA-oriented, and tested across browsers, devices, and screen readers. Open access to each part; consumer supplies focus appearance, contrast, and labels. ([about](https://base-ui.com/react/overview/about), [accessibility](https://base-ui.com/react/overview/accessibility)) | React 17+; tree-shakeable single package; supports CSS, Tailwind, CSS Modules, and CSS-in-JS. Compound parts and `render` make composition very direct. Browser policy is Baseline Widely Available at the last major release. ([quick start](https://base-ui.com/react/overview/quick-start), [composition](https://base-ui.com/react/handbook/composition)) | **Close second.** Particularly attractive for granular component anatomy and popup behavior. Newer stable history and a smaller component breadth than React Aria are the only meaningful cautions. |
| **Radix Primitives** | WorkOS/Radix open source; MIT; public since 2020; actively maintained, with July 2026 releases and current unified package updates. ([release notes](https://www.radix-ui.com/primitives/docs/overview/releases), [license](https://github.com/radix-ui/primitives/blob/main/LICENSE)) | Unstyled primitives following WAI-ARIA patterns; tested with modern browsers and common assistive technology. Handles ARIA, focus, and keyboard navigation while exposing every part and state data attributes. ([accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility), [styling](https://www.radix-ui.com/primitives/docs/guides/styling)) | React 16.8–19; tree-shakeable unified or per-primitive packages; server rendering works with Next.js, Remix, and Gatsby, with best SSR behavior on React 18+. ([introduction](https://www.radix-ui.com/primitives/docs/overview/introduction), [SSR](https://www.radix-ui.com/primitives/docs/guides/server-side-rendering)) | **Safe but no longer first choice for greenfield Keycaps.** Very mature for overlays and common primitives, but React Aria and Base UI now cover more complex controls and newer needs without assembling as many gaps. |
| **shadcn/ui** | Vercel-led open source; MIT; highly active. It is explicitly a code-distribution platform, not an installed component library. It supports Base UI, React Aria, and Radix bases. ([introduction](https://ui.shadcn.com/docs), [React Aria base](https://ui.shadcn.com/docs/changelog/2026-07-react-aria), [license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)) | Styled source code with accessible primitive dependencies and editable APIs. The owner gets complete control, but also owns upstream merges, local divergences, and verification after changes. | Supports modern React starters including Next.js, Vite, and TanStack Start. Its registry can distribute components and a complete design-system base. ([create announcement](https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create), [registry base](https://ui.shadcn.com/docs/registry/examples)) | **Use as a starter/distribution pattern, not the foundation.** It is a fast way to scaffold React Aria-backed components and a useful model for a Keycaps registry. Copying its default components separately into every app would fragment Keycaps governance. |
| **Astryx** | Official public `facebook/astryx` repository; MIT; npm packages under the `@astryxdesign` scope; explicitly **beta** and currently `0.3.0`. The public package first appeared in June 2026 and releases have been rapid. ([repository and package setup](https://github.com/facebook/astryx), [releases](https://github.com/facebook/astryx/releases), [npm package](https://www.npmjs.com/package/@astryxdesign/core)) | 160+ styled, typed components; CSS-variable themes, dark mode, direct class overrides, exported internals, and source ejection (“swizzle”). Astryx describes the components as accessible, but the public project's conformance history is much shorter than React Aria's or Radix's. ([architecture](https://astryx.atmeta.com/blog/how-astryx-works), [tokens](https://astryx.atmeta.com/docs/tokens)) | React 19+ only. Prebuilt CSS works with Next.js, Vite, Tailwind, StyleX, and CDN use. Modern CSS keeps dependencies small, but full-fidelity overlays require CSS anchor positioning; its own Tier 2 says menus, popovers, and tooltips may not be positioned next to their triggers. ([core setup](https://github.com/facebook/astryx/blob/main/packages/core/README.md), [browser support](https://astryx.atmeta.com/docs/browser-support)) | **Promising reference, premature dependency.** It solves more of a whole product UI than Keycaps needs, while introducing a second visual system, beta churn, React 19 lock-in, and a public-browser risk. Borrow its CLI, theme-builder, codemod, template, and swizzle ideas. |
| **Material UI** | MUI-owned; MIT; more than a decade old; stable `9.x` and comprehensive. ([Material UI](https://mui.com/material-ui/), [releases](https://github.com/mui/material-ui/releases)) | Production-ready styled implementation of Material Design. Powerful theme variables and global component overrides, but the theme's component override block is not tree-shakeable and substantial rebranding works against built-in visual assumptions. ([theming](https://mui.com/material-ui/customization/theming/), [component theming](https://mui.com/material-ui/customization/theme-components/)) | Broad React/SSR ecosystem, but uses a styling runtime by default and exposes MUI-specific styling APIs throughout consumer code. | **Not recommended.** Excellent app library; wrong foundation for a distinctive Keycaps visual language. Base UI gives access to MUI's headless investment without Material's visual and API surface. |
| **Chakra UI** | Chakra-led open source; MIT; mature `3.x` and actively maintained. ([repository](https://github.com/chakra-ui/chakra-ui), [components](https://chakra-ui.com/docs/components/concepts/overview)) | Accessible, styled components with a token/recipe system based on Panda CSS concepts, currently rendered through Emotion at runtime. ([theming](https://chakra-ui.com/docs/theming/overview), [installation and styling roadmap](https://chakra-ui.com/docs/get-started/installation)) | React 18+; Next.js and Vite support. The current Next.js guide documents a Turbopack/Emotion hydration problem requiring Webpack and `suppressHydrationWarning` for theme handling. ([Next.js guide](https://chakra-ui.com/docs/get-started/frameworks/next-app)) | **Not recommended for the foundation.** Productive for individual apps, but more styling-engine and provider coupling than Keycaps needs, with less control than a headless base. |

## Astryx: direct answer

### Is it publicly consumable?

Yes. The repository is public under the `facebook` GitHub organization, the code is MIT-licensed, and installable packages are published to npm as `@astryxdesign/core`, `@astryxdesign/cli`, and theme packages. The core README documents Next.js, Tailwind, StyleX, Vite, and CDN paths. Meta-affiliated maintainers are listed on npm, although the registry namespace is `@astryxdesign`, not `@meta` or `@facebook`. ([Astryx repository](https://github.com/facebook/astryx), [core package](https://www.npmjs.com/package/@astryxdesign/core), [core setup](https://github.com/facebook/astryx/blob/main/packages/core/README.md))

### Is it mature?

It has two different kinds of maturity:

- **Internally mature:** Astryx says the system grew inside Meta for eight years, powers more than 13,000 apps, and includes more than 160 components, patterns, theming, templates, a CLI, and upgrade tooling. That is unusually strong product-design experience. ([official overview](https://github.com/facebook/astryx), [how it works](https://astryx.atmeta.com/blog/how-astryx-works))
- **Externally immature:** the public npm history began in June 2026; the official status remains beta; the current version is `0.3.0`; and the release notes label breaking changes in pre-1.0 releases. One July release also had to correct a published production-build defect involving `jsxDEV`, which is understandable during beta but meaningful evidence that the external packaging path is still settling. ([release history](https://github.com/facebook/astryx/releases))

Internal scale does not automatically prove the stability of the newly extracted npm APIs, build artifacts, external issue process, or upgrade path. For a system meant to become the common dependency of many future sites, the external contract is the one that matters.

### Is it a good fit for Keycaps?

Not as the foundation today. Its strengths overlap with what Keycaps should own: theme semantics, visual variants, component styling, and application patterns. Adopting it would make Keycaps a branded Astryx theme plus wrappers, rather than a small owned system with a replaceable behavior dependency.

The browser policy is the sharper objection. Astryx's full-fidelity tier currently names Safari 26+ and Firefox 147+ because overlay positioning uses CSS anchor positioning. Tier 2 remains “functional,” but the docs explicitly say affected overlays may not be positioned beside their triggers. That trade can be sensible for Meta's evergreen internal tools. It is a weak default for public `jflamb.com` products where Jaime will not control users' browser versions. ([Astryx browser support](https://astryx.atmeta.com/docs/browser-support))

A small Astryx experiment is still worthwhile after Keycaps has a representative Button, Field, Select, Dialog, Popover, Table, and navigation pattern. Reassess against four gates:

1. Astryx reaches stable `1.0` with a documented compatibility policy.
2. Keycaps' required browser matrix gets full-fidelity overlay behavior or Astryx ships a maintained fallback.
3. A production-like spike passes keyboard, screen-reader, forced-colors, zoom/reflow, hydration, and bundle checks.
4. The theme API can reproduce the keycap edge/press behavior and semantic status system without pervasive component overrides or swizzling.

## Suggested first milestone

Do not begin by porting every Assistant Workbench selector. Build a thin vertical slice that tests the foundation decision:

- normalize primitive and semantic tokens from `ledger.css`;
- implement Button, Link, IconButton, Field/TextField, Checkbox, Select/ComboBox, Dialog, Popover, Banner, Badge, Card, and Stack;
- add light, dark, forced-colors, reduced-motion, 200% text zoom, and 400% reflow stories;
- test keyboard paths and accessible names with React Testing Library, axe-core, and browser tests; then do manual VoiceOver/Safari and at least one Windows screen-reader/browser pass before calling a component stable;
- build one realistic starter page in both Next.js and Vite to prove SSR/hydration, package exports, CSS ordering, and consumer ergonomics;
- record component status (`experimental`, `beta`, `stable`, `deprecated`) and use semantic versioning from the first published package.

The goal of this milestone is not coverage. It is proof that Keycaps' owned token and component APIs remain coherent while React Aria handles the hard interaction layer. If React Aria feels constraining in that slice, repeat Select, Dialog, and Popover with Base UI before the public API hardens.

## Bottom line

**React Aria Components + owned Keycaps CSS and React wrappers is the strongest long-term foundation.** It preserves the distinctive Assistant Workbench styling, provides the deepest accessibility and internationalization base among the unstyled options, and keeps behavior replaceable behind Keycaps' own public API. Use shadcn/ui's new React Aria starter and registry ideas to move faster. Keep Base UI as the deliberate fallback. Treat Astryx as an excellent source of design-system tooling ideas and a future re-evaluation candidate, not the dependency on which to standardize `jflamb.com` in its current beta phase.
