import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const basePath = "/keycaps-design-system/";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../apps/storybook/storybook-static",
);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    if (!pathname.startsWith(basePath)) {
      response.writeHead(404).end("Not found");
      return;
    }

    const relativePath = pathname.slice(basePath.length);
    let target = path.resolve(root, relativePath || "index.html");
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const metadata = await stat(target);
    if (metadata.isDirectory()) target = path.join(target, "index.html");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(path.extname(target)) ?? "application/octet-stream",
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Pages test server did not start.");

const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  const externalRequests = [];
  const failedRequests = [];
  const consoleErrors = [];

  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin) externalRequests.push(request.url());
  });
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(
    `${origin}${basePath}iframe.html?id=introduction--guidance&viewMode=docs`,
    { waitUntil: "networkidle" },
  );

  const heading = page.getByRole("heading", {
    level: 1,
    name: "Keycaps Design System",
  });
  if (!(await heading.isVisible())) throw new Error("Storybook introduction did not render.");
  if (externalRequests.length > 0) {
    throw new Error(`Pages build made off-origin requests: ${externalRequests.join(", ")}`);
  }
  if (failedRequests.length > 0) {
    throw new Error(`Pages build had failed requests: ${failedRequests.join(", ")}`);
  }
  if (consoleErrors.length > 0) {
    throw new Error(`Pages build logged console errors: ${consoleErrors.join(" | ")}`);
  }

  process.stdout.write(`Storybook verified at the GitHub Pages base path ${basePath}.\n`);
} finally {
  await browser.close();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
