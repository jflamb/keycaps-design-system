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

## Phase map

| Phase | Scope | Repo(s) | Blocks |
| --- | --- | --- | --- |
| 1 | Static-render path, variant gaps, Tier 1 components | Keycaps | 2–7 |
| 2 | Drift controls and release plumbing | Keycaps + all five | 3–7 |
| 3 | Mode 1 proof | `mcp-dnsimple` | 4 |
| 4 | Mode 1 with no build step; first dark theme | `mcp-unifi` | 5 |
| 5 | Mode 2 proof; end the `ledger.css` fork | `assistant-workbench` | 6 |
| 6 | Pure component adoption; second dark theme | `knowledge` | 7 |
| 7 | Tier 2 components, then the re-skin | `retirement-dashboard` | — |

Phases 3–7 are strictly ordered. Phases 1 and 2 could overlap, but 2's CI rules
are cheap to land and worthless after the fact, so 2 follows 1 immediately and
precedes 3.

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
  breaking change surfaces here before five repos find it separately.

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

For a repo the size of `retirement-dashboard` the debt allowlist is file-scoped
rather than occurrence-scoped; enumerating individual findings across 6,783 lines
of CSS would produce a list nobody reads.

Wiring per repo:

| Repo | Workflow to extend | Existing gate |
| --- | --- | --- |
| `assistant-workbench` | `.github/workflows/deploy-assistant-web.yml` | `npm run format`, `typecheck`, `test`, `test:e2e` |
| `retirement-dashboard` | `.github/workflows/check.yml` (`quality` job) | `format`, `typecheck`, `lint`, `build` |
| `knowledge` | `.github/workflows/ci.yml` (`validate` job) | `check`, `test`, `build`, `test:e2e` |
| `mcp-dnsimple` | `.github/workflows/quality.yml` | lint, typecheck, test, build, `npm audit` |
| `mcp-unifi` | `.github/workflows/quality.yml` | lint, typecheck, test, build |

**2.3 — Two repos need a stylesheet gate they do not have.** `mcp-dnsimple`'s
CSS is a string inside `src/branding.ts` (lines 106–818), and `mcp-unifi`'s
`site/` directory is outside its `tsconfig` include and outside its ESLint globs
entirely — the landing page has no automated coverage of any kind. The rule
scripts must read those two surfaces specifically, not glob `**/*.css`.

### Exit criteria

- A Keycaps release exists containing Phase 1, and both packages are on npm.
- Five dependency-update configs merged, one per consumer.
- Both CI rules run and pass in all five consumers, against their **current**
  pre-migration code. They will fail at first; the allowlist is how a repo
  declares its pre-migration debt, and each allowlist entry is deleted by the
  phase that migrates that repo.
- `tests/consumer/` tracks `main`.

### Validation

Deliberately break each rule in a scratch commit per repo and confirm CI goes
red: add `color: #ff0000` to app CSS, and add a `.kc-button { }` override. Both
must fail. A rule that has never been seen failing has not been tested.

### Rollback

Each control is one file plus one workflow step per repo. Reverting a repo's PR
restores its previous CI exactly. No application code changes in this phase, so
nothing can break at runtime.

---

## Phase 3 — `mcp-dnsimple` (Mode 1)

**Why first among the consumers:** the smallest surface, one file, already builds
with `tsc`, and it proves the whole Mode 1 path end to end before a second repo
depends on it.

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

1. **Enable JSX and add the dependencies.** Set `"jsx": "react-jsx"` and
   `"jsxImportSource": "react"` in `tsconfig.json`. Add `react`, `react-dom`,
   `@jflamb/keycaps-react`, `@jflamb/keycaps-tokens`, and the React types. Under
   `moduleResolution: Node16`, subpath exports resolve from the package
   `exports` map, which both Keycaps packages declare — no change needed there.
2. **Render at module load.** `branding.ts` already computes its page from a
   `HomePageModel`; keep that contract. Replace the body of `renderHomePage`
   with a `renderStaticDocument` call whose children are Keycaps components. The
   render happens once per process at first request, or eagerly at module load —
   `renderHomePage` is already pure over its model.
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
- The Phase 2 rules pass with an empty allowlist.
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

- `site/index.html`, 190 lines of hand-authored static HTML, and
  `site/styles.css`, 816 lines. No inline `<style>`, and the page ships **zero
  JavaScript**.
- `.github/workflows/deploy.yml` uploads `site/` byte-for-byte to GitHub Pages.
  There is **no `npm ci` and no build step in the deploy job**.
- `site/` is outside `tsconfig.json`'s include and outside the ESLint globs, so
  the landing page has no automated coverage at all.
- Fonts are self-hosted WOFF2: Fraunces Variable and Nunito Sans 400/600/700 —
  the retired pairing — driven by `font-variation-settings: "opsz" 18, "SOFT" 55`
  and `"opsz" 14, "SOFT" 45`.

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
   and the four `@font-face` blocks at `styles.css` lines 1–31. Both
   `font-variation-settings` declarations go with them: Piazzolla's `opsz` axis
   is never pinned, per the Optical Sizing Rule, and `SOFT` does not exist on it.
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
7. **Fix the one hardcoded hex.** `styles.css:292` sets `#6d4e0e` on
   `.confirmation-row dt` — it is `attention-ink` in the design JSON and never
   became a variable. It maps to `--kc-color-warning-text`.

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
- `public/index.html` is 1,753 lines, of which roughly 1,358 are inline
  application JavaScript plus its own `<style>` block.
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

- React 19.2.8, Vite 8.1.5, Tailwind v4.3.3 via `@tailwindcss/vite`,
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
6. **Leave the genuinely novel components local**, per Tier 3:
   `KnowledgeNavigation` (365 lines), `DetailsDrawer` (350), `VaultWorkspace`
   (673), `SafeVegaLiteChart` (269). They need tokens and type, not components.
   Record each in the repo's adoption notes as owed upstream, per ADR 0002, and
   confirm none uses the `kc-` prefix.
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
  has **no `plugins` array at all**. Vite is `^7.0.0`, against `knowledge`'s
  pinned 8.1.5.
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

1. **Build the Tier 2 components this repo needs, in Keycaps, before touching
   it.** In order of how much of the surface they unlock: data table (17 tables
   plus `.table-scroll`, which already implements the Prose Markup Rule's
   `tabindex="0"`), segmented control (`.segmented`/`.segment`/`.segment-label`/`.segment-sub`,
   28 hits and the primary assumption control), modal dialog (3 native
   `<dialog>`), drawer, disclosure, timeline, and loading/skeleton. Each follows
   the same contract and gets stories and tests, exactly as Phase 1's did.
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
   trivial; `controls.ts` is the segmented control and unlocks 28 call sites;
   `planHistory.ts` and `tillerPicker.ts` are the two dialogs; `holdings.ts`,
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
  panel titles; `mcp-unifi` pins `"opsz" 18, "SOFT" 55` and `"opsz" 14, "SOFT" 45`.
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

Everything else stays local. `knowledge` keeps `lucide-react`;
`assistant-workbench` keeps its vendored `lucide.min.js` at
`public/vendor/lucide.min.js`. Keycaps does not become an icon library — it ships
only the glyphs its own rules require.

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
- **Vite ^7 in `retirement-dashboard` against 8.1.5 in `knowledge`.** Only
  matters for the Storybook/consumer fixture parity, but it means
  `tests/consumer/` proves the package against one major and not the other.

`tests/consumer/` should be extended to build under both, or the plan should
accept that Phase 7 carries an unproven combination.

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
