/**
 * The Mode 1 consumption proof, and the reference implementation the two
 * static-render consumers are meant to copy.
 *
 * The browser fixture beside this one proves Mode 2: a bundler resolves the
 * package, React runs, components mount. It cannot prove Mode 1, because Mode 1
 * has no bundler and no client React — it is a Node script that renders HTML at
 * build time and copies three stylesheets. Nothing in this repo exercised that
 * path until this file existed, which meant the delivery decision in ADR 0002
 * was half-tested.
 *
 * Everything here resolves through the published `exports` map rather than
 * through a relative path into `dist/`. That is the part worth having: a
 * missing subpath, a wrong `types` condition, or a stylesheet that never made it
 * into the package fails here rather than in a consumer.
 */

import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createElement as h } from "react";
import {
  AppShell,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  Badge,
  CodeBlock,
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  LinkButton,
  PageHeader,
  Select,
} from "@jflamb/keycaps-react";
import {
  renderStatic,
  renderStaticDocument,
  StaticRenderError,
} from "@jflamb/keycaps-react/static";

const outDir = fileURLToPath(new URL("./dist", import.meta.url));
const assetDir = path.join(outDir, "kc");

await mkdir(assetDir, { recursive: true });

// The token entry is an `@import` of three siblings, and `fonts.css` in turn
// points at `./fonts/*`. Copying the one file the specifier resolves to
// produces a page that looks almost right and has no fonts, no reset, and no
// tokens — so the whole directory travels, which is also what a consumer's
// build step has to do. This fixture copied a single file first, and the
// assertions below are what caught it.
const tokensDist = path.dirname(fileURLToPath(import.meta.resolve("@jflamb/keycaps-tokens")));
await cp(tokensDist, path.join(assetDir, "tokens"), { recursive: true });

// A Mode 1 page needs exactly three stylesheets, and `static.css` is the one
// that is easy to forget — without it the page renders correctly at rest and is
// completely inert, which is the failure the whole delivery model exists to
// prevent, arriving through the front door.
for (const [name, specifier] of [
  ["styles.css", "@jflamb/keycaps-react/styles.css"],
  ["static.css", "@jflamb/keycaps-react/static.css"],
]) {
  await cp(fileURLToPath(import.meta.resolve(specifier)), path.join(assetDir, name));
}

const hrefs = ["./kc/tokens/index.css", "./kc/styles.css", "./kc/static.css"];

const page = h(
  AppShell,
  null,
  h(AppShellHeader, {
    brand: "mcp-consumer",
    actions: h(LinkButton, { href: "#docs", size: "small", variant: "secondary" }, "Docs"),
  }),
  h(
    AppShellMain,
    null,
    h(PageHeader, {
      eyebrow: "Model Context Protocol",
      title: "Rendered at build time",
      description: "The real Keycaps components, as HTML, with no client React.",
      actions: h(LinkButton, { href: "#start" }, "Get started"),
      children: h(Badge, { icon: true, shape: "pill", tone: "success" }, "Live"),
    }),
    h(
      DescriptionList,
      { layout: "grid" },
      h(
        DescriptionListItem,
        null,
        h(DescriptionTerm, null, "Tools"),
        h(DescriptionDetails, null, "34"),
      ),
      h(
        DescriptionListItem,
        null,
        h(DescriptionTerm, null, "Prompts"),
        h(DescriptionDetails, null, "12"),
      ),
    ),
    h(CodeBlock, { label: "Terminal" }, "npx @jflamb/mcp-consumer"),
  ),
  h(AppShellFooter, null, "MIT licensed. No telemetry."),
);

const html = renderStaticDocument({
  title: "Keycaps static render proof",
  description: "The Mode 1 consumption fixture.",
  stylesheets: hrefs,
  children: page,
});

await writeFile(path.join(outDir, "static.html"), html, "utf8");

/* ---- Assertions ---------------------------------------------------------- */

function assert(condition, message) {
  if (!condition) {
    process.stderr.write(`Mode 1 consumption proof failed: ${message}\n`);
    process.exit(1);
  }
}

// ADR 0002 asks this fixture to track `main` rather than a release, so a
// breaking change surfaces here before five consumer repos find it separately.
// It does — via `workspace:*` — but nothing said so out loud, and a fixture
// quietly pinned to the last published version is the one failure mode that
// looks green while proving the opposite of what it claims. Both halves are
// asserted: the specifier, which catches a deliberate pin, and the resolved
// path, which catches everything else.
const fixtureManifest = JSON.parse(
  await readFile(fileURLToPath(new URL("./package.json", import.meta.url)), "utf8"),
);
const packagesDir = fileURLToPath(new URL("../../packages/", import.meta.url));
for (const name of ["@jflamb/keycaps-tokens", "@jflamb/keycaps-react"]) {
  const specifier = fixtureManifest.dependencies?.[name];
  assert(
    specifier?.startsWith("workspace:"),
    `${name} is pinned to ${specifier} rather than this repo's source`,
  );
  assert(
    fileURLToPath(import.meta.resolve(name)).startsWith(packagesDir),
    `${name} resolved outside packages/, so this fixture is proving a published copy`,
  );
}

// Every stylesheet the document links, and everything those stylesheets import,
// has to exist beside them. A missing `@import` target fails silently in a
// browser: the page renders, unstyled in exactly the ways nobody screenshots.
for (const relative of [
  "tokens/index.css",
  "tokens/tokens.css",
  "tokens/fonts.css",
  "tokens/base.css",
  "tokens/prose.css",
  "tokens/fonts/piazzolla-latin-opsz-normal.woff2",
  "tokens/fonts/sofia-sans-latin-wght-normal.woff2",
  "tokens/fonts/lilex-latin-wght-normal.woff2",
  "styles.css",
  "static.css",
]) {
  try {
    await access(path.join(assetDir, relative));
  } catch {
    assert(false, `the copied asset tree is missing kc/${relative}`);
  }
}

assert(html.startsWith("<!doctype html>"), "the document has no doctype");
assert(html.includes('href="./kc/static.css"'), "static.css is not linked");
assert(html.includes('class="kc-skip-link"'), "the shell rendered no skip link");
assert(html.includes('class="kc-app-shell__main"'), "the shell rendered no main region");
assert(html.includes('class="kc-button"'), "the call to action is not a Keycaps key");
assert(html.includes('data-tone="success"'), "the badge lost its tone");
assert(html.includes('tabindex="0"'), "the code block is not keyboard reachable");
assert(
  !html.includes("data-hovered") && !html.includes("data-pressed"),
  "React Aria runtime state leaked into static output",
);

// The Mode 1 exclusion is a build failure, not a note in a document.
let threw = false;
try {
  renderStatic(h(Select, { label: "Where", options: [{ id: "a", label: "A" }] }));
} catch (error) {
  threw = error instanceof StaticRenderError;
}
assert(threw, "renderStatic accepted a Select, which cannot degrade to CSS");

process.stdout.write(
  `Mode 1 consumption proof: ${path.relative(process.cwd(), path.join(outDir, "static.html"))}\n`,
);
