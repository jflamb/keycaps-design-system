# @jflamb/keycaps-react

## Application shell navigation

`AppShellNavGroup` owns labelled lists and the separator between ordered groups.
`AppShellNavLink` accepts an optional icon slot without choosing an icon library:

```tsx
<AppShellNavGroup label="Household">
  <AppShellNavLink href="/orders" icon={<PackageIcon />} isCurrent>
    Orders
  </AppShellNavLink>
</AppShellNavGroup>
```

Icons are decorative by default because the link text names the destination.
Use `iconLabel` only when the icon communicates information not present in that
text. `isDisabled` uses the existing React Aria disabled-link contract.

Owned Keycaps React components built on React Aria Components.

```tsx
import "@jflamb/keycaps-tokens";
import "@jflamb/keycaps-react/styles.css";
import { Button, Field } from "@jflamb/keycaps-react";

export function Example() {
  return (
    <form>
      <Field label="Project name" />
      <Button type="submit">Save project</Button>
    </form>
  );
}
```

Install `react` and `react-dom` in the consuming application. Import the token layer once at the application root, then import the component styles.

Documentation: <https://jflamb.github.io/keycaps-design-system/>

## Theme bootstrap for hydrated apps

`ThemeToggle` cycles system, light, and dark and persists the explicit choices.
Hydrated consumers should also place the package-owned bootstrap in the document
head so the same preference is applied before the first frame:

```ts
import { createThemeBootstrapScript } from "@jflamb/keycaps-react/theme";

const script = createThemeBootstrapScript({
  storageKey: "jflamb-theme",
  themeColorSelector: "#theme-color",
});
```

Render `script` as a blocking inline script after the selected theme-color meta
and before stylesheets or deferred application modules. The helper reads a
valid cookie first, falls back to localStorage, and keeps browser chrome correct
after explicit choices and operating-system changes in system mode.

## License

MIT — see `LICENSE`.

This package ships no font binaries; the faces come from
`@jflamb/keycaps-tokens`, which carries its own SIL Open Font License 1.1
carve-out. React Aria Components is an Apache-2.0 dependency installed
alongside this package, under its own terms.
