import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storybook = path.join(repositoryRoot, "apps/storybook/storybook-static");

await mkdir(storybook, { recursive: true });
await Promise.all([
  copyFile(
    path.join(repositoryRoot, "packages/tokens/dist/email-theme.json"),
    path.join(storybook, "email-theme.json"),
  ),
  copyFile(
    path.join(repositoryRoot, "packages/tokens/email-theme-v1.schema.json"),
    path.join(storybook, "email-theme-v1.schema.json"),
  ),
]);

process.stdout.write("Published the Keycaps email theme with the Storybook artifact.\n");
