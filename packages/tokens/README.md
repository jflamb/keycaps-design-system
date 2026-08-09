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

## License

MIT for the tokens, base styles, and build output — see `LICENSE`.

The bundled font binaries are not MIT. Fraunces and Nunito Sans remain under
the SIL Open Font License 1.1, which is why this package declares
`MIT AND OFL-1.1`. Keep `LICENSE-FRAUNCES.txt` and `LICENSE-NUNITO-SANS.txt`
with the WOFF2 files if you copy them out of `dist/fonts/`.
