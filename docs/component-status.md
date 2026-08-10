# Component status

| Component | Status | Behavior foundation | Automated coverage |
| --- | --- | --- | --- |
| Button | Beta | React Aria Button | Accessible name, keyboard press, press/reduced-motion styling, danger and icon-only and link variants |
| LinkButton | Experimental | React Aria Link | Renders an anchor carrying the key, static-render states |
| Field | Beta | React Aria TextField and TextArea | Label, description, error association, multiline, axe |
| SearchField | Experimental | React Aria SearchField | Searchbox role, Escape-to-clear, clear control present only when it would do something, axe |
| Select | Beta | React Aria Select and ListBox | Keyboard open/typeahead/selection, accessible options, axe |
| Popover | Beta | React Aria Popover and DialogTrigger | Open, Escape close, focus return, reduced motion |
| Banner | Beta | Semantic HTML plus React Aria Button | Status/alert role, dismiss name and action |
| Badge | Beta | Semantic HTML | Text-preserved status tones, distinct icon shape per tone, pill shape |
| Card | Beta | Semantic HTML, React Aria Link when linked | Heading structure and composition, whole-card and title-link navigation |
| AppShell | Experimental | Semantic HTML, React Aria Link for nav | Landmark structure, named navigation, `aria-current`, skip link by construction, 320px reflow, axe in light and dark |
| PageHeader | Experimental | Semantic HTML | Heading level independent of size, eyebrow excluded from the outline |
| EmptyState | Experimental | Semantic HTML | Heading level, axe |
| DescriptionList | Experimental | Semantic HTML | `dl > div > dt/dd` grouping preserved, three layouts, 320px reflow |
| SkipLink | Experimental | Semantic HTML | Clipped at rest, 44px key when focused, jumps to the shell's main region |
| ThemeToggle | Beta | React Aria Button | Three states including system, name announces current and next, storage arrangement as a prop, refused by `renderStatic` |
| Icon | Beta | Semantic SVG | Closed name union, decorative-vs-named accessibility contract, every glyph draws a distinct shape, status shapes match the prose masks |
| CodeBlock | Experimental | Semantic HTML | Keyboard-reachable scroll region, syntax roles carried by attribute |
| DataTable | Experimental | Semantic HTML | Named keyboard-reachable scroll region, `scope` on both header cells by construction, numeric alignment, `tfoot` totals, declaration-for-declaration parity with `prose.css`, static render, 320px reflow, axe in light and dark |

## Delivery modes

Per [ADR 0002](decisions/0002-consumer-delivery.md), components reach non-React
consumers as rendered HTML through `@jflamb/keycaps-react/static`.

| Component | Mode 1 (static render) | Note |
| --- | --- | --- |
| Button, LinkButton, Badge, Card, Field, Banner | Yes | States come from `static.css` |
| Icon | Yes | Paints with `currentColor` and needs no stylesheet at all |
| AppShell, PageHeader, EmptyState, DescriptionList, SkipLink, CodeBlock | Yes | SkipLink needs no `static.css` entry — `base.css` already covers it in every mode |
| DataTable | Yes | It has no interactive state at all, which is the price of this row. A row hover would have to come from React Aria's collection components, and those need a runtime; the scroll container's focus ring comes from `base.css` |
| Select, Popover, ThemeToggle | **No** | Behavior cannot degrade to CSS. `renderStatic` throws on each |

Two controls render in Mode 1 but do nothing there, and neither has a no-JS
behavior to degrade to: Banner's dismiss and CodeBlock's copy control. Do not
render them on a statically rendered page.

The automated browser matrix covers Chromium, explicit light and dark themes,
forced colors, reduced motion, and 320-CSS-pixel reflow. It additionally asserts
both halves of the static-render guarantee: that hand-authored `.kc-` markup is
inert under `styles.css` alone, and that the same markup becomes a working key
once `static.css` is loaded. Stable status still requires documented
VoiceOver/Safari and Windows screen-reader/browser verification.
