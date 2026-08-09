#!/usr/bin/env node
/**
 * The drift gate, shipped rather than copied.
 *
 * ADR 0002 names enforcement-where-the-divergence-happens as one of the three
 * things that actually deliver "fix it once". The invariants this checks are
 * Keycaps' invariants, so a consumer that carried its own copy of the check
 * would be free to let it rot — five copies of an anti-drift script is a drift
 * problem wearing a disguise. It lives in the tokens package because that is
 * what defines the `--kc-` namespace, and every consumer installs it anyway.
 *
 * Two rules, from ADR 0002:
 *
 *   1. No raw color literals, and no design-token declarations outside the
 *      `--kc-` namespace. A consumer that needs a color Keycaps lacks should be
 *      adding the token upstream, which is the whole point.
 *   2. No `.kc-` selector defined or overridden. This is the one that makes
 *      re-forking the vocabulary a build failure rather than a code review
 *      someone loses — the specific way `ledger.css` happened.
 *
 * Configured by `.keycaps-lint.json` in the consumer repo:
 *
 *   {
 *     "include": ["src/**\/*.css", "public/*.css"],
 *     "allowFiles": ["src/legacy.css"],
 *     "allowTokens": ["--chart-*"]
 *   }
 *
 * `allowFiles` is how a repo declares its pre-migration debt. Every entry is
 * meant to be deleted by the phase that migrates that file, so the list is a
 * ratchet and its length is a progress bar. `include` takes any extension on
 * purpose: two consumers keep their CSS inside a TypeScript string or in a
 * directory their other tooling never looks at.
 */

import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONFIG_NAME = ".keycaps-lint.json";

/**
 * Color literals in every notation CSS currently offers, including the ones a
 * project is most likely to reach for *next* — `oklch()` and `color-mix()` are
 * here before anyone has used them, because the cost of adding a notation after
 * it appears in a consumer is a migration rather than a rule change.
 */
