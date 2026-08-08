# @jflamb/keycaps-react

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
