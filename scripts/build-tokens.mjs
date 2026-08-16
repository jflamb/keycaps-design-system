import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createEmailTheme, serializeEmailTheme } from "./email-theme.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../packages/tokens");
const dist = path.join(packageRoot, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(packageRoot, "src"), dist, { recursive: true });
await cp(path.join(packageRoot, "fonts"), path.join(dist, "fonts"), { recursive: true });

const packageMetadata = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
const tokensCss = await readFile(path.join(packageRoot, "src/tokens.css"), "utf8");
const emailTheme = createEmailTheme({ css: tokensCss, packageVersion: packageMetadata.version });
await writeFile(path.join(dist, "email-theme.json"), serializeEmailTheme(emailTheme));
