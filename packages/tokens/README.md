# @jflamb/keycaps-tokens

Framework-neutral Keycaps CSS custom properties, locally hosted Piazzolla, Sofia Sans and Lilex assets, semantic light/dark themes, reduced-motion defaults, and forced-color support.

```css
@import "@jflamb/keycaps-tokens";
```

Set `data-theme="light"` or `data-theme="dark"` on the root element for an explicit theme. Without an explicit value, Keycaps follows the system color scheme.

## Long-form content

Styling for the elements a CMS or a markdown pipeline emits ships separately, because a product surface that renders no articles should not pay for it:

```css
@import "@jflamb/keycaps-tokens/prose.css";
```

```html
<article class="kc-prose">…</article>
```

Everything in it is scoped to `.kc-prose`, so importing it changes nothing until that class appears.

New projects should use the `--kc-*` properties. Existing jflamb applications can opt into compatibility aliases with:

```css
@import "@jflamb/keycaps-tokens/legacy.css";
```

Documentation: <https://jflamb.github.io/keycaps-design-system/>

## License

MIT for the tokens, base styles, and build output — see `LICENSE`.

The bundled font binaries are not MIT. Piazzolla, Sofia Sans and Lilex remain under
the SIL Open Font License 1.1, which is why this package declares
`MIT AND OFL-1.1`. Keep `LICENSE-PIAZZOLLA.txt`, `LICENSE-SOFIA-SANS.txt` and `LICENSE-LILEX.txt`
with the WOFF2 files if you copy them out of `dist/fonts/`.
