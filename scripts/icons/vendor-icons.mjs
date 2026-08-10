#!/usr/bin/env node

/*
 * Vendors the Phosphor glyphs Keycaps uses, per ADR 0003.
 *
 * `@phosphor-icons/core` is a devDependency and stays one: it is the
 * authoritative geometry, read at vendor time, and it never reaches a consumer.
 * What ships is the committed output of this script. That is the whole point of
 * the arrangement — `DESIGN.md` forbids fetching a glyph at runtime, and an icon
 * set that grows without a commit is a vocabulary nobody owns.
 *
 * It writes two artifacts from one manifest:
 *
 *   packages/react/src/icons/icon-data.ts   the registry's source, and the
 *                                           `KeycapsIconName` union with it
 *   packages/tokens/src/prose.css           the `--kc-prose-icon-*` masks,
 *                                           rewritten between markers
 *
 * Both come from this one run, which is what collapses the Tone Trio Rule's two
 * shape sources into one: the octagon a `Badge` renders and the octagon
 * `prose.css` masks are now the same path by construction rather than by review.
 *
 * The reference implementation (`fdic-design-system`) splits this into a data
 * module plus a separate mask generator that imports it. That split is why its
 * design note has to warn against importing from `dist/` — an importer can read
 * a stale artifact. Emitting both outputs from the manifest in a single pass
 * removes the intermediate entirely, and it keeps the script plain ESM rather
 * than depending on Node's type stripping, which `engines: >=22` does not
 * guarantee.
 *
 * Run: pnpm icons:vendor      Check: pnpm icons:verify
 */

import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/*
 * The glyph list. Every entry is here because something renders it; adding one
 * is a deliberate commit, and removing a use should remove the glyph.
 *
 * `prose` names the `--kc-prose-icon-*` variable this glyph backs, for the four
 * status shapes and the three navigational marks `prose.css` masks. A glyph with
 * no `prose` key is component-only.
 */
const MANIFEST = [
  // The status trio, plus info. Each tone is a different *shape* — the Tone Trio
  // Rule's second carrier — so these four may never collapse into recolors.
  { name: "info", prose: "info" },
  { name: "check-circle", prose: "success" },
  { name: "warning", prose: "warning" },
  { name: "warning-octagon", prose: "danger" },

  // Navigational marks prose masks and components draw.
  { name: "caret-down", prose: "caret" },
  { name: "arrow-square-out", prose: "external" },
  { name: "arrow-up", prose: "arrow-up" },

  // Component chrome.
  { name: "x" },
  { name: "magnifying-glass" },

  // The theme toggle, which Phase 2a builds and all five consumers will need
  // once Phases 3, 4 and 6 give three of them a dark theme.
  { name: "sun" },
  { name: "moon" },
];

const WEIGHT = "regular";

/* Read from disk rather than resolved: the package's `exports` map deliberately
   does not expose `./package.json`, and the asset path is computed here anyway. */
const phosphorRoot = path.join(repoRoot, "node_modules/@phosphor-icons/core");
const phosphorVersion = JSON.parse(
  await readFile(path.join(phosphorRoot, "package.json"), "utf8"),
).version;
const assetDir = path.join(phosphorRoot, "assets", WEIGHT);

const dataPath = path.join(repoRoot, "packages/react/src/icons/icon-data.ts");
const prosePath = path.join(repoRoot, "packages/tokens/src/prose.css");

const MASK_START = "  /* kc:icon-masks:start */";
const MASK_END = "  /* kc:icon-masks:end */";

/** Phosphor ships one `<path>` per glyph at 256×256 with `fill="currentColor"`. */
async function readGlyph(name) {
  let raw;
  try {
    raw = await readFile(path.join(assetDir, `${name}.svg`), "utf8");
  } catch {
    throw new Error(
      `No Phosphor ${WEIGHT} glyph named "${name}". Check the name against ` +
        `node_modules/@phosphor-icons/core/assets/${WEIGHT}/.`,
    );
  }
  const svg = raw.trim();
  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error(`Unexpected SVG shape for "${name}".`);
  }
  if (!svg.includes('fill="currentColor"')) {
    throw new Error(
      `"${name}" does not paint with currentColor, so it cannot take its ink ` +
        `from the component that renders it.`,
    );
  }
  return svg;
}

