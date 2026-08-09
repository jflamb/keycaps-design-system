# Consumer component inventory

A survey of the UI surfaces in `assistant-workbench`, `retirement-dashboard`,
`knowledge`, `mcp-dnsimple`, and `mcp-unifi`, cross-referenced against what
Keycaps ships today. This is the input to the styling and Storybook work, not
the plan for it.

Surveyed 2026-08-09 against the working copies in `~/Repos/jflamb`.

## What Keycaps ships today

`@jflamb/keycaps-react` exports seven components — Button, Card (six parts),
Field, Select, Banner, Badge, Popover — plus two icons (`ChevronDownIcon`,
`CloseIcon`). `@jflamb/keycaps-tokens` ships the token layer, three variable
faces (Piazzolla, Sofia Sans, Lilex), and an opt-in `prose.css` that styles
bare HTML inside `.kc-prose`. Storybook carries 18 story files.

## The two findings that shape everything else

**1. Four of the five repos cannot consume `@jflamb/keycaps-react` at all.**

| Repo | UI stack | Can import the React package? |
| --- | --- | --- |
| `knowledge` | React 19 + Tailwind v4 | Yes |
| `retirement-dashboard` | Vanilla TS emitting HTML strings (`src/ui/*.ts`) | No |
| `assistant-workbench` | Static HTML + vanilla JS on Cloudflare Pages | No |
| `mcp-unifi` | Static HTML (`site/index.html`) | No |
| `mcp-dnsimple` | HTML template literals in `src/branding.ts` | No |

**2. The component CSS is unusable outside React.** `packages/react/src/styles.css`
contains zero `:hover`, `:active`, or `:focus-visible` rules — every interactive
state is expressed through React Aria's data attributes (`[data-hovered]`,
`[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`, `[data-invalid]`).
A plain `<button class="kc-button" data-variant="primary">` renders correctly at
rest and is completely inert on hover, press, and focus. The press physics —
the system's signature — is the first casualty.

So "refactor these repos onto Keycaps" is really two projects. `knowledge` is a
component-adoption project. The other four need a way to get components without
authoring React.

[ADR 0002](../decisions/0002-consumer-delivery.md) settles how: one
implementation — the React components on React Aria — delivered two ways.
Low-interaction surfaces (`mcp-dnsimple`, `mcp-unifi`) render the real components
to static HTML at build time and ship no client React. Application surfaces
(`assistant-workbench`, `retirement-dashboard`, `knowledge`) run React and mount
components as islands where a full rewrite is not warranted. Hand-authored
component markup is not a supported path; tokens and `prose.css` remain
consumable by anything.

## Per-repo profile

### assistant-workbench

Operator dashboard on Cloudflare Pages. Ten pages: overview, activity,
approvals, bills, orders, `runs/latest`, sign-in, and three SMS legal pages.
Styling is `ledger.css` (a hand-rolled token layer, ~120 custom properties)
plus `workbench-view.css` (1,914 lines), with markup rendered by
`workbench-view.js`.

There is a fourth styling surface outside `public/` entirely:
`apps/web/functions/approvals/[approvalRequestId].ts` emits a complete document
with its own inline `<style>` block, carrying a third copy of the press CSS. Any
migration scoped to `public/` will miss it.

**Closest to Keycaps of the five, and already diverged.** `ledger.css` calls
itself "the shared Keycaps layer" and reimplements the vocabulary — `--radius-plate: 18px`,
`--radius-key: 10px`, `--edge-w: 4px`, `--dur-press: 120ms`, `--shadow-plate`,
coral key faces with `--key-edge-primary`. The press is implemented on
`.icon-button` as `translateY(2px)` with `border-bottom-width: 3px → 1px`;
Keycaps specifies 3px travel and 4px → 1px. It is a fork that has drifted, and
it is on the retired Fraunces/Nunito Sans pairing.

### retirement-dashboard

The largest and most distant surface: 6,783 lines of CSS across four files —
`styles.css` (4,912), `print.css` (1,253), `ledger-preview.css` (499), and
`auth.css` (119) — with ~700 class selectors in the main sheet alone,
no framework. Its own visual system end to end — Aptos, a green `#2a7360`
accent, a 4px spacing grid, and a bespoke type ramp (`--text-2xs` … `--text-3xl`).
It has real dark-theme support and the only genuinely dense data UI in the set:
17 tables, 4 canvases, sparklines, bullet charts, sensitivity grids, a year
timeline, and three `<dialog>` elements.

