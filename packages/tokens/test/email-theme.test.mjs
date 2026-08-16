import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createEmailTheme, themeDigest } from "../../../scripts/email-theme.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(packageRoot, "src/tokens.css"), "utf8");

test("email theme flattens the current semantic Keycaps values", () => {
  const theme = createEmailTheme({ css: source, packageVersion: "9.8.7" });
  assert.equal(theme.schema, "keycaps-email-theme/v1");
  assert.equal(theme.keycapsVersion, "9.8.7");
  assert.equal(theme.tokens.colors.surface, "#f5f5f3");
  assert.match(theme.tokens.fonts.display, /Piazzolla/);
  assert.equal(theme.tokens.fontWeights.display, "580");
  assert.equal(
    theme.digest,
    themeDigest(Object.fromEntries(Object.entries(theme).filter(([key]) => key !== "digest"))),
  );
});

test("font and color edits propagate without changing the email generator", () => {
  const changed = source
    .replace('"Piazzolla", Georgia', '"Example Display", Georgia')
    .replace("--kc-color-cloud: #f5f5f3", "--kc-color-cloud: #faf9f7");
  const theme = createEmailTheme({ css: changed, packageVersion: "1.0.0" });
  assert.match(theme.tokens.fonts.display, /Example Display/);
  assert.equal(theme.tokens.colors.surface, "#faf9f7");
});

test("missing required semantic tokens fail the build", () => {
  const changed = source.replace("--kc-color-link:", "--removed-color-link:");
  assert.throws(
    () => createEmailTheme({ css: changed, packageVersion: "1.0.0" }),
    /requires missing token --kc-color-link/,
  );
});
