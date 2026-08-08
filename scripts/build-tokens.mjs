import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../packages/tokens");
const dist = path.join(packageRoot, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(packageRoot, "src"), dist, { recursive: true });
await cp(path.join(packageRoot, "fonts"), path.join(dist, "fonts"), { recursive: true });
