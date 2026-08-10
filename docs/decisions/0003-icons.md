# ADR 0003: Phosphor icons, vendored into a registry and rendered inline

- Status: Accepted
- Date: 2026-08-10

## Context

Keycaps ships six glyphs: `ChevronDownIcon`, `CloseIcon`, and the four status
shapes Phase 1 added for the Tone Trio Rule. Everything else is a consumer's own
problem, and
[the migration plan](../adoption/migration-plan.md) said so deliberately —
"Keycaps does not become an icon library — it ships only the glyphs its own rules
require" — leaving `knowledge` on `lucide-react`, `assistant-workbench` on a
vendored `public/vendor/lucide.min.js`, and `knowledge` additionally hand-rolling
eleven more in `src/components/Icons.tsx`.

That position is wrong on this program's own terms. Two icon systems and a
hand-rolled set across five repos is exactly the divergence the adoption program
exists to remove; the only reason it did not read as drift is that no rule named
icons. A repo that adopts every Keycaps component and keeps its own icon
vocabulary has not converged — it has moved the seam.

There is a second, narrower reason. `prose.css` masks its callout shapes from one
set of paths and the components draw theirs from another, so the Tone Trio Rule's
requirement of a distinct shape per tone is satisfied twice, from two sources,
with nothing asserting they agree. A callout in an article and a badge in an app
should be one glyph.

`fdic-design-system` has already solved this. Its
`docs/plans/2026-04-07-prose-icon-unification-design.md` addresses the identical
problem — component icons and prose icons drawn from one source — and its
implementation is in production. This ADR adopts that pattern rather than
inventing a second one.

## Decision

**Phosphor is Keycaps' icon set. Path data is vendored into a registry, rendered
inline by a component, and generated into mask custom properties for CSS.**

**1. Vendored, not depended on.** There is no `@phosphor-icons/*` dependency and
nothing fetches at build time. Path data lives in a plain-JS module — FDIC's is
`packages/components/src/icons/phosphor-data.mjs`, a name → SVG-string map with
`fill="currentColor"` — carrying only the glyphs actually used. This is what
keeps `DESIGN.md`'s no-runtime-fetch rule intact and keeps the payload
proportional to use. Adding an icon is a deliberate commit, which is the point:
an icon set that grows without anyone noticing is a vocabulary nobody owns.

**2. One source, two consumers.** The data module feeds the runtime registry
*and* a build-time generator that emits `mask-image` custom properties for
`prose.css`. CSS carries shape through the mask and color through
`background-color` from tokens, so dark mode needs no second copy of the SVG.
This is what collapses the two shape sources into one.

**3. The generated artifact is checked, not trusted.** FDIC pairs
`generate:icon-masks` with `validate:icon-masks`, which fails when the committed
CSS does not match what the generator would produce from current source. Keycaps
adopts the same pairing, and it goes in `pnpm check` — the same discipline
Phase 4 requires of `mcp-unifi`'s generated `site/index.html`, where regenerating
must produce no diff.

**4. The generator reads source, never `dist/`.** A generator reading built
output emits stale masks whenever the build has not run, silently. FDIC's design
doc calls this out explicitly and the shared `.mjs` module is how it avoids it.

**5. Registration sanitizes.** The registry renders raw SVG inline, so it
enforces an element and attribute allowlist — no scripts, event handlers, URL
references, `data:` URLs, embedded HTML, or external images. Filters, gradients,
masks, symbols, and animation are unsupported by construction. Registered icons
are simple glyphs or they are rejected.

**6. The accessibility contract is the component's, not the caller's.** An icon
with no label renders `aria-hidden="true"`; an icon with a label renders
`role="img"` with that label. This is the same reasoning as `Button`'s
`iconOnly`, where the accessible name is required *in the type* rather than
suggested in a doc.

### Where Keycaps departs from the reference

- **React, not Lit.** The registry and the data module port unchanged. The
  component does not: `unsafeSVG` and `LitElement` become a React component over
  the same registry lookup.
- **An unknown icon name is a compile error, not a console warning.** `fd-icon`
  warns and renders nothing when a name misses. Keycaps generates a name union
  from the data module instead, on the same principle that made a nameless
  icon-only button a type error rather than an axe violation. A runtime warning
  is a defect a build can ship.

### What this retires

`lucide-react` in `knowledge`, the vendored `lucide.min.js` in
`assistant-workbench`, and `knowledge`'s `src/components/Icons.tsx`. Phases 5 and
6 own those deletions.

## Consequences

**Keycaps becomes an icon library, bounded.** The previous position is reversed,
not qualified. The bound is that only vendored glyphs exist and each arrives by
commit — FDIC carries 67 in roughly 82KB of source for a considerably larger
surface than any Keycaps consumer presents.

**Every phase gains an icon step.** Phases 3 through 7 each map a repo's glyphs
onto registry names, and the two that currently ship their own icon runtime
delete it.

**The Tone Trio Rule gets one carrier instead of two.** Once `prose.css` consumes
generated masks, the status shapes in an article and in a `Badge` are the same
paths by construction rather than by review.

## Sources

- `fdic-design-system`, `packages/components/src/icons/` — registry, data module,
  and weight modules (regular for interface chrome, duotone where a richer
  treatment is intentional).
- `fdic-design-system`, `scripts/icons/generate-icon-masks.mjs` and
  `validate-icon-masks.mjs`.
- `fdic-design-system`, `docs/plans/2026-04-07-prose-icon-unification-design.md`.
