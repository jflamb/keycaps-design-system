import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error("Usage: pnpm version:set <semver>, for example pnpm version:set 0.2.0");
}

const repositoryRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tokenPath = path.join(repositoryRoot, "packages/tokens/package.json");
const reactPath = path.join(repositoryRoot, "packages/react/package.json");

const tokens = JSON.parse(await readFile(tokenPath, "utf8"));
const react = JSON.parse(await readFile(reactPath, "utf8"));

tokens.version = version;
react.version = version;
react.peerDependencies["@jflamb/keycaps-tokens"] = `^${version}`;

await Promise.all([
  writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`),
  writeFile(reactPath, `${JSON.stringify(react, null, 2)}\n`),
]);

process.stdout.write(`Set both Keycaps packages to ${version}.\n`);
