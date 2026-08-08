# @jflamb/keycaps-tokens

Framework-neutral Keycaps CSS custom properties, locally hosted Fraunces and Nunito Sans assets, semantic light/dark themes, reduced-motion defaults, and forced-color support.

```css
@import "@jflamb/keycaps-tokens";
```

Set `data-theme="light"` or `data-theme="dark"` on the root element for an explicit theme. Without an explicit value, Keycaps follows the system color scheme.

New projects should use the `--kc-*` properties. Existing jflamb applications can opt into compatibility aliases with:

```css
@import "@jflamb/keycaps-tokens/legacy.css";
```

Documentation: <https://jflamb.github.io/keycaps-design-system/>
