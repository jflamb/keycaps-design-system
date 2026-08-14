import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function englishList(values) {
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function licenseFileForFamily(family) {
  const slug = family
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `LICENSE-${slug}.txt`;
}

function inventoryFromCss(css, sourceName) {
  const faces = [...css.matchAll(/@font-face\s*{([\s\S]*?)}/g)];
  if (faces.length === 0) {
    throw new Error(`${sourceName} contains no @font-face declarations.`);
  }

  const families = new Map();
  for (const [, body] of faces) {
    const family = body.match(/font-family:\s*["']([^"']+)["']\s*;/)?.[1];
    const urls = [...body.matchAll(/url\(["']?\.\/fonts\/([^"')]+\.woff2)["']?\)/g)].map(
      (match) => match[1],
    );
    if (!family || urls.length === 0) {
      throw new Error(
        `${sourceName} has an @font-face without a quoted family and a local ./fonts/*.woff2 URL.`,
      );
    }
    const files = families.get(family) ?? new Set();
    urls.forEach((file) => files.add(file));
    families.set(family, files);
  }

  return {
    families: [...families.keys()],
    fontFiles: sorted(new Set([...families.values()].flatMap((files) => [...files]))),
    licenseFiles: sorted([...families.keys()].map(licenseFileForFamily)),
  };
}

function assertEqualInventory(actual, expected, label) {
  const actualList = sorted(actual);
  const expectedList = sorted(expected);
  if (JSON.stringify(actualList) !== JSON.stringify(expectedList)) {
    throw new Error(
      `${label} mismatch. Expected [${expectedList.join(", ")}]; found [${actualList.join(", ")}].`,
    );
  }
}

async function filesNamed(directory, predicate) {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => entry.name);
}

async function assertGeneratedParity(sourceDirectory, builtDirectory) {
  const sourceFiles = sorted(await filesNamed(sourceDirectory, () => true));
  const builtFiles = sorted(await filesNamed(builtDirectory, () => true));
  assertEqualInventory(builtFiles, sourceFiles, "Built dist/fonts inventory");

  for (const file of sourceFiles) {
    const [source, built] = await Promise.all([
      readFile(path.join(sourceDirectory, file)),
      readFile(path.join(builtDirectory, file)),
    ]);
    if (!source.equals(built)) {
      throw new Error(`Built dist/fonts/${file} differs from packages/tokens/fonts/${file}.`);
    }
  }
}

function assertNotice(licenseText, inventory, label) {
  const expectedSentence = `The bundled font software is ${englishList(inventory.families)}.`;
  if (!licenseText.includes(expectedSentence)) {
    throw new Error(`${label} is missing the derived font inventory sentence: ${expectedSentence}`);
  }

  const entries = [...licenseText.matchAll(/^- (.+?) — `dist\/fonts\/(LICENSE-[A-Z0-9-]+\.txt)`$/gm)].map(
    ([, family, file]) => ({ family, file }),
  );
  const expectedEntries = inventory.families.map((family) => ({
    family,
    file: licenseFileForFamily(family),
  }));
  if (JSON.stringify(entries) !== JSON.stringify(expectedEntries)) {
    throw new Error(
      `${label} font notice mismatch. Expected ${expectedEntries
        .map(({ family, file }) => `${family} -> ${file}`)
        .join(", ")}; found ${entries
        .map(({ family, file }) => `${family} -> ${file}`)
        .join(", ") || "none"}.`,
    );
  }
}

export async function verifyFontLicenseInventory({ repositoryRoot, packedPaths }) {
  const packageRoot = path.join(repositoryRoot, "packages/tokens");
  const sourceFonts = path.join(packageRoot, "fonts");
  const builtFonts = path.join(packageRoot, "dist/fonts");
  const [sourceCss, builtCss, packageLicense, repositoryLicense] = await Promise.all([
    readFile(path.join(packageRoot, "src/fonts.css"), "utf8"),
    readFile(path.join(packageRoot, "dist/fonts.css"), "utf8"),
    readFile(path.join(packageRoot, "LICENSE"), "utf8"),
    readFile(path.join(repositoryRoot, "LICENSE"), "utf8"),
  ]);

  if (sourceCss !== builtCss) {
    throw new Error("Built dist/fonts.css differs from packages/tokens/src/fonts.css.");
  }
  if (packageLicense !== repositoryLicense) {
    throw new Error("Repository and @jflamb/keycaps-tokens LICENSE notices differ.");
  }

  const inventory = inventoryFromCss(builtCss, "packages/tokens/dist/fonts.css");
  const sourceWoff = await filesNamed(sourceFonts, (name) => name.endsWith(".woff2"));
  const sourceOfl = await filesNamed(sourceFonts, (name) => /^LICENSE-.+\.txt$/.test(name));
  assertEqualInventory(sourceWoff, inventory.fontFiles, "Shipped WOFF2 inventory");
  assertEqualInventory(sourceOfl, inventory.licenseFiles, "Shipped OFL inventory");
  assertNotice(packageLicense, inventory, "@jflamb/keycaps-tokens LICENSE");
  await assertGeneratedParity(sourceFonts, builtFonts);

  const packedWoff = packedPaths
    .filter((file) => /^dist\/fonts\/.+\.woff2$/.test(file))
    .map((file) => path.basename(file));
  const packedOfl = packedPaths
    .filter((file) => /^dist\/fonts\/LICENSE-.+\.txt$/.test(file))
    .map((file) => path.basename(file));
  assertEqualInventory(packedWoff, inventory.fontFiles, "npm pack WOFF2 inventory");
  assertEqualInventory(packedOfl, inventory.licenseFiles, "npm pack OFL inventory");

  for (const required of ["LICENSE", "dist/fonts.css"]) {
    if (!packedPaths.includes(required)) {
      throw new Error(`npm pack output is missing ${required}.`);
    }
  }

  return inventory;
}

async function npmPackFileList(repositoryRoot) {
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--dry-run", "--json", "./packages/tokens"],
    { cwd: repositoryRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const result = JSON.parse(stdout);
  if (!Array.isArray(result) || result.length !== 1 || !Array.isArray(result[0].files)) {
    throw new Error("npm pack --dry-run returned an unexpected manifest.");
  }
  return result[0].files.map(({ path: file }) => file);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const inventory = await verifyFontLicenseInventory({
    repositoryRoot,
    packedPaths: await npmPackFileList(repositoryRoot),
  });
  process.stdout.write(
    `Verified ${inventory.families.length} font licenses for ${inventory.families.join(", ")} across source, build, and npm pack.\n`,
  );
}
