import { execFileSync } from "node:child_process";

const baseIndex = process.argv.indexOf("--base");
const headIndex = process.argv.indexOf("--head");
const base = baseIndex >= 0 ? process.argv[baseIndex + 1] : undefined;
const head = headIndex >= 0 ? process.argv[headIndex + 1] : undefined;
if (!base || !head) throw new Error("review requires --base and --head");

execFileSync(
  process.execPath,
  ["scripts/select-review-stories.mjs", "--base", base, "--head", head],
  { stdio: "inherit" },
);
execFileSync(
  "node_modules/.bin/playwright",
  ["test", "tests/e2e/review-affected.spec.ts"],
  { stdio: "inherit" },
);