Nothing here is Keycaps-shaped. This is a re-skin, not an adoption.

### knowledge

React 19, Tailwind v4, 14 components, 3,712 lines of CSS. Inter on a
`#075ce5` blue. Has a local `Button.tsx` with `primary | secondary | danger |
ghost` variants — but only `--primary` has any CSS behind it, the undefined
`secondary` is the default, and there is one call site. It is a stub, not a
component to reconcile.
Light-mode only: no `data-theme` or `prefers-color-scheme` rules anywhere, so
adopting the Keycaps theme contract is net-new work.

The one repo where component adoption is straightforward, and the one with the
most genuinely novel components (nav tree, details drawer, evidence lists).

### mcp-unifi

A single 190-line marketing page with 816 lines of CSS. Ships Fraunces and
Nunito Sans WOFF2 locally — the retired pairing. Sections: hero, diagnostic
rows, local-runtime path, prompt transcript, supported list, legal. Light-mode
only.

It also carries `.impeccable/design.json`, titled "Design System: mcp-unifi
Keycaps" — a second design system document describing this repo's own tokens and
components. Whatever its original purpose, a per-repo artifact claiming the
Keycaps name is precisely the divergence ADR 0002 exists to end, and it should be
retired with the migration rather than left to be read as authority.

### mcp-dnsimple

No stylesheet on disk. The entire home page — markup, CSS, and an OG card — is
generated inside `src/branding.ts` (1,084 lines). Hero, CTA row with three
button variants, dark code block with syntax-token spans, endpoint list, prompt
cards, stats, footer. Fraunces again. Smallest surface, cleanest slate.

## Cross-reference

"Repos" counts how many of the five contain the pattern.

### Covered by an existing component

| Pattern | Repos | Keycaps | Note |
| --- | --- | --- | --- |
| Button | 5/5 | `Button` | AW `.button-primary/-secondary/-destructive/-compact`, KN `Button` (4 variants), DN `.btn--primary/--secondary/--ghost`, UF `.primary-key`, RD `.button-link`. **Every repo has a destructive/danger variant Keycaps lacks.** |
| Card / panel | 5/5 | `Card` | AW `.panel`/`.approval-card`, RD `.card`/`.panel`/`.hub-card`/`.setting-card`, KN `.vault-panel`/`.home-section`, DN `.prompt-card`. Header/body/footer split already matches. |
| Badge / tag / pill | 4/5 | `Badge` | AW `.tag-{info,success,attention,critical,neutral}`, RD `.now-chip`/`.tl-pill`, KN `.knowledge-state--{attention,stale,neutral}`, DN `.badge`. AW and RD both use a pill radius (999px) Keycaps' Badge does not offer. |
| Field | 3/5 | `Field` | RD `.field`/`.field-label`/`.field-desc` (49 hits), KN `.search-field`, AW sign-in. RD's is the closest structural match to Keycaps' label/description/control/error grid. |
| Select | 2/5 | `Select` | RD 5 native `<select>` incl. `.segmented-field`, KN `.topic-select`. Both native today; both would gain from the popover listbox. |
| Banner / alert | 3/5 | `Banner` | KN `.app-alert`/`.prototype-notice`, RD `.saved-plan-banner`/`.tiller-coverage-warning`/`.early-death-warning`, AW `.operator-alert`/`.orders-notice`. |
| Popover | 2/5 | `Popover` | AW `.operator-menu`, RD `.spark-tooltip`. Thin usage. |
| Long-form article | 2/5 | `prose.css` | KN `.markdown-article` (react-markdown + remark-gfm), UF/DN static copy. Direct fit. |

### Needs a variant or extension on an existing component

| Pattern | Repos | Extends | Gap |
| --- | --- | --- | --- |
| Danger button | 4/5 | `Button` | `variant="danger"` — approvals, deletes, destructive vault actions. |
| Icon-only button | 4/5 | `Button` | AW `.icon-button`, KN `.icon-control`/`.star-control`, RD `.drawer-trigger-icon`. Needs an accessible-name contract. |
| Link-styled button | 3/5 | `Button` | RD `.button-link`, AW `.panel-link`, KN `.vault-inline-action`. Distinct from `quiet` — inline, no control height. |
| Pill badge | 2/5 | `Badge` | AW `.status-pill` (999px, 30px tall, leading icon), RD `.now-chip`. |
| Badge with icon | 3/5 | `Badge` | AW `.status-pill svg`, KN state dots, RD `.tl-dot`. Also the Tone Trio Rule's second carrier. |
| Card as link | 3/5 | `Card` | RD `.hub-card-link`, KN `.home-update` (whole row navigates), DN `.prompt-card`. |
| Textarea field | 2/5 | `Field` | RD assistant chat composer, KN `.chat-composer`. |
| Search field | 2/5 | `Field` | KN `.search-field` + `.search-field__clear`, RD Tiller picker. |

