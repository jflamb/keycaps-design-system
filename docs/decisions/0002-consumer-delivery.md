# ADR 0002: One implementation, two delivery modes, for non-React consumers

- Status: Accepted
- Date: 2026-08-09

## Context

Five projects are adopting Keycaps: `assistant-workbench`, `retirement-dashboard`,
`knowledge`, `mcp-dnsimple`, and `mcp-unifi`. Only `knowledge` is a React
application. The other four render HTML without React — vanilla TypeScript
string builders, static files, or template literals inside a server module. See
[the consumer component inventory](../adoption/component-inventory.md) for the
per-repo survey.

ADR 0001 said CSS custom properties support React and non-React projects. That
holds for tokens. It does not answer how a non-React project gets a *component*,
and the component CSS as written cannot answer it either: `packages/react/src/styles.css`
expresses every interactive state through React Aria's data attributes
(`[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`,
`[data-invalid]`) and contains no `:hover`, `:active`, or `:focus-visible` rules.
Hand-written markup carrying `class="kc-button"` renders correctly at rest and is
inert on interaction.

`assistant-workbench` already answered the question for itself by forking the
vocabulary into `ledger.css`, which drifted — and drifted partially, which is the
more instructive failure. `.button` and `.action-button` implement the canonical
press exactly (3px travel, a 4px wall compressing to 1px). `.icon-button` and
`.operator-menu` travel 2px from a 3px wall. One repo, one stylesheet, two
different physics, and nothing to say which is correct. That fork is the failure
this decision exists to prevent recurring.

## Decision

**Keycaps has one component implementation: the React components built on React
Aria Components. It is delivered two ways.**

**Mode 1 — static render.** Low-interaction surfaces render the real Keycaps
components to HTML with `renderToStaticMarkup` at build time and ship tokens plus
component CSS with no client React. Applies to `mcp-dnsimple` and `mcp-unifi`.

**Mode 2 — hydrated React.** Application surfaces run React and use the
components directly, mounted as islands where a full rewrite is not warranted.
Applies to `assistant-workbench`, `retirement-dashboard`, and `knowledge`.

**Hand-authored component markup is not a supported path.** A consumer may write
markup against the token layer and against `prose.css`, which styles bare HTML by
tag inside `.kc-prose` and is designed for exactly that. A consumer may not
hand-write `.kc-button`, `.kc-card`, `.kc-field`, `.kc-select`, `.kc-banner`,
`.kc-badge`, or `.kc-popover` markup.

**When Keycaps lacks a component, the default is to add it here.** A consumer
that needs something the library does not have opens a component proposal against
this repo. Where that would block delivery, the consumer may build a local
component from tokens under two conditions: it does not use the `kc-` class
prefix, and it is recorded in that repo's adoption notes as owed upstream. A local
component that looks like a Keycaps component is the failure mode this whole ADR
exists to prevent — it is indistinguishable from the system at a glance and
diverges from it in every other respect.

## Rejected alternatives

**Web Components as the framework-neutral layer.** The conventional answer, and
wrong for Keycaps specifically. React Aria is the foundation ADR 0001 chose, and
it is where the accessibility guarantees live — `Select` composes RAC's `ListBox`,
`ListBoxItem`, `Popover`, `SelectValue`, `FieldError`, and `Label` to get roles,
typeahead, focus containment, and overlay positioning; `usePress` under Button is
what makes the press behave identically across pointer, touch, and keyboard.
Custom elements would mean reimplementing all of it. A custom-element layer
beside the React layer is worse than a replacement: two press implementations,
two focus rings, two sets of bugs, and no single answer to "what does Keycaps
do here." That is the `ledger.css` failure with better tooling.

**Hand-authored markup against a documented class contract.** Cheap, and it fails
twice. CSS delivers appearance only, so a hand-rolled select would look correct
and fail an assistive-technology audit — against a system whose stable bar
includes documented manual screen-reader coverage. And an unenforceable contract
is what produced `ledger.css`. Making hand-authoring first-class institutionalizes
the drift.

## Keeping one place to fix things

Choosing a delivery mode does not by itself deliver "fix it once." Three things
do, and they are ordered by how much divergence they actually produced.

