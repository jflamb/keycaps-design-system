# Keycaps migration plan

The program that moves `assistant-workbench`, `retirement-dashboard`,
`knowledge`, `mcp-dnsimple`, and `mcp-unifi` onto Keycaps.

**The objective is drift prevention.** The migration is how we get there, not the
point of it. Every phase below is scored on whether it removes a place where the
five repos can diverge — a missing component, a stale version, an unenforced
rule — rather than on how much markup it replaces.

## How to use this document

Each phase states its **inputs**, the **work** in the order it lands, its **exit
criteria**, how it is **validated**, and its **rollback**. A phase is executable
from its own section without reading the others. Read
[the component inventory](component-inventory.md) and
[ADR 0002](../decisions/0002-consumer-delivery.md) once, first, for the reasoning
behind the sequence; this document does not restate it.

Facts about consumer repos carry a file path and, where it matters, a line
number. Where this plan contradicts the inventory, the contradiction is recorded
in [Corrections to the survey](#corrections-to-the-survey) rather than quietly
fixed.

**Every such fact is measured from `origin/main`, never from a working tree.**
That is not pedantry: Phase 4's inputs were wrong by 47 lines and 142 lines
because they were read from a local checkout of `mcp-unifi` in which `site/` is
untracked, so the files on disk belonged to no commit. A stale figure in a plan
is cheap to fix and expensive to trust. Re-measure with
`git show origin/main:<path>` before relying on any number here.

## Premises

Settled, not up for renegotiation inside this program:

- **One implementation, two delivery modes** (ADR 0002). Mode 1 statically
  renders the real React components at build time; Mode 2 runs React. Mode 1 is
  `mcp-dnsimple` and `mcp-unifi`; Mode 2 is `assistant-workbench`, `knowledge`,
  and `retirement-dashboard`.
- **Hand-authored `.kc-` markup is not a supported path.** Tokens and
  `prose.css` are consumable by anything; components are authored in one place.
- **`styles.css` stays data-attribute-only.** The static state selectors ship
  separately as `@jflamb/keycaps-react/static.css`, imported only by the
  prerender path. This is the structural guarantee that hand-written markup stays
  inert, and no phase may weaken it.
- **A repo does not migrate until the components it needs exist.** Tier 1 is a
  prerequisite, not parallel work.
- **The Named Rules in `DESIGN.md` are binding**, including on consumer code
  after migration.
- **Two repos needing the same thing makes it a Keycaps component.** The repo
  count in [the inventory's cross-reference](component-inventory.md#cross-reference)
  is the test — not how novel or how repo-specific the pattern looks. One repo:
  it stays local and is recorded as owed upstream, per ADR 0002.
- **A functional difference between repos is a prop.** Only a difference
  substantial enough that one component would be doing two jobs earns a variant,
  and a sibling component is close to never correct. The existing
  danger/icon-only/link/pill/card-as-link work is the precedent: five apparent
  gaps, five props.
- **Where repos differ only visually, Keycaps picks one and the repos change.**
  Convergence on a common look is the objective, so preserving a repo's current
  appearance is not a reason to fork a component, widen an API, or keep a local
  one. Visual change in a consumer is an expected output of this program rather
  than a cost to be minimized.

## Phase map

| Phase | Scope | Repo(s) | Blocks |
| --- | --- | --- | --- |
| 1 | Static-render path, variant gaps, Tier 1 components | Keycaps | 2–7 |
| 2 | Drift controls and release plumbing | Keycaps + all five | 3–7 |
| 2a | Icon registry, and the Tier 2 union | Keycaps | 3–7 (partly) |
| 3 | Mode 1 proof | `mcp-dnsimple` | 4 |
| 4 | Mode 1 with no build step; first dark theme | `mcp-unifi` | 5 |
| 5 | Mode 2 proof; end the `ledger.css` fork | `assistant-workbench` | 6 |
| 6 | Pure component adoption; second dark theme | `knowledge` | 7 |
| 7 | The `retirement-dashboard` re-skin | `retirement-dashboard` | — |

Phases 3–7 are strictly ordered. Phases 1 and 2 could overlap, but 2's CI rules
are cheap to land and worthless after the fact, so 2 follows 1 immediately and
precedes 3.

**Phase 2a is library work with no consumer dependency, and it runs in parallel
with 3 through 6.** It was previously Phase 7 step 1, scoped to "the Tier 2
components `retirement-dashboard` needs," which is repo-shaped reasoning in a
program whose objective is convergence — and it put the largest remaining library
build at the end of a five-repo serial chain for no technical reason. The
inventory already ranks these by how many repos need them; that ranking is the
build queue. Only the last consumer's own re-skin stays in Phase 7.

---

## Phase 1 — Make the library sufficient

**Repo:** `keycaps-design-system` only. No consumer is touched.

### Why first

Two independent blockers. `packages/react/src/styles.css` expresses every
interactive state through React Aria data attributes and contains no `:hover`,
`:active`, or `:focus-visible` rule, so a statically rendered page is inert on
interaction — Mode 1 cannot exist yet. And the inventory found all five repos
carrying a bespoke app shell, all five hand-rolling description lists, and four
with their own empty state; migrating against that hole forces local components
that then have to be un-built.

### Work

**1.1 — The static-render path.**

- `packages/react/src/static.css`, a new stylesheet exported as
  `@jflamb/keycaps-react/static.css`. It mirrors, one-for-one, the
  data-attribute states in `styles.css` using `:hover`, `:active`,
  `:focus-visible`, and `:disabled`. `styles.css` is not touched.
- `Select` and `Popover` are excluded. A listbox that cannot open is not a
  degraded Select; a page needing either is a Mode 2 page.
- `packages/react/src/static.tsx`, exported as `@jflamb/keycaps-react/static`:
  `renderStatic(element)` wrapping `renderToStaticMarkup`, and
  `renderStaticDocument(options)` producing a whole HTML document with the
  no-flash theme bootstrap, the stylesheet links, the skip link, and the
  document metadata. It is a separate bundle entry so `react-dom/server` never
  reaches a browser bundle.
- `renderStatic` **throws** when the rendered markup contains `kc-select` or
  `kc-popover`. The Mode 1 exclusion is a build failure, not a note in a
  document.

**1.2 — Variant gaps** (inventory: "Needs a variant or extension"):
danger, icon-only, and link buttons; pill and icon badges; card-as-link;
textarea and search fields.

**1.3 — Tier 1 components:** app shell, page header, empty state, description
list, skip link, code block.

**1.4 — Stories** for everything built, with each Tier 1 component's consumer
variations represented, and a story per Mode 1 component that exercises the
static-render states.

### Exit criteria

- `@jflamb/keycaps-react/static.css` exists, is listed in the package `exports`,
  and is emitted by the package build.
- `packages/react/src/styles.css` contains zero `:hover`, `:active`, and
  `:focus-visible` selectors. Assert it, do not eyeball it.
- Every state rule in `static.css` has a counterpart data-attribute rule in
  `styles.css`, and vice versa, excluding Select and Popover.
- Every component in the two lists above is exported, has a story, has a unit
  test, and is covered by an axe run.
- `docs/component-status.md` lists every new component.

### Validation

`pnpm check` is the gate: typecheck, unit tests, build, pages verify, package
consumption, Playwright e2e, and `pnpm audit --audit-level high`, in that order.

Each step also has a node binary underneath it, which is what to reach for when
a shell has no working `pnpm`:

| Step | Command |
| --- | --- |
| tokens build | `node scripts/build-tokens.mjs` |
| react build | `packages/react/node_modules/.bin/tsup src/index.ts src/static.tsx --format esm,cjs --external react --external react-dom --clean` then `.../tsc -p tsconfig.build.json` |
| typecheck | `.../tsc --noEmit` in `packages/react`, `apps/storybook`, `tests/consumer` |
| unit + axe | `packages/react/node_modules/.bin/vitest run --coverage.enabled=false` |
| storybook build | `apps/storybook/node_modules/.bin/storybook build --quiet` |
| pages verify | `node scripts/verify-pages-build.mjs` |
| package consumption | `tests/consumer/node_modules/.bin/vite build` then `node tests/consumer/prerender.mjs` |
| e2e | `node_modules/.bin/playwright test` against a prebuilt Storybook, using a config whose `webServer` only runs `scripts/serve-storybook.mjs` |

The package-consumption step is the one that gained the most in this phase.
`tests/consumer` now builds twice: the browser fixture proves Mode 2, and
`prerender.mjs` proves Mode 1 — resolving `@jflamb/keycaps-react/static`,
`@jflamb/keycaps-react/static.css`, and the token tree **through the published
`exports` map**, copying the asset tree the way a consumer's build step must, and
asserting `renderStatic` refuses a Select. It is deliberately the reference
implementation Phases 3 and 4 copy, rather than a synthetic test: a fixture that
does not resemble the thing it is testing does not protect it.

Add to `tests/e2e/foundation.spec.ts`:

- **The inertness proof.** Load a page that imports `styles.css` only, with
  hand-authored `<button class="kc-button" data-variant="primary">` markup.
  Hover it and assert the computed background is unchanged. This is the test
  that fails if someone ever "helpfully" adds `:hover` to `styles.css`.
- **The liveness proof.** The same markup with `static.css` also loaded changes
  on hover, travels 3px on `:active`, and shows a 3px focus ring on
  `:focus-visible`.
- **The coupling holds statically.** `translateY` on `:active` plus the pressed
  edge width equals the resting edge width, under both motion settings — the
  same invariant the existing `data-kc-motion` test asserts for the React path.

### Rollback

The whole phase is additive: a new stylesheet, a new entry point, new component
files, new exports. Nothing existing changes shape except `packages/react/package.json`
`exports` and the tokens file. Reverting the branch restores the previous
library exactly, and no consumer depends on any of it yet.

---

## Phase 2 — Drift controls, before the first migration

**Repos:** `keycaps-design-system`, plus one PR in each of the five consumers
that touches only CI and dependency configuration.

### Why here

ADR 0002 names three mechanisms that actually deliver "fix it once": coverage,
distance, and enforcement where the divergence happens. Phase 1 closes coverage.
This phase closes the other two, and it has to land before the first migration,
because a control added afterwards has to be retrofitted against code that has
already diverged.

The evidence that this is not theoretical: `assistant-workbench` reached a 2px
press on `.icon-button` with every check in its own CI green, because none of
Keycaps' invariants were ever in scope for it.

### Work

**2.1 — Release and distance.**

- Cut the first Keycaps release that contains Phase 1. Packages publish only
  from a GitHub Release (`.github/workflows/publish-packages.yml`), so nothing
  reaches a consumer until this happens.
- Add a dependency-update config to **each consumer**. None of the five has one
  today — verified absent in all five `.github/` directories. Group the two
  Keycaps packages into a single update and auto-merge on green CI. The
  `dependabot.yml` in this repo watches Keycaps' own dependencies and does
  nothing for consumers; the config has to live in each of them.
- Point `tests/consumer/` at this repo's `main` rather than a release, so a
  breaking change surfaces here before five repos find it separately. **This was
  already true when the plan was written**, and stating it as work to do was an
  error: the fixture has used `workspace:*` since the scaffold commit `b089fcc`,
  resolving to `link:../../packages/react` and `link:../../packages/tokens` in
  `pnpm-lock.yaml`, which is stricter than tracking `main` — it is the working
  tree, not a branch. What Phase 2 actually added is an assertion in
  `tests/consumer/prerender.mjs` that checks both halves, the specifier and the
  resolved path, so the fixture cannot regress to a published release while
  still looking green. That regression is the one failure mode that proves the
  opposite of what it claims, so it is worth a check rather than a convention.

**2.2 — Enforcement in each consumer.** Two CI rules, run by `keycaps-css-lint`
— a bin shipped on `@jflamb/keycaps-tokens` — and wired into each repo's existing
check workflow.

The rules are **not** copied into each repo. Five copies of an anti-drift script
is a drift problem wearing a disguise: when the color rule has to learn about a
notation nobody has used yet, it would need fixing five times and the fifth would
be missed. The invariants are Keycaps' invariants, so they ship from the package
that defines the `--kc-` namespace and that every consumer installs anyway. Each
repo carries only a `.keycaps-lint.json` naming the files to scan and its own
allowlist — the part that genuinely differs.

The rules themselves:

1. **No raw color literals and no non-`--kc-` design tokens in app CSS.** Fail on
   `#rgb`/`#rrggbb`, `rgb(`, `hsl(`, and `oklch(` in any app stylesheet, and on
   any `--` custom property declaration outside the `--kc-` namespace that names
   a color, radius, spacing step, duration, shadow, or font.
2. **No `.kc-` selector defined or overridden in app CSS.** This is the one that
   makes re-forking the vocabulary a build failure rather than a code review
   someone loses.

Both rules need an allowlist per repo. Two kinds, and the difference matters:
`allowTokens` is for genuinely local concerns that will never be Keycaps' job —
`retirement-dashboard`'s `--chart-*` series colors are the real example, Tier 3
by the inventory's own classification. `allowFiles` is for pre-migration debt,
and every entry is deleted by the phase that migrates that file, so the list is
a ratchet and its length is a progress bar. The linter prints the allowlisted
count on every run, because an allowlist that stops being visible stops being
temporary.

As shipped in `0.1.2`, `allowFiles` suppresses **only** rule 1 — the token and
color debt. Rule 2 still runs inside an allowlisted file, so a `.kc-` selector
is a failure there as much as anywhere else. That asymmetry is the point:
pre-migration color debt is debt, to be paid down by the phase that owns the
file, but redefining Keycaps' vocabulary is new divergence and there is no
migration phase in which it becomes acceptable. The practical consequence for
Phases 3 through 7 is that an allowlisted file is not an unchecked file, and the
gate is not inert in a repo whose every styling surface is allowlisted.

Also as shipped in `0.1.2`: a non-empty `include` whose globs match no files at
all exits `2` rather than passing, because a check reading zero bytes is worse
than no check. The test is deliberately **aggregate** rather than per-glob, so a
config may carry a pattern for a stylesheet that does not exist yet — which is
how `mcp-dnsimple`'s `src/**/*.css` and `mcp-unifi`'s `site/**/*.css` act as
ratchets for surfaces those phases will create.

For a repo the size of `retirement-dashboard` the debt allowlist is file-scoped
rather than occurrence-scoped; enumerating individual findings across 6,783 lines
of CSS would produce a list nobody reads.

Wiring per repo:

| Repo | Workflow to extend | Existing checks | Gated a PR? |
| --- | --- | --- | --- |
| `assistant-workbench` | `.github/workflows/deploy-assistant-web.yml` | `npm run format`, `typecheck`, `test`, `test:e2e` | **no** |
| `retirement-dashboard` | `.github/workflows/check.yml` (`quality` job) | `format`, `typecheck`, `lint`, `build` | yes |
| `knowledge` | `.github/workflows/ci.yml` (`validate` job) | `check`, `test`, `build`, `test:e2e` | yes |
| `mcp-dnsimple` | `.github/workflows/quality.yml` | lint, typecheck, test, build, `npm audit` | yes |
| `mcp-unifi` | `.github/workflows/quality.yml` | lint, typecheck, test, build | yes |

The fourth column is the correction. An earlier draft of this table called all
five "existing gates"; `assistant-workbench` was not one.
`deploy-assistant-web.yml` had **no `pull_request` trigger** — only `push` to
`main` and `workflow_dispatch`, both of which deploy to production. It held every
check `apps/web` has and none of it stood between a pull request and a merge, so
a drift rule wired into it would have had nothing to fail on: the rule would run
for the first time after the change it was meant to reject had already shipped.

Phase 2 therefore had to build the gate before it could wire anything into it. It
added a `pull_request` trigger with the same paths filter as the existing `push`,
and gated the four production steps — `Check D1 migration changes`, `Apply D1
migrations`, `Sync approval bridge secret`, and `Deploy to Cloudflare Pages` —
behind `github.event_name != 'pull_request'`. The checks run on a pull request;
nothing that mutates production does. This is worth recording beyond its own
repo, because it is the one place in the program where "wire the rule into the
existing check workflow" was not a one-line change, and because it means every
`apps/web` check — not only the Keycaps one — now runs before a merge rather than
after it.

**2.3 — Two repos need a stylesheet gate they do not have.** `mcp-dnsimple`'s
CSS is a string inside `src/branding.ts` (lines 106–818), and `mcp-unifi`'s
`site/` directory is outside its `tsconfig` include and outside its ESLint globs
entirely — the landing page has no automated coverage of any kind. The rule
scripts must read those two surfaces specifically, not glob `**/*.css`.

One filename in that guidance cannot be written literally.
`assistant-workbench`'s fourth CSS surface is
`functions/approvals/[approvalRequestId].ts`, and in an `include` pattern the
square brackets are a glob **character class** — the literal name matches
nothing. Combined with the old linter behaviour of passing on an empty file set,
writing it out produces a permanently green check that reads zero bytes: the
exact shape of failure this phase exists to prevent, arriving through the config
rather than through the CSS. The shipped config uses
`functions/approvals/*.ts`. An `allowFiles` entry is compared as an exact path
rather than as a glob, so the literal name is correct *there* and wrong in
`include` — which is why the two lists in that repo's config do not read the
same.

### Exit criteria

All met. Five consumer pull requests are merged and green on `main`.

- A Keycaps release exists containing Phase 1, and both packages are on npm —
  `@jflamb/keycaps-tokens@0.1.2` and `@jflamb/keycaps-react@0.1.2`.
- Five dependency-update configs merged, one per consumer.
- Both CI rules run and pass in all five consumers, against their **current**
  pre-migration code. They will fail at first; the allowlist is how a repo
  declares its pre-migration debt, and each allowlist entry is deleted by the
  phase that migrates that repo.
- `tests/consumer/` tracks `main`, and now asserts that it does.

### The measured baseline

What each allowlist declares, run with no allowance of any kind — the honest
figure for how much debt each migration carries into its phase:

| Repo | Findings | raw-color / local-token / kc-override | Debt files allowlisted |
| --- | ---: | --- | ---: |
| `assistant-workbench` | 247 | 90 / 157 / 0 | 4 |
| `retirement-dashboard` | 324 | 206 / 118 / 0 | 4 |
| `knowledge` | 226 | 217 / 9 / 0 | 1 |
| `mcp-dnsimple` | 67 | 55 / 12 / 0 | 1 |
| `mcp-unifi` | 19 | 15 / 4 / 0 | 2 |
| **total** | **883** | | **12** |

Thirty of `retirement-dashboard`'s 324 are the `--chart-*` series — the nine
colors declared three times over, 27 findings, plus the three `--chart-ink`
declarations that carry them — which `allowTokens` covers permanently rather than
as debt. Its migration therefore carries 294. The 324 is what the two rules find
with nothing allowed at all, and it is the figure its own `.keycaps-lint.json`
quotes, which is why the table uses it.

The concentrations are worth keeping, because they say where each phase's effort
actually goes. `assistant-workbench`'s `public/ledger.css` alone is 241 of its
247 — the fork this program exists to end is also very nearly the whole of that
repo's debt. `retirement-dashboard` spreads across four files: `styles.css` 143,
`print.css` 89, `ledger-preview.css` 67, `auth.css` 25.

**Zero `.kc-` overrides exist in any of the five today.** Every one of the 883
findings is rule 1. Rule 2 has never fired, which is the result to want from it —
it is there to stop a second `ledger.css`, and no repo has started one.

The other thing the baseline shows is that `mcp-dnsimple` and `mcp-unifi`
currently have **no files actively checked by rule 1**, because in both repos the
only styling surface is also the only debt entry. Rule 2 does run on those files,
so the gate is not inert, and the `include` globs cover stylesheets neither repo
has yet — but rule 1's live coverage in the two Mode 1 repos is zero until Phases
3 and 4 empty their allowlists. That makes those two phases the ones that turn
the control on, rather than the ones that merely satisfy it.

### Validation

Deliberately break each rule in a scratch commit per repo and confirm CI goes
red: add `color: #ff0000` to app CSS, and add a `.kc-button { }` override. Both
must fail. A rule that has never been seen failing has not been tested.

### Rollback

Each control is one file plus one workflow step per repo. Reverting a repo's PR
restores its previous CI exactly. No application code changes in this phase, so
nothing can break at runtime.

---

## Phase 2a — The icon registry and the Tier 2 union

**Repo:** `keycaps-design-system` only. Runs in parallel with Phases 3–6.

### Why it is separate

Two pieces of library work were sitting on the critical path with nothing
technical holding them there. The icon decision ([ADR 0003](../decisions/0003-icons.md))
affects every phase from 3 onward, so it has to precede 3. The Tier 2 build was
Phase 7 step 1 and blocked on four consumer migrations it does not depend on.

### Work

**2a.1 — The icon registry**, per ADR 0003: the vendored data module, the
registry with its sanitizing `register`, the React icon component, the generated
name union, the mask generator, and the `validate` pairing wired into
`pnpm check`. `prose.css` moves onto the generated masks, which is what makes the
Tone Trio Rule's shape-per-tone one source rather than two.

**2a.2 — The Tier 2 union, ordered by repo count.** The count that orders it is
**not** the inventory's. The inventory counts repos in which a pattern's *class
names are visible*; what the build queue needs is repos that can *consume a
component*, which is a smaller number every time anyone has checked. Three
entries were re-measured only by building them, and each fell:

- the theme toggle from 5/5 to 3/5, because delivery mode filters it
  ([correction 14](#corrections-to-the-survey));
- the data table from 3/5 to 1/5, because one repo renders no tables and
  another's two are article tables ([correction 17](#corrections-to-the-survey));
- and Keycaps' own Storybook turned out to be an unlisted sixth surface with a
  rival treatment ([correction 18](#corrections-to-the-survey)).

The eight entries that remained after those two shipped were therefore surveyed
**from the markup on each repo's `origin/main`** before anything else was built.
Six of the eight stopped being components. The table below is that survey's
result and replaces the ranking derived from the inventory; corrections
[20](#corrections-to-the-survey) through
[27](#corrections-to-the-survey) record every place it contradicts.

**The queue.** Each entry gets stories, tests, an axe run, and a
`docs/component-status.md` row, exactly as Phase 1's did:

| # | Component | Consumers | Mode | Evidence |
| ---: | --- | ---: | --- | --- |
| 1 | Disclosure — **shipped** | **3/5** | **1 and 2** | AW `[approvalRequestId].ts:425`, `index.html:1203`; KN `DetailsDrawer.tsx:242`, `SafeVegaLiteChart.tsx:248`; RD 9 sites, `planner.ts:573`/`:3821`/`:4397-4410`, `assistantChat.ts:140`, `tillerPicker.ts:91` |
| 2 | Modal dialog — **shipped** | **2/5** | 2 only | AW `index.html:368-387` (live: `openDialog` `:1083`); RD `planHistory.ts:6`, `tillerPicker.ts:17` |

The modal dialog shipped as `Dialog`, a native `<dialog>` opened with
`showModal()`, with the drawer as a `placement` prop rather than a sibling
component. `renderStatic` throws on it, so its mode is 2 only. Corrections
[30](#corrections-to-the-survey) and [31](#corrections-to-the-survey) record what
the build turned up about the scrim token and the React Aria portal APIs. **That
completes the Phase 2a queue.**

The disclosure shipped as a native `<details>`, so its mode is 1 *and* 2 rather
than "2, progressive": `renderStatic` renders it and it genuinely works there,
with the press, the keyboard, and `name`-based exclusive grouping all the
browser's. Its treatment is one rule set in `base.css` naming both
`.kc-prose summary` and `.kc-disclosure > summary`, rather than the `prose.css`
copy the direction below anticipated — see the note there. Corrections
[28](#corrections-to-the-survey) and [29](#corrections-to-the-survey) record what
the build turned up about the chevron count and the two-slot layout.

Shipped earlier in this phase, and listed for completeness: **data table**
(1 real consumer plus Keycaps' own docs — corrections 17 and 18) and **theme
toggle** (3/5 — correction 14).

**What left the queue, and where it went.**

| Was | Claimed | Measured | Disposition |
| --- | ---: | ---: | --- |
| Drawer / side panel | 2/5 | **0** as a distinct component | Two unrelated things sharing a word. RD's `.assumptions-drawer` *is* a modal `<dialog>` (`planner.ts:4382`, `showModal()` at `:3989`) — it is entry 2 with a `placement` prop. KN's is a layout region, not an overlay (`styles.css:285`) — it is `AppShellSidebar`. **Overturns [correction 13](#corrections-to-the-survey); see [20](#corrections-to-the-survey).** |
| Sidebar / tree navigation | 2/5 | **2/5, already served** | `AppShellNav`, `AppShellNavLink`, and `AppShellSidebar` shipped in Phase 1, `aria-current="page"` included (`styles.css:1044`). Neither consumer is a tree. What is genuinely missing is a group heading and a trailing count — two extensions at 2/5, which belong in the inventory's *variant or extension* table. **Overturns [correction 13](#corrections-to-the-survey); see [21](#corrections-to-the-survey).** |
| Segmented control | 2/5 | **1/5** | KN's `.browse-filter` is a search input (`styles.css:1003-1034`), already `SearchField`. RD is the only consumer, 9 call sites all inside one drawer. Tier 3, stays local, owed upstream. [22](#corrections-to-the-survey) |
| Loading / skeleton | 2/5 | **1/5** | KN's three "loading" classes are text status lines (`App.tsx:599`), not skeletons. AW alone has the pulsing placeholder (`workbench-view.css:956-977`). Tier 3, stays local, owed upstream. [23](#corrections-to-the-survey) |
| Timeline / activity feed | 2/5 | **1/5** | RD's `.timeline-list` is the year-by-year model output the inventory *already* classifies Tier 3, not a feed (`planner.ts:3821`). AW's is the only activity feed. Tier 3, stays local, owed upstream. [24](#corrections-to-the-survey) |
| Avatar | 1/5 | **1/5** | Unchanged, and its one conditional expired: it was to be "built only if the app shell needs one", and `AppShell` shipped in Phase 1 without one. Tier 3, stays local, owed upstream. [25](#corrections-to-the-survey) |

Four of the six leave as Tier 3 — one repo each, recorded as owed upstream per
ADR 0002 rather than dropped, so a second consumer promotes them without a
re-survey. Two leave because an existing component already covers them.

### Design direction for the two survivors

Under the Premises, where repos differ only visually **Keycaps picks one and the
repos change**. Both calls below are made against the Named Rules in `DESIGN.md`,
and in both cases what wins is *not* whichever look is most common — several of
these treatments are the drift this program exists to remove.

**Disclosure — `prose.css`'s treatment wins outright, and none of the three
consumers' does.**

`DESIGN.md` already decided this element by name: under
[the Pressable Edge Rule](../../DESIGN.md), `summary` is a real control, so it
wears the edge and keeps the promise — 3px down, 4px compressing to 1px, from
the same tokens a Button reads, with the padding giving up exactly what the edge
takes so the border box is the same height on every frame. `prose.css` ships that
(`packages/tokens/src/prose.css:587-665`). **All three consumers ship zero press
and zero edge**, so this is not Keycaps choosing between three looks — it is
Keycaps having already published the answer to a surface that could not reach it.

So the component is that CSS re-scoped to a `kc-disclosure` class rather than a
second drawing of it. Redefining the same element twice in one package is the
`.kc-table` failure [correction 18](#corrections-to-the-survey) records, and it
should not be re-committed one component later.

**What shipped went one step further than "re-scoped".** A second copy of the
rules, even one a test compares, is still two blocks that a future edit can part;
and a disclosure could not take the data table's route anyway, because its press
is real and `styles.css` may hold no `:hover` or `:active`. `prose.css` was not
available either — it is opt-in, so a component styled there would be unstyled on
the product surfaces the component exists for. The treatment therefore moved to
`base.css`, the file every delivery mode loads and where the skip link and the
focus ring already live, as **one rule set whose every selector names both
`.kc-prose summary` and `.kc-disclosure > summary`**. There is nothing to compare
because there is nothing to drift. `styles.css` and `static.css` gain no rule at
all, which keeps ADR 0002's guarantee exactly where it was.

Four specifics the builder should not re-decide:

- **The chevron comes from the icon registry, not from a rotated border box.**
  RD draws it twice, identically, out of two `2px` borders on a 7px square
  (`styles.css:1312-1323` and `:2770-2782`). ADR 0003 made the icon set one
  source precisely so a glyph is not re-derived per surface, and a border
  triangle cannot be masked, recolored by tone, or replaced by the registry.
- **The summary takes a label and an optional description.** KN and RD
  independently invented the same two-slot summary — `<span>` plus `<small>`
  (`DetailsDrawer.tsx:243-247`, `planner.ts:4398`). Two repos arriving at one
  shape without coordinating is the strongest evidence a component can get, and
  it is a slot, not a variant.
- **Exclusive accordion grouping is a prop, not a variant.** RD passes
  `name="assumption-section"` to four sibling disclosures (`planner.ts:4397-4410`)
  so opening one closes the rest. That is native `<details name>` behavior and a
  functional difference — one pass-through prop, and one component still doing
  one job.
- **AW's body rule does not survive.** `.technical-detail p` carries
  `border-left: 2px solid var(--divider)` (`workbench-view.css:1633`). Under
  [the Leading Edge Rule](../../DESIGN.md) a weighted inline-start border marks a
  block *quoted from or attributed to* something outside the flow, and a
  disclosure's own body is not quoted from anywhere — it is the thing the summary
  promised. It is also `border-left` rather than `border-inline-start`, so it does
  not flip for RTL. Delete it rather than porting it.

Build this first. It is the highest count of the eight, its treatment is already
designed and shipped, and it is the only entry that degrades honestly with no
JavaScript — a `<details>` opens in Mode 1 as well as Mode 2, so it is the one
Tier 2 component both marketing repos could ever use.

**Modal dialog — `retirement-dashboard`'s treatment wins; `assistant-workbench`
changes.**

The structural half is not a matter of taste. RD uses a native `<dialog>` with
`showModal()` (`planner.ts:4802`, `:5083`), which is where inertness, the focus
trap, Escape, and top-layer stacking come from. AW hand-rolls
`<div role="dialog" aria-modal="true">` over a `hidden` backdrop
(`index.html:368-372`) and re-implements a strict subset: Escape at `:1754`,
initial focus at `:1097`, and **no inertness and no focus trap at all**. Keycaps
builds on the platform primitive.

Where the visual rule genuinely applies, RD still wins, and for a reason worth
stating:

- **Depth.** Under
  [the Overlay Exception Rule](../../DESIGN.md) a dialog is a genuinely detached
  surface and casts in *both* themes. RD declares `--floating-shadow` twice, light
  and dark (`styles.css:75` and `:134`), so its dialogs do. AW's panel takes
  `var(--shadow-plate)` (`workbench-view.css:1549`), and `--shadow-plate` is
  `none` in dark (`ledger.css:201`, `:242`, `:291`) — **AW's dialogs have no depth
  in dark mode**, which is [correction 10](#corrections-to-the-survey) landing on
  a specific component. The Keycaps dialog reads `--kc-shadow-overlay`.
- **The header stays put.** RD's dialogs set `padding: 0` (`styles.css:1443`,
  `:1615`) and make the head `position: sticky` (`:1457`, `:1629`), so the close
  control is reachable at any scroll offset. AW scrolls the whole panel including
  its header (`workbench-view.css:1543-1544`) — its close button leaves the
  viewport in a long dialog. Sticky head, scrolling body.
- **Neither repo's scrim survives.** AW uses `rgb(21 24 29 / 0.68)`
  (`workbench-view.css:1537`), RD `rgba(8, 15, 24, 0.68)` (`styles.css:1453`).
  Both are raw literals that fail the Phase 2 color rule; the token layer ships
  one scrim and neither number is it. Same for RD's `border-radius: 12px` — a
  dialog is a plate that has detached, so it takes `--kc-radius-plate`, and
  anything nested in it takes the Concentric Radius Rule.
- **The component declares its own ceiling.** Both repos already write
  `min(100%, 600px)` and `min(42rem, calc(100vw - 2rem))`. Under the Intrinsic
  Maximum Rule that belongs to the component, so neither repo constrains it from
  outside afterwards.

Two things this component absorbs rather than spawning siblings. **The drawer is
a `placement` prop.** RD's `.assumptions-drawer` is the same `<dialog>` pinned to
the inline-end edge at full height — `margin: 0 0 0 auto`, `height: 100%`,
`width: min(560px, 100%)` (`styles.css:2606-2617`). That is geometry. A sibling
Drawer is "close to never correct" by the Premises, and this is the case that
proves it. **And `renderStatic` must throw on it**, the way it already does on
Select, Popover, and ThemeToggle: a modal that cannot open is not a degraded
dialog, and the Mode 1 exclusion belongs in the build rather than in a note.

**The theme toggle is the one to build first — shipped.** Keycaps has defined the
`data-theme` contract since ADR 0001 and shipped no control, so `assistant-workbench`
and `retirement-dashboard` each wrote one and `knowledge` was about to. That is
3/5, not the 5/5 an earlier draft of this section claimed: `mcp-dnsimple` and
`mcp-unifi` are Mode 1, and Phase 4 says Mode 1 theming is the inline bootstrap
and `prefers-color-scheme` with no runtime. See [correction 14](#corrections-to-the-survey).

Two things it settles for the phases that consume it. Persistence is a prop —
`assistant-workbench` shares a `jflamb-theme` cookie on `Domain=.jflamb.com` with
`enter.jflamb.com` while `retirement-dashboard` stores locally, which is a
functional difference rather than a visual one. And it carries three states
rather than two, because the token layer resolves an unset `data-theme` through
`prefers-color-scheme`: a two-state toggle writes an override on first press and
never lets the reader back to the system default.

### Exit criteria

- Every component above is exported, has a story, a unit test, an axe run, and a
  `docs/component-status.md` row.
- `prose.css` contains no inline SVG data URI; its shapes come from generated
  masks, and `validate:icon-masks` runs in `pnpm check`.
- Rebuilding the masks produces no diff.
- A release is cut, since Phases 5 through 7 consume these from npm.

### Validation

`pnpm check`, unchanged in shape from Phase 1 — including the second
`tests/consumer/` pass under `Node16` with `skipLibCheck: false` that 0.1.3 added,
which is the standing guarantee that new exports carry real types rather than
`any` in a consumer.

### Rollback

Additive: new components, new exports, one rewritten `prose.css` block. The
`prose.css` change is the only edit to existing shipped CSS, and it is revertible
on its own.

---

## Phase 3 — `mcp-dnsimple` (Mode 1) — **shipped**

> **Evidence commit: `jflamb/mcp-dnsimple@d56be82`.** Every consumer citation in
> this section resolves against that commit, and this section must not merge
> until it is on `mcp-dnsimple`'s `origin/main`. This document's own rule is to
> measure a consumer with `git show origin/main:<path>` and never from a working
> tree or a branch — correction 4 of Phase 4's inputs is the whole cost of
> breaking it — and a section marked *shipped* against an open pull request
> breaks it in the same way, one repository over.

**Why first among the consumers:** the smallest surface, one file, already builds
with `tsc`, and it proves the whole Mode 1 path end to end before a second repo
depends on it.

**It does prove it**, and every claim below cites where it is checked rather than
where it was observed.

- **No client React, rendered at startup, once per surface per process.**
  `mcp-dnsimple/src/server.ts:442-466` renders eagerly in `createApp` rather than
  in the request handler and serves the memoised string at `:463-465`, through
  `renderHomePageOnce` (`mcp-dnsimple/src/branding.tsx:604-620`). The cardinality is once *per
  surface* per process, because the memo is keyed on the serialized surface.
  `mcp-dnsimple/tests/home-golden.test.ts:43-67` is the proof, and it counts an
  injected clock's calls rather than comparing timestamps — two uncached renders
  inside one millisecond produce the same ISO string, so a timestamp comparison
  can pass for the wrong reason. `mcp-dnsimple/tests/server.test.ts:83-107` proves the wiring,
  that `createApp` reaches the memo at all, and `:73-81` the weaker claim that
  one app serves every request the same bytes. This is the ADR's own carve-out for this repo — "`mcp-dnsimple` already
  builds with `tsc` and can render at module load"
  ([ADR 0002](../decisions/0002-consumer-delivery.md), line 136) — rather than the
  build-time render the ADR's general statement at line 37 describes; the literal
  module load of `branding.tsx` is too early, because the surface counts come
  from a metadata server `mcp-dnsimple/src/index.ts:18-19` builds during startup.
- **A committed golden**, `mcp-dnsimple/tests/__golden__/home.html`, compared
  against a pinned model in `mcp-dnsimple/tests/home-golden.test.ts:30-41`. The model lives in
  `tests/__golden__/model.json` because the container verifier needs the same
  values and two copies of a fixture drift. The comparison is exact rather than a
  diff with a timestamp normalised out: the page has one value that varies per
  process, and pinning the model removes it.
- **Zero class names outside `kc-`, no page-owned stylesheet, and no page-owned
  visual treatment** — `mcp-dnsimple/tests/server.test.ts:109-176`. Three separate
  assertions, and the third is narrower than an earlier draft of this section
  claimed. The page *does* own CSS: `mcp-dnsimple/src/branding.tsx:131-161` sets inline styles
  for composition — how many cards sit in a row, and how far apart. What it owns
  none of is treatment, and the test holds it there by requiring every inline
  declaration to be a layout property, with the only two exceptions pinned to
  `color:inherit` and `text-decoration:none`. The `<style>` assertion does not
  claim no such element exists, because the Keycaps stylesheets are inlined; it
  claims every one of them is byte-identical to a file this repo did not write.
- **Zero off-origin requests**, at two levels: a response-body tripwire in
  `mcp-dnsimple/tests/server.test.ts:178-200`, and a request interceptor in
  `mcp-dnsimple/tests/e2e/home.spec.ts:110-138`. The same browser test confirms
  Piazzolla, Sofia Sans, and Lilex reach `status: "loaded"` after
  `document.fonts.ready` — the family name alone proves nothing, because a face
  that 404s is still in `document.fonts` with `status: "error"`.
- **Axe-clean in light and dark with no rule switched off**, colour contrast
  included (`mcp-dnsimple/tests/e2e/home.spec.ts:188-199`), plus 320-pixel reflow
  (`mcp-dnsimple/tests/e2e/home.spec.ts:140-150`, the viewport set at `:141`),
  keyboard reach to the skip link (`:39-52`), and the press arriving from the
  inlined `static.css` (`:62-101`) — nine tests, wired into CI
  at `mcp-dnsimple/.github/workflows/e2e.yml`. `quality.yml`'s **check list** is
  untouched as this phase's Validation requires; its trigger is not, because both
  workflows were `pull_request`-only and two commits reached `main` directly
  without either running. Both now also trigger on `push` to `main`.
- **The container** builds, serves the page and all four WOFF2 faces, and is
  checked two ways with deliberately different strengths. Byte-identical to a
  local render, exactly and with nothing normalised, because every input is read
  back out of the container; and equal to the committed golden once five
  deployment values are canonicalised, which is the most that can be asked when
  the golden pins a model no deployment has. Each swap asserts it fired —
  `mcp-dnsimple/scripts/verify-container.mjs` (206 lines; canonicalisation at
  `:75-103`),
  run in CI by the `container` job at `mcp-dnsimple/.github/workflows/e2e.yml:74-95`, which
  invokes it at `:95`. Nothing
  is normalised away: the version and surface counts are read back from the
  container's `/health` and the render timestamp from the served page's own
  `datetime` attribute, so the local render uses the container's own inputs and
  the comparison proves the image runs the same pure function of the same model.
  The same script fails when the committed golden has gone stale against the
  source. This closes the Validation item that asks for a `docker build`, a
  `curl`, and a diff against the golden, which an earlier round of this migration
  had done only by hand and only against a local render.

Two things the phase did not anticipate, and two claims it made that did not
survive contact, are recorded below: the page had a second off-origin request
nobody had counted ([34](#corrections-to-the-survey)), the exit criterion this
phase declared unreachable is reachable ([35](#corrections-to-the-survey)), the
prompt cards have nowhere to link to ([36](#corrections-to-the-survey)), and the
rollback unit is the commit rather than one function
([37](#corrections-to-the-survey)).

It was migrated against published `@jflamb/keycaps-react@0.1.3` rather than a
workspace link, deliberately. `mcp-dnsimple/tsconfig.json` sets
`skipLibCheck: true`, and a linked dependency type-checks against something other
than the artifact npm ships — which is the precise blind spot that let 0.1.2
resolve every export to `any`. `mcp-dnsimple/src/keycaps-contract.ts` (64 lines) is the retained proof: `IsAny`
probes across the root at `mcp-dnsimple/src/keycaps-contract.ts:45-49` and the `./static`
subpath at `:53`, plus two `@ts-expect-error` directives on invalid prop values
at `mcp-dnsimple/src/keycaps-contract.ts:57` and `:61`. Both are
covered by `npm run build` and `npm run typecheck` (`mcp-dnsimple/package.json:11` and `:14`)
because `mcp-dnsimple/tsconfig.json:20` includes the file. It is types-only, covered
by `npm run typecheck` and `npm run build`, and it fails loudly in the right
direction — replacing the invalid variant with a valid one turns the directive
itself into `TS2578`.

### Inputs

- `src/branding.ts`, 1,084 lines. The entire home page — markup, CSS, and an OG
  card — is generated here. `renderHomePage(model)` returns one template literal:
  `<style>` spans lines 106–818, body markup 820–1016, an inline `<script>`
  1019–1081.
- `src/server.ts` mounts it at `app.get("/")` (lines 443–453) and serves
  `/favicon.svg`, `/favicon.ico`, `/favicon.png`, `/og.svg`.
- Build is `tsc`. `tsconfig.json` is `module: Node16`, `moduleResolution: Node16`,
  and **has no `jsx` setting**.
- Deploy is a container: `Dockerfile` copies only `tsconfig.json` and `src/` into
  the build stage and only `dist/`, `node_modules`, and `package.json` into the
  runtime stage.

### Work, in order

**This phase was blocked before step 1, and is not any longer — require
`@jflamb/keycaps-react@^0.1.3`.** The published root entry did not resolve under
`moduleResolution: Node16`, which is what this repo compiles with, so
`import { Button } from "@jflamb/keycaps-react"` type-checked against `any`
rather than failing — the migration would have appeared to work and carried no
type safety at all. 0.1.3 ships a root `.d.ts` this repo can read; the
measurement and the fix are recorded under
[Versioning and release](#versioning-and-release). **Do not start this phase
against 0.1.2 or earlier** — every step below would pass against `any`, which is
indistinguishable from passing correctly right up until a prop is wrong.

1. **Enable JSX and add the dependencies.** Set `"jsx": "react-jsx"` and
   `"jsxImportSource": "react"` in `tsconfig.json`. Add `react`, `react-dom`,
   `@jflamb/keycaps-react`, `@jflamb/keycaps-tokens`, and the React types —
   `@types/react` and `@types/react-dom` are absent today; `react` and
   `react-dom` arrive as auto-installed peers but carry no types of their own.
   Under `moduleResolution: Node16` the *package* `exports` maps resolve
   correctly, and both Keycaps packages declare one; from 0.1.3 the inner half —
   the relative specifiers inside the declarations — resolves too. Pin
   `^0.1.3`, not `^0.1.2`. See the note above this list.
2. **Render at startup.** `branding.ts` already computes its page from a
   `HomePageModel`; keep that contract. Replace the body of `renderHomePage`
   with a `renderStaticDocument` call whose children are Keycaps components. The
   render happens eagerly during startup — `renderHomePage` is already pure over
   its model.

   *Amended after shipping.* This step was titled "Render at module load" and
   read "once per process at first request, or eagerly at module load". The
   title and both halves of the sentence turned out to be loose. The literal
   module load of `branding.ts` is too early, because the tool and prompt counts
   come from a metadata server `index.ts` builds during startup, so the render
   happens in `createApp`. And *at first request* is the
   wrong half to have offered: rendering inside the request handler is
   server-side rendering with a cache, not a static render, and it is what the
   first implementation did. The shipped cardinality is **once per surface per
   process** — the memo is keyed on the serialized surface — which is narrower
   than "once per process" and is what the proof at
   `mcp-dnsimple/tests/home-golden.test.ts:43-67` actually establishes.
3. **Ship the CSS through the same string.** The `Dockerfile` copies only
   `src/`, so a separate `.css` file in the image would silently vanish. Inline
   the three stylesheets — tokens, `styles.css`, `static.css` — into the
   document `<style>` at build time, or add an explicit `COPY` for a generated
   asset directory. **Inlining is the lower-risk choice** and keeps the
   single-file property that makes this repo the easy one.
4. **Fonts.** This repo currently loads Fraunces, Figtree, and JetBrains Mono
   from the Google Fonts CDN (`branding.ts` lines 103–105) and has no local font
   files. Serve the Keycaps WOFF2 files from `@jflamb/keycaps-tokens/fonts/*`
   on an Express static route and drop the CDN links. This is the one repo where
   the font swap also removes a third-party runtime request, which
   `DESIGN.md` forbids outright.
5. **Map the surfaces.** `.btn--primary/--secondary/--ghost` become Button
   variants — as anchors, since these are links, so `LinkButton`. `.prompt-card`
   becomes a linked Card. `.stats` (a `<dl>` of `.stat`) becomes a
   DescriptionList in `grid` layout. `.code-block` with its `.tk-brace`/`.tk-str`
   spans becomes CodeBlock with the syntax-token contract. `.endpoint` rows
   become linked Cards or a DescriptionList — decide by whether they navigate.
   `.skip-link` becomes SkipLink. `.topbar` becomes AppShellHeader.
6. **Author a dark theme.** The page is light-locked: `<meta name="color-scheme"
   content="light">`, `color-scheme: light` on `:root`, a single unconditional
   `theme-color`. Adopting the Keycaps token layer supplies the dark palette for
   free; what has to be written is the `data-theme` bootstrap and a
   `theme-color` with a `media` variant. `.section--dark` is a dark *band inside
   a light page*, not a theme, and does not survive: it becomes a Card or a
   toned section on the plate.
7. **Rewrite the two UI tests.** `tests/server.test.ts` lines 41–65 assert
   literal class names (`github-corner`) and copy strings (`Copy MCP URL`,
   `Prompt examples`, `Build ref`). Replace string-contains assertions with
   structural ones: parse the response and assert on roles and accessible names.
   A test that breaks on every restyle is not protecting anything.
8. **Delete the CSS block** (lines 106–818) and the now-unused class vocabulary.

### Exit criteria

- `src/branding.ts` contains no `<style>` block of its own and no CSS class
  names outside `kc-`.
- The Phase 2 rules pass with an empty allowlist. **Not reachable as written**,
  and this phase owes the fix. `src/branding.ts` carries `FAVICON_SVG` and
  `OG_CARD_SVG` alongside the CSS, and their `fill` and `stop-color` hexes are
  legitimately raw — an SVG cannot read a CSS custom property it is not inside.
  Deleting the `<style>` block clears 50 of the file's 67 findings and leaves 17:
  two in `FAVICON_SVG`, fourteen in `OG_CARD_SVG`, and the unconditional
  `<meta name="theme-color" content="#f5f4ed">` at line 88, which step 6 replaces
  anyway. So the allowlist cannot empty while the two SVG constants share a file
  with the page. Either move them to their own module, which can then carry its
  own narrow allowance and say why, or drive their colors from token values at
  render time — the second is better, because it is the only version in which the
  OG card follows the palette. Pick one during this phase rather than discovering
  it at the exit gate.

  **Met**, by the second option, in `mcp-dnsimple/src/keycaps-assets.ts`. The
  "not reachable as written" verdict was wrong; see
  [correction 35](#corrections-to-the-survey) for how and what it bought.
- The page makes zero off-origin requests. Assert it the way
  `scripts/verify-pages-build.mjs` already does here: fail the test if any
  request leaves the origin.
- Light and dark both render; `prefers-color-scheme` and an explicit
  `data-theme` both work.
- `npm run build` (`tsc`) and the container build both succeed.

### Validation

- Existing `quality.yml` unchanged: lint, `lint:contract`, typecheck, test,
  build, `npm audit --omit=dev`.
- A new test that fetches `/`, runs axe against the response rendered in a
  browser, and asserts zero violations. This repo has no a11y coverage today.
- Reflow at 320 CSS pixels with no horizontal page scroll.
- `docker build` locally, then `curl` the container's `/` and diff the rendered
  markup against the committed golden.

### Rollback

`renderHomePage` keeps its signature throughout, so the rollback unit is one
function. Keep the previous implementation on the branch until the deploy is
verified in dev — `deploy.yml` runs `deploy-dev` before `deploy-prod` and gates
prod on it, which is a free canary. Reverting the commit restores the page with
no data-layer or route changes to unwind.

---

## Phase 4 — `mcp-unifi` (Mode 1)

**Why second:** the same page shape as Phase 3, so the component mapping is
mostly proven, but it adds two genuinely new things — a prerender script for a
site with no build step, and this repo's first dark theme.

### Inputs

- `site/index.html`, 143 lines of hand-authored static HTML, and
  `site/styles.css`, 674 lines. No inline `<style>`, and the page ships **zero
  JavaScript**.

  Both figures are corrections. An earlier draft of this plan said 190 and 816,
  and those files do not exist in the repository: they were read from a local
  checkout sitting on `codex/dependency-audit-remediation`, where `site/` is
  **untracked** — `git status --porcelain -- site/` prints `?? site/` — so the
  on-disk copies match no commit on any branch. Phase 4's inputs are 25% and 17%
  smaller than the plan assumed, and every line number below is derived from
  `origin/main`. The general rule this bought: measure a consumer with
  `git show origin/main:<path>`, never by reading its working tree.
- `.github/workflows/deploy.yml` uploads `site/` byte-for-byte to GitHub Pages.
  There is **no `npm ci` and no build step in the deploy job**.
- `site/` is outside `tsconfig.json`'s include and outside the ESLint globs, so
  the landing page has no automated coverage at all.
- Fonts are self-hosted WOFF2: Fraunces Variable and Nunito Sans 400/600/700 —
  the retired pairing — with one pinned optical axis,
  `font-variation-settings: "opsz" 18, "SOFT" 55` at `styles.css:174`. The plan
  previously named a second pin, `"opsz" 14, "SOFT" 45`; on `origin/main` there
  is no such declaration anywhere in the repository. It is the same
  untracked-working-tree reading as the line counts above.

### Work, in order

1. **Introduce the prerender step.** A `scripts/build-site.mjs` that imports the
   page's component tree, calls `renderStaticDocument`, and writes
   `site/index.html` plus a `site/kc/` asset directory. Add `npm ci` and
   `npm run build:site` to `deploy.yml` before `upload-pages-artifact`. Keep the
   output committed, so a broken build never produces an empty deploy and the
   diff is reviewable.
2. **Decide the source of truth.** `site/index.html` becomes generated output.
   Add it to `.prettierignore`-equivalents and state in the file header that it
   is generated — an editable generated file is a drift source.
3. **Delete the local fonts.** Remove `site/fonts/*.woff2` (four files, ~163 KB)
   and the four `@font-face` blocks at `styles.css` lines 1–31. The
   `font-variation-settings` declaration at line 174 goes with them: Piazzolla's
   `opsz` axis is never pinned, per the Optical Sizing Rule, and `SOFT` does not
   exist on it.
4. **Map the surfaces.** `.site-header` → AppShellHeader. `.hero` → PageHeader
   plus a Card. `.primary-key` → LinkButton. The `.diagnostic` block is a `<dl>`
   of four `.diagnostic-row` — DescriptionList in `rows` layout, `divided`.
   `.runtime-path` is an `<ol>` — keep the list, use tokens. `.prompt-transcript`
   → CodeBlock. `.supported` → a plain list under `prose.css`. `.legal` →
   `.kc-prose`. `.skip-link` → SkipLink.
5. **Author the dark theme.** Same shape as Phase 3: the token layer supplies the
   palette, the work is the `data-theme` bootstrap plus `theme-color` variants.
   Note the page ships no JavaScript today; the no-flash theme script is the
   first script it will carry. Keep it to the inline bootstrap only —
   `prefers-color-scheme` handles the rest with no runtime.
6. **Retire the competing design system.** `.impeccable/design.json` is a
   `schemaVersion: 2` system titled "Design System: mcp-unifi Keycaps", with 24
   colors, 8 typography roles, and five extracted `ds-`-prefixed components. A
   second artifact claiming the Keycaps name is exactly the failure ADR 0002
   exists to prevent. Delete it and the repo-local `DESIGN.md`, and replace both
   with a pointer to this repo.
7. **Fix the one hardcoded hex.** `.confirmation-row dt` at `styles.css:290`
   sets `#6d4e0e` on line 291 — it is `attention-ink` in the design JSON and
   never became a variable. It maps to `--kc-color-warning-text`. (The plan said
   292; that too was read from the untracked working tree.)

### Exit criteria

- `site/styles.css` is deleted or reduced to nothing but `@import`s of the
  Keycaps stylesheets.
- `site/index.html` is generated, and regenerating it produces no diff.
- No font files remain under `site/`.
- `.impeccable/design.json` and the repo-local `DESIGN.md` are gone.
- Zero off-origin requests.
- The Phase 2 rules pass with an empty allowlist.

### Validation

- Extend `quality.yml` with a `build:site` step and a check that the committed
  `site/index.html` matches a fresh render — a `git diff --exit-code` after
  building. This is what stops the generated file drifting from its source.
- Add the first a11y test this repo has ever had: Playwright plus
  `@axe-core/playwright` against the built `site/`, in light and dark, at 320
  and 1280 pixels wide.
- Verify the two in-page anchors still resolve: `#privacy` and `#terms` are
  sections, not separate pages, despite what
  `.impeccable/surfaces/site-index-html.md` claims.

### Rollback

`site/` is deployed byte-for-byte, so reverting the commit restores the exact
previous site with no build involved. Keep the old `styles.css` and the font
files in git history rather than deleting them in a separate earlier commit, so
one revert is sufficient.

---

## Phase 5 — `assistant-workbench` (Mode 2)

**Why third:** it proves Mode 2, and it is mostly deletion. It is also the repo
whose fork this whole program exists to end.

### Inputs

- No root `package.json`; the repo root is a Python project and the web app is a
  self-contained npm island at `apps/web`.
- `apps/web/package.json`: `build` is `tsc --noEmit`, identical to `typecheck`.
  **There is no bundler of any kind** — no Vite, esbuild, Rollup, webpack, or
  PostCSS. `public/` is deployed verbatim; `wrangler.toml` sets
  `pages_build_output_dir = "public"`.
- CI (`.github/workflows/deploy-assistant-web.yml`) never invokes `npm run build`;
  it calls `typecheck` directly. Deploy is
  `npx wrangler pages deploy public --project-name assistant-workbench --branch main`.
- `public/ledger.css`, 293 lines, 95 unique custom properties. Its own header
  names its provenance: "Canonical source: app-auth/src/design/theme.css."
- `public/workbench-view.css`, 1,914 lines. `public/workbench-view.js`, 1,005
  lines, plain script, HTML-string templating with class names hardcoded in JS
  strings.
- `public/index.html` is 1,764 lines, of which 1,370 are one inline
  `<script>` of application JavaScript, plus its own 38-line `<style>` block.
- **A fourth CSS surface:** `functions/approvals/[approvalRequestId].ts`, 1,076
  lines, emits a full document from a template literal with its own inline
  `<style>` carrying a third copy of the press CSS.
- Theme: `data-theme` on `<html>`, set by `public/theme.js:57`, persisted to
  `localStorage` **and a cookie scoped `Domain=.jflamb.com`** under the key
  `jflamb-theme`, shared with `enter.jflamb.com`.

### Work, in order

1. **Introduce Vite.** This is net-new capability, not a swap. Add `vite`,
   `@vitejs/plugin-react`, `react`, `react-dom`, and the Keycaps packages to
   `apps/web`. Build into a new output directory and change
   `pages_build_output_dir` to it. Keep `public/` as Vite's static directory for
   the assets that are genuinely static.
2. **Fix the dead build alias first.** `build` is `tsc --noEmit` and CI never
   calls it. Make `build` actually build, and add it to
   `deploy-assistant-web.yml` before the deploy step. Do this as its own commit —
   it is the change that makes every later commit verifiable.
3. **Delete `ledger.css`.** Not deprecated — deleted, per ADR 0002. Replace it
   with `@jflamb/keycaps-tokens`. Three things have to be preserved across the
   deletion:
   - The `data-theme` contract and the `jflamb-theme` cookie on
     `Domain=.jflamb.com`. This is a **cross-application interface** shared with
     `enter.jflamb.com`; the key name and the attribute are not free to rename.
     `theme.js` survives the migration essentially unchanged.
   - `--font-mono`, a documented workbench-only extension, which becomes
     `--kc-font-mono`.
   - Nothing else. The 40-property compatibility alias block at lines 124–166 is
     near-dead: `--radius-static`, `--radius-tag`, `--radius-control`,
     `--radius-selectable`, `--radius-pill`, `--control-min-block-size`,
     `--focus-ring`, `--focus-ring-offset`, `--shadow-overlay`, `--font-prose`,
     and `--font-ui` have **zero** uses in `workbench-view.css`. Delete it
     outright rather than migrating it.
4. **Reconcile the three drifts the token swap fixes for free.**
   - `--control-min-block-size: 50px` against the system's 44px floor. The 50px
     is deliberate here and recorded in the repo's own `design-qa.md`, but it is
     not the system's number. Adopt 44px; the Keycaps Button already meets the
     target-size requirement at 44.
   - `--shadow-overlay: var(--shadow-plate)`, which becomes `none` in dark — so
     the workbench has **no overlay depth in dark mode at all**. The Overlay
     Exception Rule says a detached surface casts in both themes. Fixed by
     adopting `--kc-shadow-overlay`.
   - `--color-status-neutral: var(--success-text)` — "neutral" aliased to the
     mint success token. Do not migrate by name; map `.tag-neutral` to Badge's
     `neutral` tone and `.tag-success` to `success`.
5. **Convert page by page, as islands.** Order by size, smallest first:
   `sign-in`, then `runs/latest`, `bills`, `orders`, `activity`, `approvals`,
   then `index.html`. Each of the six app pages already carries
   `data-view` on `<body>` and a single render entry point in
   `workbench-view.js` — that switch (lines 988–1004) is the natural island
   boundary. Replace one `render*()` at a time.
6. **The three SMS legal pages** are static with no JS and load `sms/legal.css`
   (347 lines). They are `prose.css` plus PageHeader, and they are the cheapest
   win in the repo. Note `legal.css:153` and `:195` put a weighted bottom edge on
   `.summary-card` and `.campaign-collateral`, both static — false affordances
   under the Pressable Edge Rule, removed by the conversion.
7. **`functions/approvals/[approvalRequestId].ts`.** This is the highest-risk
   item and it is invisible to any `public/`-scoped migration. It is a Pages
   Function emitting a whole document, so it is a **Mode 1 surface inside a Mode
   2 repo**: render it with `renderStaticDocument` at build time or at request
   time, and delete its inline `<style>`. Its copy of the press CSS
   (lines 205, 214, 217–218) goes with it, as does the false affordance at
   line 361.
8. **Reconcile the two parallel button systems.** `.button-primary/-secondary/-destructive`
   classes and `.action-button[data-tone="primary"|"destructive"]` coexist. Both
   map onto Button's `variant`. Pick the mapping once and apply it in
   `workbench-view.js`, where the class strings are emitted.
9. **The two press scales.** `.button`/`.action-button` already implement the
   canonical press exactly — 3px travel, `var(--edge-w)` → 1px, 120ms. Only
   `.icon-button`/`.operator-menu` diverge, at 2px travel with a 3px → 1px edge
   on a 42px control. Both become Button, which resolves it; the icon-only case
   becomes `iconOnly` at the system's 44px.
10. **`.brand-mark`** carries a 3px bottom edge on a static `<div>`
    (`workbench-view.css:153`) — another false affordance. It becomes a plain
    seated object with no edge.

### Exit criteria

- `public/ledger.css` deleted. `@jflamb/keycaps-tokens` is the only source of
  custom properties in the app.
- `public/workbench-view.css` deleted or reduced to layout that is genuinely
  app-specific — the `order-*`, `bill-*`, `feed-*`, and `health-*` vocabularies
  are the expected residue, and each remaining rule must use `--kc-` tokens
  only.
- No inline `<style>` in `public/index.html` or in
  `functions/approvals/[approvalRequestId].ts`.
- `npm run build` produces the deployable directory and CI runs it.
- The Phase 2 rules pass with an empty allowlist.
- Theme sync with `enter.jflamb.com` still works — verify by setting the cookie
  on one and reading it on the other.

### Validation

- The existing three axe assertions in `e2e/operator-approvals.spec.ts` and
  `e2e/reliability-watchdog.spec.ts` must stay green. They are the entire
  automated visual safety net today, and they are not enough: **there are no
  visual-regression snapshots and no computed-style assertions anywhere**, so a
  migration could change every pixel and CI would stay green.
- Therefore add, before starting: Playwright screenshots of all ten pages in
  light and dark at 320, 768, and 1280 pixels, committed as the pre-migration
  baseline. Review the diffs page by page. They are expected to be large; the
  point is that they are *reviewed*, not that they are empty.
- `npm run format` is `prettier --check .` and is enforced in CI, so migration
  output must satisfy Prettier.
- `design-qa.md` records a passing manual QA across 32 visual states. Re-run it.
- `design-qa.md` lines 48–49 treat IDs and classes used by `auth.js` and
  `workbench-view.js` as a behavioral contract. Grep both files for every class
  removed and confirm no selector breaks.

### Rollback

Per page, because the conversion is per page. Until the last page converts,
`public/` still contains the previous HTML and CSS, so reverting one page's
commit restores it. The riskiest single revert is step 1 — changing
`pages_build_output_dir` — which is one line in `wrangler.toml`. Cloudflare Pages
keeps prior deployments, so a bad deploy also rolls back from the dashboard
without a git operation.

---

## Phase 6 — `knowledge` (Mode 2)

**Why fourth:** already React 19 and Vite, so this is pure component adoption.
The real work is its first dark theme and unwinding the token layer.

### Inputs

- React 19.2.8, Vite 8.2.1, Tailwind v4.3.3 via `@tailwindcss/vite`,
  TypeScript 7.0.2, `lucide-react` 1.25.0 as a runtime dependency.
- **One CSS file:** `src/styles.css`, 3,712 lines.
- The Tailwind `@theme` block (`src/styles.css:3-9`) declares exactly three
  tokens, and two of them — `--color-brand-950` and `--color-action-600` — are
  **never referenced anywhere in the repo**. Only `--font-sans` is consumed.
- The real tokens are a plain `:root` block at `src/styles.css:11-39`: 22 flat
  custom properties, **no spacing scale and no type scale**.
- **Tailwind utility usage is effectively zero.** A scan of the 174 `className`
  attributes across `src/App.tsx` and `src/components/*.tsx` found no standalone
  Tailwind utilities. Tailwind is installed and imported and the app is styled
  entirely by hand-written semantic classes.
- Light-mode only, confirmed: `grep -rn "data-theme\|prefers-color-scheme"`
  across `*.ts`, `*.tsx`, `*.css`, `*.html` exits 1 with no output.
- 14 components, 2,920 lines. `src/App.tsx` is another 849.

### Work, in order

1. **Author the dark theme first, before any component swap.** This is greenfield
   — there is no theme scaffold to extend. Adopt `@jflamb/keycaps-tokens`,
   remove `color-scheme: light` (`styles.css:12`) and the hardcoded
   `background: #fff` on `body` (`styles.css:55`), and add the `data-theme`
   bootstrap. Doing this first means every subsequent component swap is verified
   in both themes as it lands.
2. **Delete the `@theme` block.** Two of three tokens are dead; the third is a
   font stack the Keycaps token layer replaces. Tailwind's `@import "tailwindcss"`
   can stay for now — it costs nothing given zero utility usage — but it should
   be removed by the end of the phase, along with `@tailwindcss/vite`, since
   keeping a second styling system installed is a standing invitation to drift.
3. **Replace `Button.tsx` rather than porting it.** It is 10 lines with four
   declared variants of which **three have no CSS at all** — `.button--secondary`,
   `.button--danger`, and `.button--ghost` are never defined, and `secondary` is
   the default. It has **one call site**, `src/App.tsx:192`. Treat it as
   greenfield. The name mapping is `primary → primary`, `secondary → secondary`,
   `ghost → quiet`, `danger → danger`.
4. **Pick one icon system.** `lucide-react` is imported in 10 files and
   `src/components/Icons.tsx` hand-rolls 11 more. Keycaps ships the status icons
   the Tone Trio Rule requires and the chevron and close glyphs; everything else
   stays on lucide. Delete `Icons.tsx`.
5. **Map the surfaces.** `.knowledge-shell` → AppShell. `.knowledge-header` →
   AppShellHeader. `.search-field` + `.search-field__clear` → SearchField.
   `.chat-composer` → Field with `multiline`. `.metadata-list` →
   DescriptionList. `.browse-workspace__empty`, `.empty-copy`, `.chat-empty` →
   EmptyState. `.app-alert` and `.prototype-notice` → Banner. `.knowledge-state--*`
   → Badge with `icon`. `.icon-control` and `.star-control` → Button with
   `iconOnly`. `.vault-inline-action` → Button `variant="link"`. `.home-update`
   → linked Card. `.markdown-article` → `.kc-prose`. `.topic-select` → Select.
   `.skip-link` → SkipLink.
6. **Leave the genuinely novel components local**, per Tier 3: `VaultWorkspace`
   (673 lines) and `SafeVegaLiteChart` (269). They need tokens and type, not
   components. Record each in the repo's adoption notes as owed upstream, per
   ADR 0002, and confirm neither uses the `kc-` prefix.

   **`KnowledgeNavigation` (365 lines) and `DetailsDrawer` (350) are neither Tier
   3 nor Phase 2a builds**, and both earlier answers were reached from repo
   counts rather than from the markup. Correction 13 moved them here on a 2/5
   count; the Phase 2a survey read both implementations and found each is an
   existing component's case:

   - `KnowledgeNavigation` is a flat sidebar of grouped filter buttons with no
     tree affordances of any kind. It becomes `AppShellSidebar` +
     `AppShellNav` + `AppShellNavLink`, which shipped in Phase 1. Its group
     headings and its `.knowledge-nav__count` are the two extensions Phase 2a
     records at 2/5; its collapse control is 1/5 and stays local.
   - `DetailsDrawer` is not an overlay on the surface it was designed for — it is
     the shell grid's third column (`src/styles.css:285`), non-modal, going
     `position: fixed` only under the narrow-viewport block. It becomes
     `AppShellSidebar` too, on the inline-end side.

   See [correction 20](#corrections-to-the-survey) and
   [correction 21](#corrections-to-the-survey). `VaultWorkspace` and
   `SafeVegaLiteChart` remain Tier 3 correctly, and this phase now also carries
   `.account-avatar` (`src/App.tsx:208`) and the three text loading states as
   Tier 3 — local, and recorded as owed upstream.
7. **Normalize the class naming that survives.** The repo currently mixes BEM
   (`search-field__clear`), modifier-BEM (`knowledge-state--attention`), flat
   semantic (`empty-copy`), and state classes (`.is-starred`). Anything that
   survives should pick one.
8. **Add ESLint and Prettier.** This repo has neither — no config files, no
   dependencies — while `retirement-dashboard` enforces both in CI. A shared
   design system across repos with different formatting floors produces diffs
   nobody can read.

### Exit criteria

- Dark theme works: system preference and explicit `data-theme`, both directions.
- `src/styles.css` is materially smaller, and every remaining rule uses `--kc-`
  tokens.
- `@theme` block and `@tailwindcss/vite` removed.
- `Icons.tsx` deleted.
- The Phase 2 rules pass, with an allowlist covering only the four Tier 3
  components.
- The four local components are recorded as owed upstream.

### Validation

- `npm run check` (`prototype:verify`, `knowledge:verify`, `tsc -b`), `npm test`,
  `npm run build`, `npm run test:e2e`, and `npm audit --audit-level=moderate` —
  all already in `ci.yml`.
- `e2e/accessibility.spec.ts` exists and uses `@axe-core/playwright`. Extend it
  to run in dark as well as light — the dark theme is net-new and has never been
  audited.
- Only two of 26 test files are component tests, and neither covers `Button.tsx`.
  Add component tests as each surface converts rather than at the end.

### Rollback

Component-by-component, since each swap is a self-contained edit to one `.tsx`
file plus the deletion of its CSS block. Step 1 (the theme) is the only
repo-wide change; it is additive to the token layer and reverts as one commit.
Cloudflare Pages keeps prior deployments.

---

## Phase 7 — `retirement-dashboard` (Mode 2)

**Why last:** largest, most distant, and it needs the most Tier 2 components. It
is also the only repo whose surface is genuinely dense data UI, which is why the
Tier 2 build is scoped by what this repo needs rather than built up front.

### Inputs

- Vanilla TypeScript, no React and no `@vitejs/plugin-react`; `vite.config.ts`
  has **no `plugins` array at all**. Vite is `^8.2.1`, matching `knowledge` and
  the consumer fixture — it was `^7.0.0` when this plan was written, and the
  major gap that created is closed. See [Versioning and
  release](#versioning-and-release).
- `src/ui/` is 27 files and 4,635 lines of pure `string`-returning template
  builders, all escaped through one shared `escapeHtml` in `src/ui/escape.ts`.
  `src/planner.ts` is another **5,439 lines** holding the bulk of the markup and
  state. The real UI surface is roughly 10,200 lines, of which only 45% is
  factored into `ui/`.
- **CSS is 6,783 lines across four files**, not 4,912: `src/styles.css` (4,912),
  `src/print.css` (1,253), `src/ledger-preview.css` (499), `src/auth.css` (119).
- Tokens are the mature set of the five: a 9-step type ramp (`--text-2xs` …
  `--text-3xl`), a 4px spacing grid with `--space-7` deliberately skipped,
  semantic surfaces, and inline comments recording measured contrast ratios.
- Dark theme is complete and `data-theme`-driven, applied by
  `applyTheme(theme, root)` in `src/ui/theme.ts:25-28`, storage key
  `retirement-dashboard-theme` (`theme.ts:13`), with a blocking FOUC guard in
  `index.html:7-21` that **duplicates the storage key as a literal** because it
  cannot import the constant.
- 17 tables, 5 native `<select>` (all in one block, `planner.ts:2710-2714`), 3
  native `<dialog>`, a Chart.js layer, and a real Web Worker for the Monte Carlo
  model (`planner.ts:1849`).
- A bundle-splitting scheme routes anything named `planner` into
  `protected-assets/`, audited by `npm run test:artifact`. Any bundling change
  must keep that audit passing.

### Work, in order

1. **Confirm Phase 2a shipped the components this repo consumes.** The Tier 2
   build moved out of this phase and into 2a, where it is scoped by a survey of
   what each repo's markup actually renders rather than by this repo's surface.
   What this phase takes from it is shorter than the earlier draft assumed:

   - **Data table** — 17 tables plus `.table-scroll`, which does *not* already
     carry `tabindex="0"`; see [correction 19](#corrections-to-the-survey) and
     the two tests it obliges this phase to update.
   - **Modal dialog** — three `<dialog>` elements, of which
     `.assumptions-drawer` is the third. It takes the same component with a
     `placement` prop rather than a Drawer;
     [correction 20](#corrections-to-the-survey).
   - **Disclosure** — 9 sites, including the four-way exclusive accordion at
     `src/planner.ts:4397-4410` that the component's `name` prop covers.
   - **Theme toggle**, already shipped.
   - **`AppShellSidebar`/`AppShellNav`/`AppShellNavLink` for `.plan-rail`** —
     shipped in Phase 1, not built in 2a. Its group label and its
     `.plan-rail-badge` are the two extensions 2a records;
     [correction 21](#corrections-to-the-survey).

   Not coming from 2a at all, because each has one consumer and stays local:
   the segmented control (`src/planner.ts:1256`, 9 call sites — this repo is the
   only consumer, so it is owed upstream rather than owned by Keycaps), the
   `.tl-*` year timeline, and loading, which this repo does not implement.
   See corrections [22](#corrections-to-the-survey) and
   [24](#corrections-to-the-survey).
2. **Add React and the plugin.** `react`, `react-dom`, `@vitejs/plugin-react`,
   and a `plugins: [react()]` array. Verify `npm run test:artifact` still passes
   — the `protected-assets/` split is enforced by an AST audit and a new plugin
   changes chunk naming.
3. **Re-skin before rewriting.** The inventory is right that the re-skin, not
   React, is the expensive part. Land the token swap across all four stylesheets
   as its own change, with no markup touched: `--text-*` → the Keycaps ramp,
   `--space-*` → `--kc-space-*`, the green accent → the Keycaps palette. This is
   the change with the largest visual delta and the smallest behavioral risk, and
   isolating it makes the screenshot review tractable.
4. **Then mount islands**, one container at a time, replacing `src/ui/` builders
   with components. Order by leverage: `cards.ts` (23 lines) and `format.ts` are
   trivial; `planHistory.ts` and `tillerPicker.ts` are the two dialogs — three
   with the `assumptionsDrawer` at `planner.ts:4382`; `holdings.ts`,
   `planViews.ts`, and `planInsights.ts` are the tables.
5. **Keep what should stay.** Chart.js, the canvases, the sparklines and bullet
   charts, the year timeline's `.tl-*` layer, and the worker are Tier 3. They
   need tokens and type, not components. `src/ui/timeline.ts`, `theme.ts`, and
   `format.ts` export pure logic with no markup and survive untouched.
6. **Preserve the escape discipline.** Every `innerHTML` sink currently depends
   on the caller remembering `escapeHtml()`. React removes that hazard where it
   lands — but any builder that survives still needs it, so the migration must
   not leave a half-escaped module. Convert whole modules, never half of one.
7. **Fix the duplicated storage key.** `index.html:9` hardcodes
   `"retirement-dashboard-theme"` because the FOUC guard cannot import
   `theme.ts:13`. Generate the inline script from the constant at build time, or
   add a test asserting the two strings are equal.
8. **Delete the print stylesheet's dark overrides carefully.** `print.css:25` and
   `:251` force dark back to light for printing; `prose.css` already ships a
   print block that does the same job for prose, but the app surfaces need their
   own. Do not delete before the replacement exists.

### Exit criteria

- Tier 2 components exist in Keycaps, documented and released, before any
  markup here changes.
- All four stylesheets use `--kc-` tokens only, with an allowlist covering the
  nine `--chart-*` series colors and nothing else.
- `npm run test:artifact` passes — the `protected-assets/` split is intact.
- Coverage thresholds still met: `src/model/**` at lines 90, functions 90,
  branches 80, statements 90, enforced on every `npm test`.
- The Phase 2 rules pass.

### Validation

- `check.yml`'s five parallel jobs unchanged: `quality` (format, typecheck, lint,
  build), `unit`, `d1`, `browser` across `desktop-chromium` and
  `mobile-chromium`, and the `check` aggregator.
- **`src/ui/**` and `src/planner.ts` are excluded from coverage entirely** — the
  4,635-line UI layer and the 5,439-line planner carry no floor. Add coverage for
  every module as it converts; do not inherit the exclusion.
- Screenshot baselines before starting, same as Phase 5, across both Playwright
  projects and both themes.
- `test:a11y` here is a `--grep "accessibility|WCAG"` over the single spec rather
  than a dedicated file. Give it a real spec, as `knowledge` has.

### Rollback

Per module, since each `src/ui/` file is a self-contained set of pure functions
with a `string` return type. Step 3 — the token swap — is the one change that
touches everything, and it is CSS-only: reverting it restores the previous
appearance without touching a line of TypeScript. Step 2 (adding the React
plugin) is the riskiest for the build, and `test:artifact` is the gate that
catches it.

---

## Cross-cutting workstreams

These run across phases rather than inside one.

### Typography

All five repos need a font swap. Keycaps is on Piazzolla / Sofia Sans / Lilex as
of `f86c6f6`.

| Repo | Current | Delivery |
| --- | --- | --- |
| `assistant-workbench` | Fraunces Variable + Nunito Sans 400/600/700 | local WOFF2 in `public/fonts/` |
| `mcp-unifi` | Fraunces Variable + Nunito Sans 400/600/700 | local WOFF2 in `site/fonts/` |
| `mcp-dnsimple` | Fraunces + Figtree + JetBrains Mono | **Google Fonts CDN** |
| `retirement-dashboard` | Aptos, Segoe UI Variable | no webfont at all |
| `knowledge` | Inter | via `--font-sans` |

Two things the inventory did not surface. `mcp-dnsimple` fetches its fonts from a
third-party CDN, which `DESIGN.md` forbids outright — so its font swap is a
security and privacy fix, not only a visual one. And `retirement-dashboard` loads
no webfont, so most non-Windows readers have been falling through to
`ui-sans-serif`; adopting Keycaps is the first time that surface has a
guaranteed face.

Two hazards:

- **Static faces cannot reach the role weights.** `assistant-workbench` has only
  static Nunito Sans 400/600/700 on disk, so `DESIGN.md`'s 580/640/760 are
  unreachable there today. Deleting those files and adopting the variable
  Keycaps faces is what makes the Optical Weight Rule implementable.
- **Pinned optical axes must go.** `assistant-workbench` pins `"opsz" 11` on
  panel titles; `mcp-unifi` pins `"opsz" 18, "SOFT" 55` once, at
  `site/styles.css:174` — one declaration on `origin/main`, not the two this
  plan first recorded.
  The Optical Sizing Rule forbids pinning `opsz`, and `SOFT` does not exist on
  Piazzolla at all — a `font-variation-settings` referencing it fails silently,
  which is the intended cost under the No Faux Type Rule but still leaves a
  useless declaration behind. Grep for `font-variation-settings` in every repo
  and delete every occurrence.

### Dark theme

Three of five have it; two do not.

| Repo | State | Contract |
| --- | --- | --- |
| `assistant-workbench` | complete, and triplicated | `data-theme` + `jflamb-theme` cookie on `Domain=.jflamb.com` |
| `retirement-dashboard` | complete | `data-theme` + `retirement-dashboard-theme` in `localStorage` |
| `knowledge` | **none** | greenfield |
| `mcp-unifi` | **none** | greenfield |
| `mcp-dnsimple` | **none** | greenfield |

`assistant-workbench` writes its dark palette **three times** —
`ledger.css:169-203`, a second `prefers-color-scheme` block at `205-214`, and
`:root[data-theme="dark"]` at `217-249` — and its light palette twice
(`251-284`). That triplication is on its own the strongest argument for the
token swap, and it disappears entirely when `ledger.css` is deleted.

The cookie is a cross-application contract with `enter.jflamb.com`. It survives
the migration unchanged. Nothing in this program renames it.

### Icons

Keycaps shipped two icons — `ChevronDownIcon` and `CloseIcon` — against a Tone
Trio Rule that requires a **distinct icon shape per tone**. Phase 1 closes that
by shipping the four status shapes, drawn from the same paths `prose.css` already
masks, so a callout in an article and a badge in an app are one glyph.

**The rest of this section is superseded by [ADR 0003](../decisions/0003-icons.md),
and the position it reversed is left standing below rather than edited away.**

Keycaps adopts Phosphor: path data vendored into a registry, rendered inline by a
component, and generated into `mask-image` custom properties that `prose.css`
consumes. `lucide-react`, the vendored `lucide.min.js`, and `knowledge`'s
`Icons.tsx` all retire. Every phase from 3 onward carries an icon-mapping step,
and Phases 5 and 6 carry a deletion.

The superseded position, for the record: *"Everything else stays local.
`knowledge` keeps `lucide-react`; `assistant-workbench` keeps its vendored
`lucide.min.js` at `public/vendor/lucide.min.js`. Keycaps does not become an icon
library — it ships only the glyphs its own rules require."* It was wrong on this
program's own terms — two icon runtimes and a hand-rolled set across five repos
is divergence that no rule happened to name — and it left the Tone Trio Rule with
two independent shape sources, one in `prose.css` and one in the components.

### Versioning and release

Packages publish only from a GitHub Release. Until Phase 2 lands the
dependency-update configs, a fix here reaches nothing until five `package.json`
files are bumped by hand, and consumers fall behind at different rates — which is
divergence by version rather than by code.

Two version conflicts to plan around, both discovered in the survey and neither
in the inventory:

- **TypeScript 7.0.2 in `knowledge` and Keycaps against ^5.8 in
  `retirement-dashboard` and ^5.6/^5.7 in the two MCP repos.** Two majors apart.
  The Keycaps packages ship `.d.ts` from TypeScript 7; verify they resolve under
  5.x before Phase 3, or the first Mode 1 repo fails at `tsc`.

  **Verified, and the answer is no.** Both MCP repos resolve TypeScript 5.9.3
  today (`npx tsc --version`). Against `0.1.2`:

  - `@jflamb/keycaps-tokens` resolves. Its `dist/index.d.ts` is `export {}` —
    there is no runtime API to break.
  - `@jflamb/keycaps-react/static` resolves, completely.
    `renderStatic`, `renderStaticDocument`, and `StaticRenderError` all arrive
    with their real shapes, because `dist/static.d.ts` imports nothing but
    `react`.
  - `@jflamb/keycaps-react` — the root entry, and every component prop type with
    it — **does not resolve**. `dist/index.d.ts` is a barrel of fifteen
    extensionless relative re-exports (`export { … } from "./components/Button"`)
    inside a package declaring `"type": "module"`. Under `moduleResolution:
    Node16` or `NodeNext` that is exactly fifteen TS2834 errors: *relative import
    paths need explicit file extensions in ECMAScript imports*. A sixteenth waits
    in `dist/components/Badge.d.ts` (`../icons`) and is never reached, because
    resolution already stopped at the barrel.

  The failure mode is worse than an error, because both MCP repos set
  `skipLibCheck: true`. That suppresses all fifteen and leaves every root
  export typed as `any` — silently. `ButtonVariant` is assignable to `0`. A
  Phase 3 migration would compile, deploy, render correctly, and carry no type
  safety on a single component prop. The runtime is unaffected: `dist/index.js`
  and `dist/index.cjs` are bundled by `tsup` and contain no relative specifiers
  at all, so `import("@jflamb/keycaps-react")` works in Node. This is types-only,
  which is exactly why nothing has noticed it.

  Nor is it really about TypeScript 7 versus 5. The cause is this repo's
  declaration emit: `tsconfig.base.json` sets `moduleResolution: "Bundler"`,
  `packages/react/tsconfig.build.json` inherits it, and `tsc` faithfully
  preserves the extensionless specifiers the source is entitled to use under that
  setting. TypeScript 5 building the same tree would emit the same thing. The
  package is consumable by a bundler-resolving consumer and not by a
  Node16-resolving one — and the two Mode 1 repos, the ones Phases 3 and 4
  migrate, are both Node16.

  `tests/consumer/` did not catch it for the same reason: it extends
  `tsconfig.base.json`, so it type-checks under `Bundler` too. **The fixture
  resolves differently from every repo it claims to be the reference
  implementation for.** Extending it to typecheck a second time under
  `Node16` is the check that would have caught this before publication, and it
  belongs beside the Vite-major gap already recorded below.

  The fix is in `packages/react`, not in a consumer: emit a root `.d.ts` a
  Node16 consumer can read — bundle the declarations with the same `tsup` run
  that already bundles the JavaScript, or write explicit extensions in the
  barrel — then release it. Until that ships, **Phase 3 is blocked**, and no
  consumer-side setting is a legitimate way around it: switching an MCP server to
  `moduleResolution: Bundler` would be describing the wrong runtime to make an
  error disappear.

  **Shipped in 0.1.3. Phases 3 and 4 are unblocked.** Of the two candidate
  fixes above, the second is the one that landed. The first is not available:
  `tsup`'s declaration path is `rollup-plugin-dts`, which is written against the
  TypeScript 5 compiler API and dies against this repo's 7.0.2 with `Cannot read
  properties of undefined (reading 'useCaseSensitiveFileNames')`. Bundling
  declarations would mean pinning a second TypeScript purely to emit them, which
  trades a resolution bug for a version-skew bug.

  So the `.js` extensions are written in `packages/react/src/` — all sixteen,
  and every other relative specifier in the package besides — where TypeScript,
  esbuild, and Vite all map them back to `.ts`/`.tsx`, so one spelling satisfies
  the build, the tests, and Storybook alike. `packages/react/tsconfig.build.json`
  now sets `module` and `moduleResolution` to `NodeNext`, which turns a missing
  extension into a TS2835 build failure in this repository rather than a silent
  `any` two repos downstream. The runtime is untouched: every artifact `tsup`
  emits for 0.1.3 is byte-identical to 0.1.2's.

  Confirmed against the packed 0.1.3 tarball under **TypeScript 5.9.3** — the
  version both MCP repos resolve — with `Node16` and `skipLibCheck: false`: no
  resolution errors, and `ButtonVariant` arrives as its real union. The probe
  that compiled clean against 0.1.2, `export const bad: 0 = someButtonVariant`,
  is now the only error in the file. It fails the same way under
  `skipLibCheck: true`, which is what the MCP repos actually set.

  The fixture gap called out above is closed too: `tests/consumer/` now
  type-checks a second time under `module`/`moduleResolution: Node16` with
  `skipLibCheck: false`, wired into `pnpm check`, alongside assertions that the
  exports carry real types rather than `any` — a guard that still fires under
  `skipLibCheck: true`. Proven by reverting the fix before release: the build
  fails at TS2835, and with the old build config restored the packages build
  clean while the new consumer pass fails with the original fifteen TS2834s.
  Treat that second pass as the standing guarantee behind the Phase 3 and
  Phase 4 exit criteria. The Vite-major gap recorded below is closed too.
- **Vite ^7 in `retirement-dashboard` against 8.1.5 in `knowledge`.** Only
  matters for the Storybook/consumer fixture parity, but it means
  `tests/consumer/` proves the package against one major and not the other.

  **Closed by moving forward rather than by testing both.** The choice this
  bullet posed — extend the fixture to build under both majors, or accept an
  unproven combination in Phase 7 — had a third answer: remove the second major.
  `retirement-dashboard` is on `^8.2.1` and `knowledge` is on `8.2.1`, the
  version `tests/consumer/` already built with, so the fixture now proves the
  package against the exact version every consumer runs. Phase 7 carries no
  unproven Vite combination.

  Two things worth carrying into Phase 7, both found by doing it:

  - **Vite 8 replaces Rollup with Rolldown, and `retirement-dashboard`'s
    `protected-assets/` split survived it unchanged.** That split is a security
    boundary, not a packaging preference — `build.rollupOptions.output` still
    drives `chunkFileNames` and `assetFileNames`, and `_routes.json` still
    routes the planner and worker bundles behind authentication. This was the
    single largest risk in the upgrade and it did not materialize.
  - **Vite 8 minifies colors Vite 7 passed through**, folding
    `rgba(107, 114, 128, 0)` into `#6b728000`. That broke the private bundle
    audit, which matched numeric fingerprints as plain substrings and read four
    hex characters as a household figure. Nothing leaked; the audit now requires
    non-alphanumeric boundaries on numeric matches. Relevant to Phase 7 because
    the CSS work in that phase runs through the same minifier — expect
    `rgba()` and `color-mix()` in the token layer to come out as hex, and do not
    let any check downstream assume otherwise.

  Vite 8 also forwards browser console errors to the terminal where Vite 7
  forwarded none. That surfaced a pre-existing caught `TypeError` in
  `retirement-dashboard`'s saved-plan path, filed separately. Phase 7 should
  expect the same effect: latent client-side errors in that repo become visible
  for the first time, and they are pre-existing rather than migration damage —
  confirm before attributing any of them to Keycaps.

### The two-scale press question

`assistant-workbench` runs two press scales: the canonical 3px / 4px→1px on
`.button` and `.action-button`, and a 2px / 3px→1px on `.icon-button` and
`.operator-menu`, which are 42px controls. The second is internally coherent —
the cap descends exactly as far as its wall shrinks, so the physics rule holds —
it is simply not documented and has no tokens.

The migration resolves it by making both Button. But it raises a real question
for the system: **does Keycaps want a small press scale?** The `small` Button
size is 36px and currently presses at the full 3px. That is 8% of its height
against 7% for a 44px key, so it is defensible as-is. Recorded here as an open
question rather than a task; nothing in this program depends on the answer.

---

## Corrections to the survey

Found while grounding this plan. Each contradicts
[the component inventory](component-inventory.md) or an ADR, and each is stated
here rather than silently corrected there.

1. **`mcp-dnsimple` does not ship fonts locally.** The inventory says three
   repos "ship the old WOFF2 files locally." Only `assistant-workbench` and
   `mcp-unifi` do. `mcp-dnsimple` loads Fraunces, **Figtree**, and JetBrains
   Mono from the Google Fonts CDN (`src/branding.ts` lines 103–105) and has no
   font files on disk. This is a live violation of the no-runtime-fetch rule and
   raises the priority of its font swap.

2. **`assistant-workbench` has a fourth CSS surface the inventory does not
   mention.** `apps/web/functions/approvals/[approvalRequestId].ts` is 1,076
   lines and emits a complete HTML document with its own inline `<style>`,
   including a third copy of the press CSS. It is invisible to any migration
   scoped to `public/`, and it is a Mode 1 surface inside a Mode 2 repo.

3. **The `assistant-workbench` press drift is narrower than ADR 0002 states.**
   ADR 0002 says "its press travels 2px against the 3px `DESIGN.md` specifies."
   That is true of `.icon-button` and `.operator-menu` only
   (`workbench-view.css:288-292`). `.button` and `.action-button` implement the
   canonical press exactly — `translateY(3px)`, `border-bottom-width: var(--edge-w)`
   → `1px`, 120ms (`workbench-view.css:623-660`). The fork drifted in one place,
   not everywhere.

4. **`.quiet-table` is not in `retirement-dashboard`.** The inventory's data
   table row attributes `.table-scroll`/`.quiet-table`/`.sensitivity-table` to
   RD. `.quiet-table` returns zero hits across all four of its stylesheets and
   all of its TypeScript. It exists in `assistant-workbench`
   (`workbench-view.css:1108`). RD's actual table classes are `.now-table` (9
   uses), `.sensitivity-table`, `.drift-table`, `.conversion-table`,
   `.early-death-table`, `.print-inputs-table`, `.tl-table`, and
   `.payroll-reference-table`.

5. **`retirement-dashboard` has 6,783 lines of CSS, not 4,912.** The 4,912
   figure is `src/styles.css` alone. `src/print.css` adds 1,253,
   `src/ledger-preview.css` 499, and `src/auth.css` 119. Phase 7's scope is
   38% larger than the inventory implies.

6. **`knowledge`'s Tailwind `@theme` block is nearly empty and mostly dead.**
   The inventory lists it as one of three token namespaces to reconcile. It
   declares three tokens (`src/styles.css:3-9`); two of them are referenced
   nowhere in the repo. The reconciliation work is the plain `:root` block at
   lines 11–39, and Tailwind utility usage across the app is effectively zero —
   so removing Tailwind is nearly free.

7. **`knowledge`'s local `Button` is not a component to port.** The inventory
   describes it as "one variant away from Keycaps'." It is 10 lines, three of
   its four variants have **no CSS defined anywhere**, the undefined `secondary`
   is the default, and it has exactly one call site (`src/App.tsx:192`). Treat
   it as greenfield.

8. **`mcp-unifi` carries a second design system claiming the Keycaps name.**
   `.impeccable/design.json` is titled "Design System: mcp-unifi Keycaps" and
   defines 24 colors with tonal ramps, 8 typography roles, and five extracted
   `ds-`-prefixed components. The inventory does not mention it. It is precisely
   the failure mode ADR 0002 describes — "a local component that looks like a
   Keycaps component" — and Phase 4 deletes it.

9. **No consumer has a dependency-update config.** ADR 0002 requires "an
   automated Keycaps dependency update in each consumer." Verified absent in all
   five: no `dependabot.yml`, no `renovate.json`, no `.renovaterc` anywhere.
   Phase 2 creates five.

10. **`assistant-workbench` has two drifts beyond the press.**
    `--control-min-block-size: 50px` against the system's 44px floor, and
    `--shadow-overlay: var(--shadow-plate)`, which resolves to `none` in dark —
    so its popovers and dialogs have no depth in dark mode at all, against the
    Overlay Exception Rule. Also `--color-status-neutral: var(--success-text)`,
    which aliases "neutral" to the mint success token; a by-name token migration
    would carry that error forward.

11. **`retirement-dashboard` has no React at all, not merely no plugin.**
    ADR 0002 says Phase 7 "is `@vitejs/plugin-react` plus island mounting."
    `react`, `react-dom`, `@types/react`, and `@vitejs/plugin-react` are all
    absent, and `vite.config.ts` has no `plugins` array. The step is real, just
    slightly larger than stated.

12. **Two repos have no root-level JS package.** `assistant-workbench`'s repo
    root is a Python project with no `package.json`; the web app is a
    self-contained npm island at `apps/web`. Its `build` script is
    `tsc --noEmit` and **CI never invokes it** — the deploy workflow calls
    `typecheck` directly, so `build` is a dead alias. Phase 5 has to make
    `build` real before anything else is verifiable.

13. **This plan contradicted the inventory on two of `knowledge`'s components.**
    Phase 6 step 6 listed `KnowledgeNavigation` and `DetailsDrawer` as Tier 3,
    "genuinely novel," to be left local. The inventory classifies both as Tier 2
    gaps at 2/5 repos: sidebar/tree navigation (`.knowledge-nav` with
    `retirement-dashboard`'s `.plan-rail`) and drawer/side panel
    (`.details-drawer` with `.assumptions-drawer`). Both entries even cite the
    365-line and 430px figures the phase used as evidence of novelty. What went
    wrong is worth naming because it will recur: the two components are large and
    repo-specific-looking, and that read as Tier 3 without anyone checking the
    count. Size is not the test. Under the normalization premise the inventory is
    right, and both move to Phase 2a. `VaultWorkspace` and `SafeVegaLiteChart`
    remain Tier 3 correctly.

14. **The theme toggle is 3/5, not the 5/5 this list first claimed.** The
    inventory records `assistant-workbench` and `retirement-dashboard` as the two
    repos with a theme control, and notes that Keycaps defines the CSS contract
    but ships none. This entry originally read that Phases 3, 4 and 6 each author
    a dark theme for a repo that has none, so all five would need the control.
    Two of those three are Mode 1, and Phase 4 says outright what Mode 1 theming
    is: "keep it to the inline bootstrap only — `prefers-color-scheme` handles
    the rest with no runtime." A control needs a runtime, so `mcp-dnsimple` and
    `mcp-unifi` get none. `knowledge` is the third repo, and it is Mode 2.

    Three of five still clears the bar comfortably, and the toggle stays first in
    the Phase 2a queue — it is a prerequisite for Phase 5 rather than Phase 7,
    and two divergent implementations already exist to reconcile. The shipped
    component enforces the Mode 1 half mechanically: `renderStatic` throws on it,
    the way it does on Select and Popover.

    The general lesson, since it is the second time in this list: a repo count
    read off the inventory is a count of repos that have the *pattern*, not of
    repos that can *use the component*. Delivery mode is the filter, and it has
    to be applied before the number means anything.

15. **The Tier 2 build was scoped to one repo in a program about convergence.**
    Phase 7 step 1 read "build the Tier 2 components *this repo* needs," and its
    list of seven omitted three of the inventory's eleven — sidebar/tree
    navigation, avatar, and theme toggle — because `retirement-dashboard`'s
    surface did not obviously demand them. The inventory is already ordered by
    how many repos need each pattern, which is the ordering a convergence program
    wants. The build is now Phase 2a, scoped by that count, and off the serial
    consumer chain it never depended on.

16. **ADR 0002 asks for something that was already true.** It says
    "`tests/consumer/` should additionally track this repo's `main` rather than a
    release." It has used `workspace:*` since the fixture's scaffold commit
    `b089fcc`, which predates the ADR, and `pnpm-lock.yaml` resolves that to
    `link:../../packages/react` and `link:../../packages/tokens` — the working
    tree, which is stricter than a branch. The real gap was that nothing said so:
    a fixture silently re-pinned to a published version would have gone on
    looking green while proving the opposite of its purpose. Phase 2 added the
    assertion; the ADR's requirement needed a check, not a change.

17. **`assistant-workbench` renders no tables at all.** The inventory's Tier 2
    data table row and Phase 2a's queue both count it as one of the three repos,
    on the strength of `.data-table` and `.quiet-table`. Correction 4 already
    moved `.quiet-table` off `retirement-dashboard`; this goes further. `git grep
    "<table"` across `origin/main` returns nothing outside
    `apps/web/public/vendor/lucide.min.js` — no `<thead>`, no `<tbody>`, no
    `<caption>`, anywhere. The dashboards render `.health-item` CSS-grid rows
    instead. And the two classes are one rule block of four declarations listing
    both selectors on every line: there is not a single declaration that applies
    to one and not the other, so `.quiet-table` is a name with an implied
    semantic that never received a distinguishing property.

    `knowledge`'s two are real but are both *article* tables — one emitted by
    `react-markdown` inside `.markdown-article`, one a chart's data-table
    fallback inside the same container — which is `prose.css`'s case rather than
    the component's, and `prose.css` is what Phase 6 gives that repo anyway. Its
    third table, `UsersPage`, is unmounted dead code whose three class names have
    no CSS anywhere in the repo.

    So the rendered count behind this component is 1 clear consumer, not 3, and
    the honest reading is that the inventory counted class names rather than
    markup. It still gets built — see 17 — but the reason is now stated
    accurately, and `assistant-workbench` is a green field rather than a
    migration.

18. **Keycaps' own Storybook was the sixth surface, and it hand-authored `.kc-`.**
    Eleven tables across five files in `apps/storybook/src/foundations/`, every
    one of them `<div class="kc-table-scroll sb-unstyled"><table
    class="kc-table">`, with the treatment declared in `foundations.css` under
    `:root .kc-table` — a different padding, font size, and header treatment from
    the one `prose.css` ships. That is precisely the failure ADR 0002 forbids
    consumers, inside the repo that forbids it, against a class this package did
    not publish. It was also a live defect: none of the eleven scroll containers
    carried `tabindex="0"`, so the design system's own documentation held eleven
    WCAG 2.1.1 failures while `prose.css` documented the rule.

    The `:root` prefix made it worse than a duplicate. `foundations.css` loads
    after `styles.css` in the preview, so the docs' rules would have outranked
    the shipped component's on every page. All eleven are `DataTable` now, and
    `foundations.css` keeps two rules: `code` inside a cell, and a `.kc-docs-table`
    of its own for the flow margin — a class of the app's rather than an override
    of `.kc-table-scroll`, since redefining a `.kc-` selector is a build failure
    in every consumer and should not be tolerated here either.

19. **`retirement-dashboard`'s `.table-scroll` does not carry `tabindex="0"`.**
    The inventory's Tier 2 row says its scroll container "already implements the
    Prose Markup Rule's `tabindex="0"`", and Phase 7 step 1 repeats it. The
    markup helper emits `role="region"` and `aria-label` only
    (`src/planner.ts:643-652`). The attribute is added at runtime by
    `syncScrollableTableFocus()` (`:654-670`), and only while the container
    actually overflows — called on every render and on `resize`.

    Two tests lock that behavior in: `test/layout.test.ts:164-175` asserts the
    static markup does *not* contain
    `class="table-scroll" role="region" tabindex="0"`, and
    `e2e/auth-and-planner.spec.ts:1212-1220` asserts the attribute is present
    under `mobile-chromium` and absent under `desktop-chromium`.

    The shipped `DataTable` is always focusable. RD's version is the better tab
    order and the worse floor: it needs a client runtime, so on a Mode 1 page the
    region would scroll with no way to reach it — and an accessibility floor that
    depends on which delivery mode a page happened to use is not a floor.
    `CodeBlock` already made the same call for its `pre`. **Phase 7 therefore has
    to update both of those tests**, which is work the plan did not know about
    because it believed the attribute was already static. RD's third assertion,
    that no `.table-scroll` nests inside another, holds unchanged.

20. **Correction 13 was wrong about the drawer, and the two components are not
    one component.** That entry moved `knowledge`'s `DetailsDrawer` out of Tier 3
    on the strength of a 2/5 repo count pairing `.details-drawer` with
    `retirement-dashboard`'s `.assumptions-drawer`. It was made from counts
    without reading either implementation, and the two are unrelated:

    - RD's `.assumptions-drawer` **is a modal dialog**. It is a native
      `<dialog>` (`src/planner.ts:4382`) opened with `showModal()`
      (`:3989`, `:4978`), with a `::backdrop` (`src/styles.css:2619`), whose
      drawer character is four declarations of geometry — `margin: 0 0 0 auto`,
      `height: 100%`, `width: min(560px, 100%)`, a single `border-left`
      (`:2606-2617`). Strip the geometry and it is the same primitive as
      `.plan-history-dialog` and `.tiller-picker-dialog`.
    - KN's `.details-drawer` **is not an overlay at all** on the surface it was
      designed for. It is the third column of the shell's grid —
      `grid-template-columns: var(--nav-width) minmax(0, 1fr) var(--drawer-width)`
      (`src/styles.css:285`) — rendered as an `<aside>`
      (`src/components/DetailsDrawer.tsx:60`), toggled between `display: none`
      and `display: block` (`:1665`, `:1674`). It becomes `position: fixed` only
      inside the narrow-viewport block (`:3357-3365`), and even there it is
      **non-modal**: `git grep -iE "backdrop|inert|aria-modal|role=\"dialog\""`
      over `src/` returns nothing in the entire repository.

    So the drawer is not a component with two consumers. It is one dialog with a
    `placement` prop and one `AppShellSidebar`, and it leaves the Phase 2a queue.
    The lesson is the same one correction 13 drew and then did not apply far
    enough: size was not the test, and neither is a shared word. Two repos
    calling two different things "drawer" is not two consumers.

21. **Correction 13 was also wrong about the sidebar, which Phase 1 already
    shipped.** `AppShellNav`, `AppShellNavLink`, and `AppShellSidebar` are
    exported from `packages/react/src/index.ts:1-15`, and `AppShellNavLink`
    already sets `aria-current="page"`
    (`packages/react/src/components/AppShell.tsx:142`) with the selected
    treatment styled at `packages/react/src/styles.css:1044`. That is exactly
    what both consumers need — RD's `.plan-rail a[aria-current="page"]`
    (`src/styles.css:249`) is the same hook, and its markup is a `<nav>` of
    grouped `<ul>`s of `<a>` (`src/ui/planViews.ts:203-238`).

    **Neither consumer is a tree**, so the entry's name was wrong too. The
    inventory describes `.knowledge-nav` as a "365-line component: branches,
    chevrons, counts, collapse, mobile header"
    ([component-inventory.md:172](component-inventory.md)). The line count is
    right and the first two items are not:
    `git grep -iE "chevron|treeitem|role=\"tree\"|aria-expanded"` over
    `src/components/KnowledgeNavigation.tsx` returns **nothing**, and there is no
    nested list anywhere in it. It is a flat sidebar of grouped `<button>`
    filters. RD's own CSS comment says the same of its rail: "every entry is a
    routed destination, not a disclosure" (`src/styles.css:170`).

    What is genuinely missing from `AppShellNav` is two things, both at 2/5 and
    both extensions rather than a component: a **group heading** inside the nav
    (RD `.plan-rail-label`, `src/styles.css:186`; KN `<h2 id="spaces-heading">`,
    `KnowledgeNavigation.tsx:292`) and a **trailing count** on an item (RD
    `.plan-rail-badge`, `:226`; KN `.knowledge-nav__count`, `:412`). A third
    difference — KN's items are `<button>` filters, RD's and AW's are `<a>`
    links — is a functional difference and therefore a prop, per the Premises.
    KN's collapse control (`KnowledgeNavigation.tsx:353-360`) is 1/5 and stays
    local.

    These belong in the inventory's *needs a variant or extension* table, not in
    a build queue. Both corrections 13 and 15 were arguing that the inventory's
    count should govern the build; the count was right that two repos need this
    and wrong that Keycaps does not already have it.

22. **The segmented control is 1/5, and `knowledge` has none.** The inventory
    ([component-inventory.md:171](component-inventory.md)) and the Phase 2a queue
    both paired RD's `.segmented` with KN's `.browse-filter`. `.browse-filter` is
    a **search input** — a `<label>` wrapping a magnifier and
    `<input type="search">` (`src/components/BrowseWorkspace.tsx:115-123`), styled
    as a single bordered field (`src/styles.css:1003-1034`). It is `SearchField`,
    which Phase 1 already shipped. The nearest thing KN has to a segmented
    control is `.topic-filters`, and it is a wrapping row of separately bordered
    buttons — `display: flex; flex-wrap: wrap; gap: 8px` with a border and radius
    on each child (`src/styles.css:1035-1054`) — which is a filter chip row, not
    a shared track.

    RD's is real: one builder at `src/planner.ts:1256` emitting
    `<label class="segment">` around a radio, selected through
    `.segment:has(input:checked)` (`src/styles.css:3045`). The inventory's "28
    hits" is a substring count of the string `segment`, not call sites; there are
    **9**, and all nine are inside the assumptions drawer
    (`src/planner.ts:4157-4238`). One repo, one surface. Tier 3, stays local,
    recorded as owed upstream.

23. **The skeleton is 1/5, and `knowledge`'s "loading" classes are sentences.**
    `assistant-workbench` has a real skeleton: `.loading-line` at a fixed height
    with a `loading-pulse` animation and `.medium`/`.short` width modifiers
    (`apps/web/public/workbench-view.css:963-977`), used under `aria-busy` with
    `aria-hidden` on the placeholder itself
    (`apps/web/public/index.html:182-189`, `bills/index.html:84-87`,
    `orders/index.html:91-93`).

    `knowledge`'s three are text. `.loading-screen` is a `<main>` containing the
    words "Loading Knowledge…" (`src/App.tsx:599-601`);
    `.home-workspace__loading` and `.vault-loading` are `<p>` elements with
    `aria-live="polite"` (`src/components/HomeWorkspace.tsx:158`,
    `VaultWorkspace.tsx:635`). None of the three has a placeholder shape or an
    animation, and two of them carry no dedicated styling at all — their only
    rules are shared blocks naming a second selector on every line
    (`.loading-screen, .signin` at `src/styles.css:2660`; `.vault-loading,
    .vault-error` at `:3219`), which is the same reading error
    [correction 17](#corrections-to-the-survey) found behind `.quiet-table`.

    A status message is not a skeleton, and Keycaps has no gap there anyway. One
    repo. Tier 3, stays local, recorded as owed upstream.

24. **The timeline is 1/5, and the plan already classified the other half Tier
    3.** The queue paired AW's `.feed-entry` with RD's `.timeline-list`. RD's is
    the year-by-year output of the retirement model: a `<details>` per year
    carrying ending balance, a delta badge, spend and withdrawal figures, a
    milestone flag, and two ledgers (`src/planner.ts:3821-3845`), across 73
    `.tl-` rules in `src/styles.css`. The inventory's own Tier 3 paragraph names
    "RD's `.tl-*` year timeline" ([component-inventory.md:182](component-inventory.md))
    and Phase 7 step 5 names it again — so this repo counted the same layer as
    Tier 2 evidence and Tier 3 residue in one document.

    AW's is a genuine reverse-chronological activity feed
    (`apps/web/public/workbench-view.css:1032-1056`,
    `apps/web/public/index.html:1598-1599`), and it is the only one. Tier 3,
    stays local, recorded as owed upstream.

25. **The avatar's one condition expired unnoticed.** The queue listed it at 1/5
    with the note "built only if the app shell needs one". `AppShell` shipped in
    Phase 1 with a `brand` and an `actions` slot and no avatar
    (`packages/react/src/components/AppShell.tsx:83-102`), which resolved the
    condition in the negative, and the row stayed in the queue anyway. The one
    consumer is real and mounted — `UserAvatar` at `src/App.tsx:208`, asserted in
    `e2e/knowledge.spec.ts:378-383` — so it is Tier 3, stays local, recorded as
    owed upstream, rather than dropped.

    Worth naming as a queue hazard rather than a component fact: a conditional
    entry whose condition is settled elsewhere will sit in a list forever unless
    something re-reads it. Prefer recording the disposition when the condition
    resolves.

26. **The disclosure is 3/5, not 2/5 — the inventory missed
    `assistant-workbench` entirely.** Its row reads "RD 9, KN 2". RD's 9 is
    right (`src/planner.ts` 6, `src/ui/assistantChat.ts` 1,
    `src/ui/tillerPicker.ts` 2) and KN's 2 is right
    (`src/components/DetailsDrawer.tsx:242`,
    `src/components/SafeVegaLiteChart.tsx:248`, both styled at
    `src/styles.css:1959-1966` and `:1433-1442`). AW has two more, each with its
    own CSS: `public/index.html:1203` — locked in by a test at
    `apps/web/test/publicDashboardHealthCopy.test.ts:43-44` — and
    `functions/approvals/[approvalRequestId].ts:425`, which is inside the fourth
    CSS surface [correction 2](#corrections-to-the-survey) records, and is
    exactly the kind of thing a `public/`-scoped survey misses.

    This is the first entry in this list to move *up*. It makes the disclosure
    the highest-count item of the eight surveyed, and it is also the cheapest and
    the only one that works without JavaScript, which is why it is first in the
    queue.

27. **A shared rule block is the third false consumer this survey has produced.**
    `assistant-workbench`'s dialog CSS declares `.dialog-panel, .dialog`
    (`apps/web/public/workbench-view.css:1540-1541`) and `.dialog-header h2,
    .dialog h2` (`:1561-1562`). `git grep 'class="dialog"'` across `origin/main`
    returns nothing: **`.dialog` matches no element in the repository.** There is
    not one declaration that applies to it and not to `.dialog-panel`.

    That is the same shape as `.quiet-table`
    ([correction 17](#corrections-to-the-survey)) and
    `.loading-screen`/`.vault-loading`
    ([correction 23](#corrections-to-the-survey)): a selector that exists only as
    a second name on someone else's rule, which a grep of class names reads as
    evidence of a pattern. It costs nothing where it is — an unused selector is
    dead CSS, not a defect — but it has now inflated three counts in this program,
    so it is worth stating as a method rather than as three findings. **Count
    elements, not selectors.** A pattern is present in a repo when markup renders
    it, and a class name in a stylesheet is not markup.

28. **`retirement-dashboard` draws the chevron three ways, not two — and six of
    the thirteen disclosures in the program have no chevron at all.** The design
    direction above says RD "draws it twice, identically, out of two `2px`
    borders on a 7px square (`styles.css:1312-1323` and `:2770-2782`)". Both of
    those are real, and they are not quite identical — `.drawer-disclosure`'s
    carries a `justify-self: center` its twin does not — but the count is the
    part that matters. There is a third: `.tl-chev`
    (`src/styles.css:4232-4238`), a `›` character in a
    `<span aria-hidden="true">` (`src/planner.ts:3826`), set at `--text-3xl` and
    rotated 90° when the row opens.

    Widening from the chevron to the treatment: RD has **five** disclosure
    treatments, not the two the direction implies — `.data-source-disclosure`,
    `.tl-row`/`.tl-summary`, `.drawer-disclosure`, `.assistant-privacy`
    (`src/styles.css:1034`), and `.tiller-picker-more`/`.tiller-picker-manual`
    (`:1536`). The last two set no `list-style: none` and ship the browser's own
    marker. So do both of `assistant-workbench`'s
    (`apps/web/public/workbench-view.css:1620`,
    `apps/web/functions/approvals/[approvalRequestId].ts:305`) and one of
    `knowledge`'s (`.declarative-chart summary`, `src/styles.css:1439`);
    `knowledge`'s other uses `content: "+"` flipping to `"−"`
    (`src/styles.css:1977-1985`).

    That is **thirteen elements, nine class names, four different expand
    affordances, and zero icons from any registry** — with the UA marker on six
    of the thirteen, which is exactly the thing the other seven spend a
    `list-style: none` to remove. It strengthens rather than weakens the
    direction's call: shipping the chevron from the icon set is not replacing two
    border boxes, it is replacing four different things and *supplying* one to
    six elements that never had it.

29. **The two-slot summary is the same markup in `knowledge` and
    `retirement-dashboard` and a different layout in each, and neither layout
    survives 320 pixels.** The direction is right that both repos independently
    wrote `<span>` plus `<small>`; that part held up exactly. What it does not
    say, and what the builder has to decide, is where the second slot goes. KN
    lays the summary out as `grid-template-columns: minmax(0, 1fr) auto` and then
    pulls the `<small>` back to `grid-column: 1` (`src/styles.css:1963-1989`),
    which puts it under the label — and leaves the `+` marker auto-placed into
    the second row beside it. RD gives it a column of its own,
    `minmax(0, 1fr) minmax(0, 250px) 16px` (`src/styles.css:2753-2762`), so its
    description sits beside the label and the two share the width.

    Under the 320 Rule the column form is the one that fails: a 250px second
    column against a `1fr` first leaves the label nothing at that width, and RD's
    own narrow-viewport override rewrites the columns for
    `.data-source-disclosure` but not for `.drawer-disclosure`
    (`src/styles.css:1841-1848`). The component puts the description beneath the
    label on its own line, which is nearer KN's placement, and it is the
    placement rather than either repo's grid that ships. Recorded because "the
    same two-slot shape" is true of the markup and not of the treatment, and the
    difference is a decision the direction left open rather than one it made.

30. **The token layer shipped no scrim at all, and under forced colors the scrim
    is the only separator left.** The design direction says "the token layer
    ships one scrim and neither number is it." It shipped none:
    `grep -rn "scrim\|backdrop" packages/tokens/src packages/react/src` returned
    nothing before this component. So the builder was adding the token rather
    than pointing two repos at an existing one, which is a different piece of
    work and one the direction did not budget.

    What the survey handed over is the *alpha* rather than a colour.
    `assistant-workbench` uses `rgb(21 24 29 / 0.68)`
    (`apps/web/public/workbench-view.css:1537`) and `retirement-dashboard`
    `rgba(8, 15, 24, 0.68)` (`src/styles.css:1453`) — two different colours and
    the same 0.68, chosen without coordinating. Both colours fail the Phase 2
    colour rule and neither survives; the agreement on alpha is the strongest
    evidence available for a value nobody can reason to from first principles,
    so `--kc-color-scrim` keeps it and takes the graphite ink both shadows are
    already tinted with.

    The second half is the part the direction could not have known, because it
    only appears once a dialog exists. `--kc-shadow-overlay` resolves to `none`
    under `forced-colors: active` (`packages/tokens/src/tokens.css:382`), so in
    that mode a dialog has no shadow, and the scrim is the only thing between it
    and the page. A translucent scrim would need `forced-color-adjust: none` to
    survive there, which is fighting the mode rather than answering it — so the
    token resolves to an opaque `Canvas` instead, the page behind is genuinely
    hidden, and the dialog's `ButtonText` border draws the boundary. Recorded
    because "add the scrim token" and "decide what `::backdrop` does when the
    shadow is gone" are two decisions and the direction anticipated neither.

31. **`UNSAFE_PortalProvider` is not reachable from `packages/react`, and it does
    not live where the plan says it does.** The Phase 2a brief states that the
    replacement for the deprecated `UNSTABLE_portalContainer` "lives in
    `@react-aria/overlays`, which is a transitive dependency and not a direct
    one." Verified against the installed tree, both halves are off.
    `@react-aria/overlays` is **not installed at all** —
    `react-aria-components@1.20.0` depends on the monolithic `react-aria@3.51.0`,
    which is where `UNSAFE_PortalProvider` is actually exported from
    (`dist/types/exports/index.d.ts:92`).

    The consequence is stronger than "transitive rather than direct". Under
    pnpm's strict linking, `packages/react/node_modules` contains only
    `react-aria-components`, so `react-aria` is **unresolvable** from this
    package: `require.resolve("react-aria")` throws `MODULE_NOT_FOUND`. Reaching
    the provider would mean adding a second React Aria package as a direct
    dependency whose version has to track RAC's exactly, in order to obtain an
    API whose own stability marker is `UNSAFE_` rather than `UNSTABLE_`.

    So `Dialog` uses `UNSTABLE_portalContainer`, which is present, typed, and
    does the job, and the system supplies the context the provider would have
    supplied — `Dialog` publishes its element and `Popover` and `Select` read it.
    The deprecation redirects to a different spelling of the same capability
    rather than away from the capability, so when it moves, one module and two
    call sites change. Recorded because the brief presented the two escape
    hatches as a live choice, and on this installation only one of them exists.

32. **The affected-story review matrix could not detect keyboard activation on
    any React Aria control, and had never run the check.**
    `tests/e2e/review-affected.spec.ts` focuses the first activatable control,
    presses Enter, and counts a `click` event with `detail === 0`. That is the
    right signal for a native control and the wrong one for a React Aria
    component: `usePress` calls `preventDefault` on the keydown, which suppresses
    the synthesized click, and invokes `onPress` directly. Verified against this
    build — Enter on a focused Keycaps `Button` produces `keydown` and `keyup` at
    `document` and **no `click` at all**, while the control genuinely activates.

    Since every interactive Keycaps component is React Aria, that detector could
    never have fired for one. It went unnoticed because the block is guarded by
    `activatable.isVisible()`, which returns `false` on the stories sampled so
    far, so the assertion was skipped rather than failing. The Dialog stories are
    the first to satisfy the guard — an open modal is the only case where the
    first activatable control in the document is reliably visible at that point
    in the run — which is how a latent defect in the harness surfaced as six
    failing dialog tests.

    The check now accepts either signal: a `detail === 0` click, or a
    `data-pressed` transition on the focused element, which is the attribute
    React Aria's press machinery sets and the one `styles.css` already styles
    every pressed state through. That widens what can be *detected* without
    loosening what is *asserted*. Two neighbouring gaps in the same file were
    fixed with it: the focusable count did not know that a modal `<dialog>`
    blocks everything outside it — the platform's implicit state rather than an
    `inert` attribute a filter can see, so `:modal` now scopes it — and axe ran
    without waiting for entrance animations, reporting a dialog's body ink at
    3.95:1 against a background no element declares because it sampled the fade
    mid-flight.

    Recorded because the harness landed one commit before this component
    (`c4e0564`, PR #13) and is not part of `pnpm check`, so nothing local runs
    it. Its `isVisible()` guard is still skipping the activation check on most
    stories; that is a separate defect, left alone here rather than fixed
    silently alongside a component change.

33. **`components-button--press-and-hold`'s play function had never passed, and
    the review harness could not tell.** Its release —
    `userEvent.pointer({ keys: "[/MouseLeft]", target: button })` — never reached
    React Aria, so `data-pressed` stayed `"true"` and the following
    `waitFor(() => expect(button).not.toHaveAttribute("data-pressed"))` always
    timed out. Verified in isolation with nothing else touching the page: four
    seconds after load the key is still down and the assertion has logged.

    It looked green because the harness never waited for a `play` function to
    finish. It navigated away first, aborting the story before the assertion's
    timeout could log, so the error was emitted into whichever collection window
    happened to be open — usually none. The Dialog work shifted that timing by a
    few hundred milliseconds and the failure became deterministic, which is the
    only reason it is visible now.

    The cause is pointer capture, and it is a fault in the simulation rather than
    in the component: React Aria calls `setPointerCapture` on press and releases
    on the `pointerup` carrying the same `pointerId`, and user-event's release
    did not deliver a matching one. **A real mouse was never affected** — driven
    with real Playwright input, `data-pressed` is set on press and cleared on
    release, confirmed before changing anything. The play function now dispatches
    the `pointerup` itself with an explicit `pointerId`.

    Recorded rather than fixed quietly because it changes what a Phase 1 story
    asserts, and because the general shape of the problem outlives this instance:
    the harness collects console errors per stage while story `play` functions
    run unsynchronised beside it, so a play failure lands in an unrelated
    assertion or in none at all. `waitForPlaySettled` now covers the one window
    where the harness's own keys collide with a running play — the
    `components-search-field--clearing` failure in this PR's first CI run — and
    the broader mis-attribution is left standing rather than papered over.

34. **`mcp-dnsimple`'s page made two kinds of off-origin request, and Phase 3
    named only one.** The phase's font step is right that the Google Fonts CDN
    has to go — three faces plus two `preconnect` hints. What it never mentions
    is `HEALTH_BADGE_URL` (`mcp-dnsimple/src/branding.ts:49-51` at `0f84dc6`,
    rendered at `:1011-1013`), an `img.shields.io` badge in the footer, which is a fourth request to a third
    party on every page load and the only one that also leaks a visit to an
    analytics-capable host.

    The phase's own exit criterion — "the page makes zero off-origin requests" —
    could not have been met by doing the font step alone, so the two were always
    a pair and only one was written down. The badge is deleted rather than
    replaced: the footer already links `/health`, which is the same information
    from this origin, and a shields.io badge on a page that *is* the service is
    a status light wired to someone else's mains.

    Worth generalising for Phases 4 through 7: the surveys counted stylesheets
    and components, and an off-origin `<img>` is neither. Grep for `src=`,
    `<link`, and `url(` against an external host in each repo before its phase
    claims that criterion.

35. **The exit criterion Phase 3 called unreachable is reachable, and the phase
    already said how.** Its second exit criterion reads "the Phase 2 rules pass
    with an empty allowlist. **Not reachable as written**", because
    `FAVICON_SVG` and `OG_CARD_SVG` carry raw hexes that an SVG cannot read from
    a custom property, and they share a file with the page.

    Both of the phase's suggested fixes work, and the one it preferred — drive
    the colours from token values at render time — turned out to need about
    forty lines: read `tokens.css` out of `node_modules`, take the first `:root`
    block, follow `var()` aliases to a literal, and interpolate
    (`mcp-dnsimple/src/keycaps-assets.ts:64-104`, consumed at
    `mcp-dnsimple/src/branding.tsx:47-55`). The allowlist in `mcp-dnsimple/.keycaps-lint.json`
    is now empty and `keycaps-css-lint` reports 37 files clean. Recorded because the criterion is quoted in the phase map as a known
    exception, and it is no longer one.

    The side effect is the part worth keeping: the favicon and the Open Graph
    card now change colour when the palette does, which is the only version of
    this where the brand mark is actually part of the system rather than a
    picture of it.

36. **The prompt cards have nowhere to link to, so they are not linked Cards.**
    Step 5 of this phase says "`.prompt-card` becomes a linked Card", and unlike
    the `.endpoint` row beside it — which it leaves as a choice, "decide by
    whether they navigate" — it states this one flatly. The markup does not
    support it. Each `.prompt-card` is an `<li>` holding a `<span>`, a
    `<blockquote>`, and a `<p>` of tool names
    (`mcp-dnsimple/src/branding.ts:975-996` at `0f84dc6`, the four `<li>` at
    `:976`, `:981`, `:986`, and `:991`).
    There is no anchor in any of the four, and nothing to point one at: they are
    example sentences to say to Claude, not destinations.

    They ship as plain Cards (`mcp-dnsimple/src/branding.tsx:409-430`). A
    `CardLink` would have needed a URL invented for it, and a linked Card that
    navigates nowhere is a worse defect than the one this rule exists to prevent.

    The endpoint cards, which do navigate, are linked
    (`mcp-dnsimple/src/branding.tsx:351-369`), so the distinction the step drew
    for `.endpoint` is the one that generalises. Phases 5 through 7 should read
    "becomes a linked Card" as conditional on a destination existing, everywhere
    it appears.

37. **The rollback unit is the commit, not `renderHomePage`.** This phase's
    Rollback section says "`renderHomePage` keeps its signature throughout, so
    the rollback unit is one function." The signature was kept — the model gained
    a renamed field and nothing else, and `server.ts` calls it the same way — but
    restoring only that function does not restore the page.

    The migration also, all in `mcp-dnsimple`:

    - moved `@jflamb/keycaps-react`, `@jflamb/keycaps-tokens`, `react`, and
      `react-dom` out of devDependencies into runtime dependencies
      (`mcp-dnsimple/package.json:26-31`), which the container needs because the render
      happens in the running process;
    - enabled JSX and widened the compiler's inputs to `.tsx`
      (`mcp-dnsimple/tsconfig.json:4-5` and `:20`);
    - added the `/fonts` static route the inlined `fonts.css` resolves against
      (`mcp-dnsimple/src/server.ts:467-484`);
    - added the stylesheet-inlining and token-reading module the page cannot
      render without (`src/keycaps-assets.ts`, 104 lines);
    - emptied the drift allowlist (`mcp-dnsimple/.keycaps-lint.json:7`);
    - widened the ESLint globs (`mcp-dnsimple/eslint.config.js:6` and `:66`) and the lint
      script (`mcp-dnsimple/package.json:17`) to `.tsx`;
    - and added two CI workflows' worth of gate — the browser job at
      `mcp-dnsimple/.github/workflows/e2e.yml:27-72` and the container job at `:74-95`, plus
      the `push` trigger on `main` at `:14-21` and its counterpart on
      `mcp-dnsimple/.github/workflows/quality.yml:3-10`.

    Reverting the commit works and is clean; reverting one function leaves a page
    that references components nothing installs, compiled by a `tsc` that no
    longer accepts the file it lives in.

    The claim was not harmless — it is the sentence that makes this phase read as
    low-risk. The accurate version is that the *deploy* is the safe part:
    `mcp-dnsimple/.github/workflows/deploy.yml:19-28` runs `deploy-dev` before
    `deploy-prod` and gates prod on it with `needs`, which is a free canary, and `git revert`
    of a single commit restores the previous page with no data-layer or route
    changes to unwind. Phases 4 through 7 should state their rollback in commits
    rather than in functions, because all four touch build configuration the same
    way.
