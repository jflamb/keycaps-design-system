/**
 * The gate's own gate.
 *
 * This script is the thing standing between five repos and a second
 * `ledger.css`, and it runs in repos where nobody is looking at it. A rule that
 * has never been seen failing has not been tested, and a rule that has never
 * been seen *passing* is worse — it gets disabled the first morning it blocks a
 * release for the wrong reason.
 */

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { after, before, describe, it } from "node:test";

const run = promisify(execFile);
const bin = fileURLToPath(new URL("../bin/keycaps-css-lint.mjs", import.meta.url));

let workspace;
before(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "kc-lint-"));
});
after(async () => {
  await rm(workspace, { recursive: true, force: true });
});

/** Write a config and a stylesheet, run the linter, and hand back its verdict. */
async function lint(css, config = {}) {
  await writeFile(path.join(workspace, "app.css"), css, "utf8");
  await writeFile(
    path.join(workspace, ".keycaps-lint.json"),
    JSON.stringify({ include: ["*.css"], ...config }),
    "utf8",
  );
  try {
    const { stdout } = await run(process.execPath, [bin], { cwd: workspace });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code, stdout: error.stdout ?? "" };
  }
}

describe("keycaps-css-lint", () => {
  it("passes a stylesheet built from --kc- tokens", async () => {
    const { code, stdout } = await lint(
      `.panel {\n  color: var(--kc-color-text);\n  padding: var(--kc-space-6);\n}\n`,
    );
    assert.equal(code, 0, stdout);
  });

  it("fails a raw hex color", async () => {
    const { code, stdout } = await lint(`.panel { color: #c7452c; }\n`);
    assert.equal(code, 1);
    assert.match(stdout, /raw-color/);
    assert.match(stdout, /#c7452c/);
  });

  it("fails every color notation, including ones nobody has used yet", async () => {
    for (const value of [
      "#fff",
      "rgb(1 2 3)",
      "rgba(1,2,3,.5)",
      "hsl(1 2% 3%)",
      "oklch(70% .1 20)",
      "color-mix(in oklab, red, blue)",
    ]) {
      const { code, stdout } = await lint(`.panel { color: ${value}; }\n`);
      assert.equal(code, 1, `${value} should fail — ${stdout}`);
    }
  });

  it("fails a design token declared outside the --kc- namespace", async () => {
    const { code, stdout } = await lint(`:root { --panel-radius: 18px; }\n`);
    assert.equal(code, 1);
    assert.match(stdout, /local-token/);
  });

  it("allows a local custom property that is not a design token", async () => {
    // `--nav-width` is layout a product is entitled to decide for itself.
    const { code, stdout } = await lint(`:root { --nav-width: 286px; }\n`);
    assert.equal(code, 0, stdout);
  });

  it("fails a .kc- selector, which is how the vocabulary gets re-forked", async () => {
    const { code, stdout } = await lint(`.kc-button { border-radius: 0; }\n`);
    assert.equal(code, 1);
    assert.match(stdout, /kc-override/);
  });

  it("catches a .kc- override nested inside another selector", async () => {
    const { code } = await lint(`.sidebar .kc-card { box-shadow: none; }\n`);
    assert.equal(code, 1);
  });

  it("does not read its own documentation as a violation", async () => {
    const { code, stdout } = await lint(
      `/* Do not write #ff0000 here, and never restyle .kc-button. */\n.panel { color: var(--kc-color-text); }\n`,
    );
    assert.equal(code, 0, stdout);
  });

  it("honors an allowed token pattern and the color it carries", async () => {
    const { code, stdout } = await lint(`:root { --chart-series-color: #d99a3d; }\n`, {
      allowTokens: ["--chart-*"],
    });
    assert.equal(code, 0, stdout);
  });

  it("honors a file allowlisted for token and color debt, and says so out loud", async () => {
    const { code, stdout } = await lint(`.panel { color: #c7452c; }\n`, {
      allowFiles: ["app.css"],
    });
    assert.equal(code, 0, stdout);
    // Silent truncation would let an allowlist quietly become permanent.
    assert.match(stdout, /1 file\(s\) allowlisted for pre-migration token and color debt/);
  });

  it("still fails a .kc- override in a file allowlisted for migration debt", async () => {
    const { code, stdout } = await lint(
      `.kc-button { color: #c7452c; }\n`,
      { allowFiles: ["app.css"] },
    );
    assert.equal(code, 1);
    assert.match(stdout, /kc-override/);
    assert.doesNotMatch(stdout, /raw-color/);
  });

  it("exits 2 rather than 0 when it has nothing to check", async () => {
    // A misconfigured gate must not look like a passing one.
    await writeFile(
      path.join(workspace, ".keycaps-lint.json"),
      JSON.stringify({ include: [] }),
      "utf8",
    );
    const { code } = await lint(`.panel { color: #c7452c; }\n`, { include: [] });
    assert.equal(code, 2);
  });

  it("exits 2 when configured include globs match no files", async () => {
    const { code } = await lint(`.panel { color: #c7452c; }\n`, {
      include: ["missing/**/*.css"],
    });
    assert.equal(code, 2);
  });
});