const COLOR_PATTERNS = [
  { name: "hex color", re: /#[0-9a-f]{3,8}\b/gi },
  { name: "rgb()", re: /\brgba?\(/gi },
  { name: "hsl()", re: /\bhsla?\(/gi },
  { name: "oklch()", re: /\boklch\(/gi },
  { name: "oklab()", re: /\boklab\(/gi },
  { name: "lch()", re: /\blch\(/gi },
  { name: "lab()", re: /\blab\(/gi },
  { name: "color-mix()", re: /\bcolor-mix\(/gi },
  { name: "color()", re: /\bcolor\(/gi },
];

/**
 * A custom property declaration is only a *design token* if it names something
 * the design system owns. `--header-height` is layout a product is entitled to
 * decide; `--panel-radius` is the system's job. Matching on the noun rather than
 * on every `--` declaration keeps the rule pointed at vocabulary divergence
 * instead of at every local variable a stylesheet defines.
 */
const TOKEN_NOUNS =
  /(color|colour|bg|background|surface|ink|text|border|divider|shadow|radius|space|spacing|gap|font|type|size|weight|leading|tracking|duration|ease|easing|transition|elevation|z-index)/i;

/**
 * A declaration starts after a `{` or a `;`, not at the start of a line. Minified
 * CSS, a `:root { --x: 1px; }` written on one line, and anything a formatter has
 * collapsed all put declarations mid-line, and anchoring to `^` silently misses
 * every one of them — a gate that reads clean on the files most likely to
 * contain the problem.
 */
const CUSTOM_PROPERTY = /(?:^|[;{])\s*(--[a-z0-9-]+)\s*:/gm;
const KC_SELECTOR = /^[^@\n]*?(\.kc-[a-z0-9_-]+)/gim;

/** The custom property whose value contains `index`, if any. */
function owningProperty(source, index) {
  const start = Math.max(source.lastIndexOf("{", index), source.lastIndexOf(";", index));
  return /^\s*(--[a-z0-9-]+)\s*:/.exec(source.slice(start + 1, index))?.[1];
}

function toMatcher(pattern) {
  // Only `*` is meaningful, so a pattern reads like the token it describes.
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

/** Strip comments so a rule documented in prose is not read as a violation. */
function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));
}

function checkColors(source, allowTokens) {
  const findings = [];
  for (const { name, re } of COLOR_PATTERNS) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source)) !== null) {
      // A declaration the repo has explicitly claimed may still name a color —
      // that is what an allowed token is for.
      const owner = owningProperty(source, match.index);
      if (owner && allowTokens.some((matcher) => matcher.test(owner))) continue;
      findings.push({
        line: lineOf(source, match.index),
        rule: "raw-color",
        detail: `${name} \`${match[0]}\` — use a --kc- token, or add one upstream if none fits`,
      });
    }
  }
  return findings;
}

function checkTokens(source, allowTokens) {
  const findings = [];
  CUSTOM_PROPERTY.lastIndex = 0;
  let match;
  while ((match = CUSTOM_PROPERTY.exec(source)) !== null) {
    const name = match[1];
    if (name.startsWith("--kc-")) continue;
    if (!TOKEN_NOUNS.test(name)) continue;
    if (allowTokens.some((matcher) => matcher.test(name))) continue;
    findings.push({
      line: lineOf(source, match.index),
      rule: "local-token",
      detail: `\`${name}\` declares a design token outside the --kc- namespace`,
    });
  }
  return findings;
}

function checkKcSelectors(source) {
  const findings = [];
  KC_SELECTOR.lastIndex = 0;
  let match;
  while ((match = KC_SELECTOR.exec(source)) !== null) {
    findings.push({
      line: lineOf(source, match.index),
      rule: "kc-override",
      detail: `\`${match[1]}\` — Keycaps owns this class; compose or propose a change upstream`,
    });
  }
  return findings;
}

const root = process.cwd();
let config;
try {
  config = JSON.parse(await readFile(path.join(root, CONFIG_NAME), "utf8"));
} catch {
  process.stderr.write(`keycaps-css-lint: no ${CONFIG_NAME} found in ${root}\n`);
  process.exit(2);
}

const allowFiles = new Set(config.allowFiles ?? []);
const allowTokens = (config.allowTokens ?? []).map(toMatcher);
const include = config.include ?? [];
if (include.length === 0) {
  process.stderr.write(`keycaps-css-lint: ${CONFIG_NAME} lists no "include" patterns\n`);
  process.exit(2);
}

const files = new Set();
for (const pattern of include) {
  for await (const entry of glob(pattern, { cwd: root })) files.add(entry);
}

const report = [];
let skipped = 0;
for (const file of [...files].sort()) {
  if (allowFiles.has(file)) {
    skipped += 1;
    continue;
  }
  const source = withoutComments(await readFile(path.join(root, file), "utf8"));
  const findings = [
    ...checkColors(source, allowTokens),
    ...checkTokens(source, allowTokens),
    ...checkKcSelectors(source),
  ].sort((a, b) => a.line - b.line);
  if (findings.length > 0) report.push({ file, findings });
}

if (skipped > 0) {
  // Never silent about what was not checked. An allowlist that stops being
  // visible stops being temporary.
  process.stdout.write(
    `keycaps-css-lint: ${skipped} file(s) allowlisted as pre-migration debt\n`,
  );
}

if (report.length === 0) {
  process.stdout.write(`keycaps-css-lint: ${files.size - skipped} file(s) clean\n`);
  process.exit(0);
}

for (const { file, findings } of report) {
  for (const { line, rule, detail } of findings) {
    process.stdout.write(`${file}:${line}  ${rule}  ${detail}\n`);
  }
}
const total = report.reduce((sum, entry) => sum + entry.findings.length, 0);
process.stdout.write(`\nkeycaps-css-lint: ${total} finding(s) in ${report.length} file(s)\n`);
process.exit(1);
