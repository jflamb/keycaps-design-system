# ADR 0001: Owned Keycaps foundation on React Aria Components

- Status: Accepted
- Date: 2026-08-08

## Decision

Keycaps owns its CSS tokens, styling, React wrapper APIs, documentation, and release policy. Accessible interaction behavior is built on React Aria Components.

Packages are separated so framework-neutral tokens can be consumed without React. React components depend on tokens only through documented CSS custom properties. Storybook is the reference documentation and interaction-example surface.

## Sources

- Visual source at the time of this decision: the `app-auth` design directory.
- Representative usage at the time of this decision: the Assistant Workbench web app.
- Foundation research: `docs/research/design-system-foundation-options.md`.

Both source references are historical. Keycaps became the visual authority once
`DESIGN.md` existed, so neither is a source to check current behavior against.
This note records that shift rather than rewriting the decision.

## Consequences

- Keycaps APIs remain owned and can outlive a behavior dependency.
- React Aria supplies keyboard, focus, touch, and internationalized interaction patterns without imposing a visual system.
- CSS custom properties support React and non-React projects.
- Local WOFF2 assets prevent third-party font requests at runtime.
- Explicit `data-theme` selectors preserve the existing jflamb theme-preference contract.
- Astryx is a future evaluation candidate, not a dependency.
- The deprecated MCP console does not influence package or component design.

## Naming and compatibility

Canonical tokens use the `--kc-` prefix. Existing unprefixed jflamb aliases are available through the opt-in `@jflamb/keycaps-tokens/legacy.css` export; new projects should not use them.

## Accessibility baseline

The automated baseline covers accessible names, keyboard operation, axe checks, light and dark themes, reduced motion, forced colors, reflow at 320 CSS pixels, and package consumption. Stable status additionally requires manual VoiceOver/Safari and Windows screen-reader/browser verification.
