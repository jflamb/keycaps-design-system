import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageFiles = [
  path.join(repositoryRoot, "packages/tokens/package.json"),
  path.join(repositoryRoot, "packages/react/package.json"),
];

const packages = await Promise.all(
  packageFiles.map(async (file) => JSON.parse(await readFile(file, "utf8"))),
);

const versions = new Set(packages.map((pkg) => pkg.version));
if (versions.size !== 1) {
  throw new Error(
    `Keycaps uses a fixed release train; package versions differ: ${packages
      .map((pkg) => `${pkg.name}@${pkg.version}`)
      .join(", ")}`,
  );
}

const [version] = versions;
const releaseTag =
  process.env.GITHUB_REF_NAME || process.argv.slice(2).find((value) => value !== "--");
const expectedTag = `v${version}`;

if (!releaseTag) {
  throw new Error(`Provide a release tag. Expected ${expectedTag}.`);
}

if (releaseTag !== expectedTag) {
  throw new Error(`Release tag ${releaseTag} does not match package version ${version}. Expected ${expectedTag}.`);
}

const reactPeerVersion = packages[1].peerDependencies?.["@jflamb/keycaps-tokens"];
if (reactPeerVersion !== `^${version}`) {
  throw new Error(
    `@jflamb/keycaps-react must require @jflamb/keycaps-tokens@^${version}; found ${reactPeerVersion}.`,
  );
}

process.stdout.write(
  `Release ${releaseTag} verified for ${packages.map((pkg) => pkg.name).join(" and ")}.\n`,
);