### Gaps — no Keycaps equivalent

Ranked by how many repos need them.

**Tier 1 — 4 or 5 repos**

| Component | Repos | Evidence |
| --- | --- | --- |
| App shell / page header | 5/5 | AW `.topbar`/`.page-header`/`.layout`, RD `.app-shell`/`.topbar`, KN `.knowledge-shell`/`.knowledge-header`, UF `.site-header`, DN `.topbar`. Every repo, every one different. |
| Empty state | 4/5 | AW `.empty-state`/`.empty-note`, RD `.legacy-gift-empty`/`.now-fallback`, KN `.browse-workspace__empty`/`.empty-copy`/`.chat-empty`. |
| Description list (label/value) | 5/5 | 15 `<dl>` across all five. AW `.detail-list`, RD `.data-grid`, KN `.metadata-list`, UF `.diagnostic-row`, DN `.stat`. The single most repeated pattern in the set. |
| Skip link | 3/5 | KN, UF, DN all hand-roll `.skip-link`. AW and RD have none — an a11y gap Keycaps could close by shipping it. |
| Code block | 3/5 | DN `.code-block` with `.tk-brace`/`.tk-str` syntax spans, UF `.prompt-transcript`/`.tool-sequence`, KN fenced markdown. `prose.css` covers the article case only. |

**Tier 2 — 2 or 3 repos**

| Component | Repos | Evidence |
| --- | --- | --- |
| Data table | 3/5 | RD 17 tables + `.table-scroll`/`.sensitivity-table`, KN 2, AW `.data-table`/`.quiet-table`. RD's scroll container already implements the Prose Markup Rule's `tabindex="0"`. |
| Modal dialog | 2/5 | RD 3 native `<dialog>` (`.plan-history-dialog`, `.tiller-picker-dialog`), AW `.dialog`/`.dialog-backdrop`/`.dialog-panel`/`.dialog-actions`. |
| Drawer / side panel | 2/5 | KN `.details-drawer` (430px, `--open` state, mobile close), RD `.assumptions-drawer`. |
| Segmented control | 2/5 | RD `.segmented`/`.segment`/`.segment-label`/`.segment-sub` (28 hits — its primary assumption control), KN `.browse-filter`. |
| Sidebar / tree navigation | 2/5 | KN `.knowledge-nav` (365-line component: branches, chevrons, counts, collapse, mobile header), RD `.plan-rail`/`.plan-rail-group`. |
| Loading / skeleton | 2/5 | AW `.loading-block`/`.loading-line`, KN `.loading-screen`/`.vault-loading`/`.home-workspace__loading`. |
| Disclosure (details/summary) | 2/5 | RD 9, KN 2. `prose.css` styles `summary` with the press edge already — the rule exists, the component does not. |
| Timeline / activity feed | 2/5 | AW `.feed-entry`/`.activity-day`/`.date-heading`, RD `.timeline-list`/`.tl-*` (~30 classes). |
| Avatar | 1/5 | KN `.account-avatar`. Listed because an app shell usually needs one. |
| Theme toggle | 2/5 | AW `.theme-toggle`/`.theme-toggle-floating`, RD `applyTheme`/`themeStorageKey`. Keycaps defines the CSS contract but ships no control. |

**Tier 3 — specialized, likely stays local**

Charts and data visualization (RD sparklines, bullet charts, frontier and
trajectory canvases, Chart.js; KN `SafeVegaLiteChart` + `.declarative-chart`),
RD's `.tl-*` year timeline, KN's `.vault-*` evidence and provenance layer, AW's
`.health-*` monitoring rows, DN's OG card SVG. These need tokens and type, not
components.

## Cross-cutting migration issues

**The type system just moved and no consumer followed.** Keycaps is on
Piazzolla / Sofia Sans / Lilex as of `f86c6f6`. AW and UF are on Fraunces +
Nunito Sans and ship those WOFF2 files locally; DN is on Fraunces + Figtree +
JetBrains Mono; RD is on Aptos; KN is on Inter. All five need a font swap.
Optical sizing is a live concern: AW pins `"opsz" 11` on panel titles, which the
Piazzolla Title role forbids.