/*
 * A mask needs no color — only the shape matters, because `background-color`
 * supplies the ink. Dropping the fill is what makes one glyph serve both the
 * light and dark callout without a second copy.
 */
function toMaskUrl(svg) {
  const shape = svg.replace(' fill="currentColor"', "");
  const encoded = shape
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
  return `url("data:image/svg+xml,${encoded}")`;
}

const glyphs = [];
for (const entry of MANIFEST) {
  glyphs.push({ ...entry, svg: await readGlyph(entry.name) });
}

const generatedBy = `Generated by scripts/icons/vendor-icons.mjs from @phosphor-icons/core@${phosphorVersion} (${WEIGHT}).`;

const dataModule = `/*
 * ${generatedBy}
 * Do not edit. Run \`pnpm icons:vendor\` after changing the manifest.
 *
 * Phosphor is MIT licensed; see node_modules/@phosphor-icons/core/LICENSE and
 * the LICENSE note in packages/react. Path data is vendored rather than
 * depended on at runtime, per ADR 0003.
 */

export const iconData = {
${glyphs.map((g) => `  ${JSON.stringify(g.name)}: ${JSON.stringify(g.svg)},`).join("\n")}
} as const;

/**
 * Every glyph the registry ships with. An unknown name is a compile error
 * rather than a silent miss at render time — the same reasoning that made a
 * nameless icon-only Button a type error rather than an axe violation.
 */
export type KeycapsIconName = keyof typeof iconData;
`;

const maskBlock = [
  MASK_START,
  `  /* ${generatedBy}`,
  `     Do not edit between these markers. Each is a mask, so the shape takes the`,
  `     tone's ink from \`background-color\` and needs no per-theme variant, and`,
  `     each is the same path the matching component renders. */`,
  ...glyphs
    .filter((g) => g.prose)
    .map((g) => `  --kc-prose-icon-${g.prose}: ${toMaskUrl(g.svg)};`),
  MASK_END,
].join("\n");

const prose = await readFile(prosePath, "utf8");
const startAt = prose.indexOf(MASK_START);
const endAt = prose.indexOf(MASK_END);
if (startAt === -1 || endAt === -1) {
  throw new Error(
    `${path.relative(repoRoot, prosePath)} has no kc:icon-masks markers to write between.`,
  );
}

const nextProse =
  prose.slice(0, startAt) + maskBlock + prose.slice(endAt + MASK_END.length);

/*
 * `--check` is the same computation with the writes withheld, rather than a
 * second implementation of it. A validator that can disagree with its generator
 * is one more thing that can be wrong.
 */
const checkOnly = process.argv.includes("--check");
const outputs = [
  { file: dataPath, next: dataModule },
  { file: prosePath, next: nextProse },
];

if (checkOnly) {
  const stale = [];
  for (const { file, next } of outputs) {
    const current = await readFile(file, "utf8").catch(() => null);
    if (current !== next) stale.push(path.relative(repoRoot, file));
  }
  if (stale.length > 0) {
    console.error(
      `Vendored icon output is stale:\n` +
        stale.map((f) => `  ${f}`).join("\n") +
        `\n\nRun \`pnpm icons:vendor\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(
    `Vendored icon output matches @phosphor-icons/core@${phosphorVersion} (${glyphs.length} glyphs).`,
  );
} else {
  await mkdir(path.dirname(dataPath), { recursive: true });
  for (const { file, next } of outputs) await writeFile(file, next);
  console.log(
    `Vendored ${glyphs.length} glyphs from @phosphor-icons/core@${phosphorVersion} ` +
      `(${glyphs.filter((g) => g.prose).length} also masked into prose.css).`,
  );
}
