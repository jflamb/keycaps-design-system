# Keycaps Design System

Keycaps is the owned visual and interaction foundation for future React projects under `jflamb.com`.

It has three layers:

- `@jflamb/keycaps-tokens`: framework-neutral CSS custom properties, local fonts, themes, and base styles.
- `@jflamb/keycaps-react`: owned React components built on React Aria Components.
- `@jflamb/keycaps-storybook`: component guidance, interaction examples, and accessibility documentation.

Email is a generated projection of the token layer rather than another component
implementation. `@jflamb/keycaps-tokens/email-theme.json` provides flattened,
versioned values for constrained mail renderers, and the same artifact is
published with Storybook for installed runtimes that need automatic refresh.

Keycaps is the visual authority for the projects that consume it. [DESIGN.md](DESIGN.md) is the specification — palette and its semantic reservations, the type pairing, press physics, and the named rules components are held to. The visual language originated in the `app-auth` design directory, but that is history rather than a source to check against.

Consuming projects are consumers, never second sources of truth. Astryx is not a runtime dependency, and the deprecated MCP console is out of scope.

## Start locally

```sh
pnpm install
pnpm dev
```

Run the complete local gate with:

```sh
pnpm check
```

## Consume

```tsx
import "@jflamb/keycaps-tokens";
import "@jflamb/keycaps-react/styles.css";
import { Button, Field } from "@jflamb/keycaps-react";
```

Import the token layer once near the application root. Component CSS is intentionally separate so non-React consumers can use tokens without React styles.

Long-form content — articles, CMS output, rendered markdown — has its own opt-in layer:

```css
@import "@jflamb/keycaps-tokens/prose.css";
```

It styles bare HTML inside a `.kc-prose` container and is not part of the default import, because a product surface that renders no articles should not pay for it.

## Theme contract

Keycaps follows the system color scheme by default. Set `data-theme="light"` or `data-theme="dark"` on the root element for an explicit choice. `ThemeToggle` owns the three-state persistence contract, and `createThemeBootstrapScript` from `@jflamb/keycaps-react/theme` applies the same cookie-first preference before a hydrated app paints while synchronizing `meta[name="theme-color"]`.

## Status

All components begin at `beta`. A component becomes `stable` only after API review, automated interaction and accessibility checks, responsive and forced-color verification, and manual assistive-technology coverage documented in the release record.

## Documentation and releases

Storybook is the documentation site and deploys to GitHub Pages after the main CI workflow passes. The two public npm packages publish only from a GitHub Release whose tag matches their shared version.

VitePress is deliberately not part of the foundation. Storybook already keeps narrative guidance, live component examples, accessibility checks, and API documentation in one place. A separate standards site is worth reconsidering only when non-component guidance becomes substantial enough that Storybook navigation is the constraint.

See [Foundation decision](docs/decisions/0001-foundation.md), [consumer delivery](docs/decisions/0002-consumer-delivery.md), [component status](docs/component-status.md), [publishing](docs/publishing.md), and [contributing guidance](docs/contributing/components.md).

## License

MIT — see [LICENSE](LICENSE).

The Latin WOFF2 assets redistributed in `packages/tokens/fonts` are the one
exception: Piazzolla, Sofia Sans and Lilex stay under the SIL Open Font License 1.1,
and their license texts ship beside the binaries in
`@jflamb/keycaps-tokens/dist/fonts/`. None of the fonts declares a Reserved Font
Name, so the Latin subsetting and WOFF2 conversion carry no renaming
obligation.
