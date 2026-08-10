import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { selectReviewStories } from "./review-story-selection.mjs";

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
const { selected, selectionMode } = selectReviewStories(
  Object.values(index.entries || {}),
  changedFiles,
);

const receipt = {
  version: "KeycapsAffectedStories v1",
  baseSha: base,
  headSha: head,
  changedFiles,
  selectionMode,
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
