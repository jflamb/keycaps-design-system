import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";

const SHA = /^[0-9a-f]{40}$/;

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const base = option("--base");
const head = option("--head");
const output = option("--output") || ".review/affected-stories.json";
if (!base || !head || !SHA.test(base) || !SHA.test(head)) {
  throw new Error("--base and --head must be exact 40-character lowercase SHAs");
}

const changedFiles = execFileSync(
  "git",
  ["diff", "--name-only", "--diff-filter=ACMRT", `${base}...${head}`],
  { encoding: "utf8" },
)
  .split("\n")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => posix.normalize(value));

const index = JSON.parse(
  readFileSync("apps/storybook/storybook-static/index.json", "utf8"),
);
const entries = Object.values(index.entries || {}).filter(
  (entry) => entry && entry.type === "story" && typeof entry.id === "string",
);
const globalSurfaceChanged = changedFiles.some(
  (path) =>
    path.startsWith("packages/tokens/") ||
    path.startsWith("apps/storybook/.storybook/") ||
    path === "playwright.config.ts",
);
const componentNames = new Set(
  changedFiles
    .filter((path) =>
      /^packages\/react\/src\/components\/[^/]+\.(tsx|ts|css)$/.test(path),
    )
    .map((path) => path.split("/").at(-1).replace(/\.(tsx|ts|css)$/, "")),
);
const storyPathChanged = (importPath) => {
  const normalized = String(importPath).replace(/^\.\//, "");
  return changedFiles.some(
    (path) =>
      normalized.endsWith(path) ||
      path.endsWith(normalized) ||
      (path.includes(".stories.") &&
        normalized.endsWith(path.split("apps/storybook/").at(-1))),
  );
};

let selected = entries.filter((entry) => {
  if (globalSurfaceChanged) return true;
  if (storyPathChanged(entry.importPath)) return true;
  return [...componentNames].some((name) =>
    String(entry.importPath).endsWith(`/${name}.stories.tsx`),
  );
});

if (selected.length === 0) {
  const baseline = new Set([
    "foundations-component-showcase--default",
    "components-app-shell--default",
    "components-button--primary",
    "components-data-table--wide-and-scrolling",
  ]);
  selected = entries.filter((entry) => baseline.has(entry.id));
}

const receipt = {
  version: "KeycapsAffectedStories v1",
  baseSha: base,
  headSha: head,
  changedFiles,
  selectionMode: globalSurfaceChanged
    ? "all-stories"
    : componentNames.size > 0 || changedFiles.some((path) => path.includes(".stories."))
      ? "changed-stories"
      : "representative-baseline",
  stories: selected
    .map((entry) => ({ id: entry.id, title: entry.title, name: entry.name }))
    .sort((left, right) => left.id.localeCompare(right.id)),
};
const target = resolve(output);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ ...receipt, changedFiles: changedFiles.length, stories: receipt.stories.length })}\n`,
);
