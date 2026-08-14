import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyFontLicenseInventory } from "./font-license-inventory.mjs";

const family = "Example Serif";
const fontFile = "example-serif-latin-wght-normal.woff2";
const oflFile = "LICENSE-EXAMPLE-SERIF.txt";

function notice({ noticeFamily = family, noticeFile = oflFile } = {}) {
  return `MIT License\n\n---\n\nThe bundled font software is ${noticeFamily}. Its license texts travel with the binaries:\n\n- ${noticeFamily} — \`dist/fonts/${noticeFile}\`\n`;
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "keycaps-font-license-"));
  const packageRoot = path.join(root, "packages/tokens");
  const sourceFonts = path.join(packageRoot, "fonts");
  const builtFonts = path.join(packageRoot, "dist/fonts");
  await Promise.all([
    mkdir(path.join(packageRoot, "src"), { recursive: true }),
    mkdir(sourceFonts, { recursive: true }),
    mkdir(builtFonts, { recursive: true }),
  ]);
  const css = `@font-face {\n  font-family: "${family}";\n  src: url("./fonts/${fontFile}") format("woff2-variations");\n}\n`;
  const license = notice();
  await Promise.all([
    writeFile(path.join(root, "LICENSE"), license),
    writeFile(path.join(packageRoot, "LICENSE"), license),
    writeFile(path.join(packageRoot, "src/fonts.css"), css),
    writeFile(path.join(packageRoot, "dist/fonts.css"), css),
    writeFile(path.join(sourceFonts, fontFile), "font"),
    writeFile(path.join(sourceFonts, oflFile), "ofl"),
    writeFile(path.join(builtFonts, fontFile), "font"),
    writeFile(path.join(builtFonts, oflFile), "ofl"),
  ]);
  return {
    root,
    packedPaths: ["LICENSE", "dist/fonts.css", `dist/fonts/${fontFile}`, `dist/fonts/${oflFile}`],
  };
}

async function withFixture(run) {
  const current = await fixture();
  try {
    await run(current);
  } finally {
    await rm(current.root, { recursive: true, force: true });
  }
}

test("derives a valid font and OFL inventory without a hard-coded family list", async () => {
  await withFixture(async ({ root, packedPaths }) => {
    const inventory = await verifyFontLicenseInventory({ repositoryRoot: root, packedPaths });
    assert.deepEqual(inventory.families, [family]);
    assert.deepEqual(inventory.licenseFiles, [oflFile]);
  });
});

test("rejects a missing notice reference", async () => {
  await withFixture(async ({ root, packedPaths }) => {
    const invalid = "MIT License\n\n---\n\nThe bundled font software is Example Serif.\n";
    await Promise.all([
      writeFile(path.join(root, "LICENSE"), invalid),
      writeFile(path.join(root, "packages/tokens/LICENSE"), invalid),
    ]);
    await assert.rejects(
      verifyFontLicenseInventory({ repositoryRoot: root, packedPaths }),
      /font notice mismatch/,
    );
  });
});

test("rejects an unreferenced shipped OFL", async () => {
  await withFixture(async ({ root, packedPaths }) => {
    await Promise.all([
      writeFile(path.join(root, "packages/tokens/fonts/LICENSE-ORPHAN.txt"), "ofl"),
      writeFile(path.join(root, "packages/tokens/dist/fonts/LICENSE-ORPHAN.txt"), "ofl"),
    ]);
    await assert.rejects(
      verifyFontLicenseInventory({ repositoryRoot: root, packedPaths }),
      /Shipped OFL inventory mismatch/,
    );
  });
});

test("rejects a stale font name even when its referenced file exists", async () => {
  await withFixture(async ({ root, packedPaths }) => {
    const invalid = notice({ noticeFamily: "Former Serif" });
    await Promise.all([
      writeFile(path.join(root, "LICENSE"), invalid),
      writeFile(path.join(root, "packages/tokens/LICENSE"), invalid),
    ]);
    await assert.rejects(
      verifyFontLicenseInventory({ repositoryRoot: root, packedPaths }),
      /derived font inventory sentence/,
    );
  });
});