**Coverage.** Every gap in the library is one local implementation per consumer,
free to diverge and impossible to fix centrally. The inventory found all five
repos carrying a bespoke app shell and page header, all five hand-rolling
description lists, and four with their own empty state — five repos routing around
a hole, not ignoring the system. Closing the Tier 1 gaps removes more divergence
than any process control, which is why it is a prerequisite for migration rather
than parallel work.

**Distance.** Packages publish only from a GitHub Release, so a fix here reaches
nothing until five `package.json` files are bumped. Consumers fall behind at
different rates, which is divergence by version rather than by code, and upgrade
pain compounds with distance until patching locally is the cheaper option — the
mechanism that produced `ledger.css`. Each consumer therefore gets an automated
dependency update for the Keycaps packages, grouped and auto-merging on green CI.
The `dependabot.yml` in this repo watches Keycaps' own dependencies and does
nothing for this; the config has to live in each consumer.

**Enforcement where the divergence happens.** This repo's coverage is strong —
`tests/e2e/foundation.spec.ts` asserts the press coupling invariant, transform-only
geometry, and the reduced-motion substitution. None of it was ever in scope for
`assistant-workbench`, which is why one half of its stylesheet could reach a 2px
press while the other half stayed canonical, with every check green. Each
consumer therefore runs two CI rules: app CSS may not contain a raw
color literal or a design token outside the `--kc-` namespace, and app CSS may not
define or override any `.kc-` selector. The second is what makes re-forking the
vocabulary a build failure rather than a code review someone loses.

`tests/consumer/` should additionally track this repo's `main` rather than a
release, so breaking changes surface here before five repos find them separately.

## Consequences

**Static state selectors ship as a separate opt-in stylesheet.** Statically
rendered output carries no `[data-hovered]` or `[data-pressed]`, so `:hover`,
`:active`, and `:focus-visible` rules are required for Mode 1 — but adding them to
`styles.css` would also make hand-authored `.kc-button` work, which is the
alternative rejected above. They ship instead as
`@jflamb/keycaps-react/static.css`, imported only by the prerender path. The main
`styles.css` stays data-attribute-only, so hand-written markup against it is inert
on hover, press, and focus. The guarantee is structural rather than documentary.
This follows the packaging convention `prose.css` already set.

Components whose behavior cannot degrade to CSS are not eligible for Mode 1 and do
not appear in `static.css`. A listbox that cannot open is not a degraded Select,
it is a broken one. `Select` and `Popover` are excluded; a page needing either is
a Mode 2 page.

**Two consumers need build infrastructure they do not have.**
`assistant-workbench/apps/web` has no bundler — `build` is `tsc --noEmit` over
raw files served by Cloudflare Pages — so Mode 2 requires introducing Vite.
`mcp-unifi` serves `site/` as-is with no build step, so Mode 1 requires a
prerender script. `mcp-dnsimple` already builds with `tsc` and can render at
module load. `retirement-dashboard` and `knowledge` already run Vite.

**Island adoption is the migration unit for existing apps.** `retirement-dashboard`
keeps its Chart.js, canvas, timeline, and worker code and mounts React per
container, so a ~700-selector surface migrates in slices rather than one rewrite.

**`ledger.css` is deleted, not deprecated.** `assistant-workbench` consumes
`@jflamb/keycaps-tokens` as its only source of custom properties.

**Components must exist before the repo that needs them migrates.** Migrating a
repo against an incomplete library forces local components, which then have to be
un-built. Tier 1 of the inventory gap list is a prerequisite for the first Mode 2
migration, not parallel work.

**Two theme contracts must be authored.** `knowledge` and `mcp-unifi` declare
`color-scheme: light` and have no `data-theme` or `prefers-color-scheme` rules.

**This narrows ADR 0001's framework-neutral promise.** Tokens and `prose.css`
remain consumable anywhere by anything. Components are consumable anywhere as
*output* — rendered HTML — but authored in one place.

## Reconsider this if

A consumer appears that cannot run Node at build time or React at runtime — a
CMS theme emitting markup from templates Keycaps does not control. Nothing in the
current five is that. `prose.css` already covers the case where markup arrives
from a CMS or a markdown renderer and cannot be passed a prop.