**One consumer fetches fonts at runtime.** `mcp-dnsimple` loads all three of its
faces from the Google Fonts CDN (`src/branding.ts:103`), with `preconnect` hints
to `fonts.googleapis.com` and `fonts.gstatic.com`. That is a standing violation
of the no-runtime-fetch rule in `DESIGN.md` and in the component contract, and
adopting the Keycaps token layer resolves it as a side effect.

**Two repos have no dark mode.** `knowledge` and `mcp-unifi` declare
`color-scheme: light` and have no `data-theme` or `prefers-color-scheme` rules.
Adopting Keycaps means authoring a dark theme for both, including the "no plate
shadow in dark" rule.

**Three token namespaces to reconcile.** AW's unprefixed `--color-*`/`--radius-*`,
RD's `--text-*`/`--space-*`/`--surface-*`, and KN's Tailwind `@theme` block all
collide conceptually with `--kc-*`. AW additionally maintains a compatibility
alias block (`--color-text-primary` → `--ink`) that will need unwinding.

**Only two icons ship.** KN depends on `lucide-react`, AW vendors
`lucide.min.js`. Keycaps ships `ChevronDownIcon` and `CloseIcon`. Status icons
are required by the Tone Trio Rule, which says each tone needs a distinct icon
*shape* — that obligation currently has no implementation.

**The Pressable Edge Rule needs auditing per repo.** AW puts a 3px bottom edge
on `.icon-button` (correct — it depresses) but `.tag`/`.impact-pill`/`.expiry`
correctly have none. RD and KN have no edge vocabulary at all, so every control
there needs the call made fresh.

## Suggested sequencing

Per ADR 0002. Steps 1–4 are library work in this repo; step 5 is the migration.

The ordering principle: **a repo does not migrate until the components it needs
exist.** Migrating against an incomplete library forces local components that then
have to be un-built, which manufactures the debt the project is retiring.

1. **Make the library survive static rendering.** Add `:hover`, `:active`, and
   `:focus-visible` rules covering the RAC data-attribute states, shipped as
   `@jflamb/keycaps-react/static.css` — a separate opt-in stylesheet imported only
   by the prerender path, so `styles.css` stays data-attribute-only and
   hand-written markup against it remains inert. Exclude `Select` and `Popover`;
   they have no meaningful no-JS state. Then stand up the static-render path
   itself: a `renderToStaticMarkup` entry point and the prerender script shape the
   two marketing repos will use.
2. **Close the variant gaps** — danger, icon-only, and link buttons; pill and
   icon badges; card-as-link; textarea and search fields. Small, additive, and
   unblocks the most call sites.
3. **Build the Tier 1 gaps** — app shell, page header, empty state, description
   list, skip link, code block. Five-repo payoff each. Tier 2 follows, ordered by
   which repo is being migrated rather than built up front.
4. **Stand up the drift controls before the first migration, not after.** The two
   consumer CI rules from ADR 0002 (no raw color literals or non-`--kc-` tokens;
   no `.kc-` selector defined or overridden in app CSS), an automated Keycaps
   dependency update in each consumer, and `tests/consumer/` tracking `main`
   instead of a release. Landing these first means every migration lands already
   protected.
5. **Migrate in this order**, chosen so each repo proves something before the
   next one depends on it:
   - `mcp-dnsimple` — smallest surface, one file, already builds with `tsc`.
     Proves Mode 1 end to end.
   - `mcp-unifi` — same page shape; adds the prerender script to a site with no
     build step today, and authors its first dark theme.
   - `assistant-workbench` — proves Mode 2. Needs Vite introduced, and is mostly
     deletion: `ledger.css` goes, the drifted press goes, the fork ends.
   - `knowledge` — already React, so pure component adoption; the real work is
     its first dark theme and unwinding the Tailwind `@theme` block.
   - `retirement-dashboard` — largest and most distant, and needs the most Tier 2
     components, which is a second reason it goes last. Vite is already there, so
     it is `@vitejs/plugin-react` plus island mounting; charts, canvases, the
     timeline, and the worker stay as they are. Of the 4,635 lines in `src/ui/`,
     roughly 2,700 touch markup; the rest is model and formatting code that
     survives untouched. The re-skin, not React, is the expensive part.

Storybook stories should be authored with the gap components as they are built,
not retrofitted — each Tier 1 component needs its consumer variations
represented, since the whole point is that five repos have to recognize
themselves in it. Components used in Mode 1 additionally need a story that
exercises the static-render states, because that is the path with no React
attached to catch a regression.
