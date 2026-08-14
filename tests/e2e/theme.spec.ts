import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  createThemeBootstrapScript,
  KEYCAPS_THEME_COLORS,
} from "../../packages/react/src/theme.js";

const harnessPath = "/theme-bootstrap-harness";

function harness(script = createThemeBootstrapScript()) {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="">
        <script>${script}</script>
        <script>
          window.__keycapsFirstFrame = {
            theme: document.documentElement.getAttribute("data-theme"),
            themeColor: document.querySelector('meta[name="theme-color"]').content
          };
        </script>
        <link rel="stylesheet" href="/kc-tokens/tokens.css">
        <title>Keycaps theme bootstrap</title>
      </head>
      <body><main><h1>Keycaps theme bootstrap</h1></main></body>
    </html>`;
}

test.beforeEach(async ({ page }) => {
  await page.route(`**${harnessPath}`, (route) =>
    route.fulfill({ contentType: "text/html", body: harness() }),
  );
});

test("stored cookie wins before the first frame and theme-color follows every source", async ({
  context,
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await context.addCookies([
    {
      name: "jflamb-theme",
      value: "dark",
      url: "http://127.0.0.1:6006/",
    },
  ]);

  await page.goto(harnessPath);

  expect(
    await page.evaluate(() =>
      (window as Window & {
        __keycapsFirstFrame: { theme: string | null; themeColor: string };
      }).__keycapsFirstFrame,
    ),
  ).toEqual({ theme: "dark", themeColor: KEYCAPS_THEME_COLORS.dark });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.dark,
  );

  await page.locator("html").evaluate((root) => {
    root.dataset.theme = "light";
  });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.light,
  );

  await page.locator("html").evaluate((root) => {
    delete root.dataset.theme;
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.dark,
  );
});

test("ThemeToggle synchronizes browser chrome, system changes, and accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(
    "/iframe.html?id=components-themetoggle--default&viewMode=story&globals=theme:light",
  );
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "";
    document.head.append(meta);
  });

  const toggle = page.getByRole("button", { name: /Theme:/ });
  await expect(toggle).toHaveAttribute(
    "aria-label",
    "Theme: following the system. Switch to light.",
  );

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.light,
  );

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.dark,
  );

  await toggle.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.dark,
  );

  const accessibility = await new AxeBuilder({ page }).include(".kc-theme-toggle").analyze();
  expect(accessibility.violations).toEqual([]);
});

test("forced colors keeps a portable theme-color and reduced motion stays authoritative", async ({
  context,
  page,
}) => {
  await context.clearCookies();
  await page.emulateMedia({
    colorScheme: "dark",
    forcedColors: "active",
    reducedMotion: "reduce",
  });
  await page.goto(harnessPath);

  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    true,
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    KEYCAPS_THEME_COLORS.dark,
  );
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--kc-press-travel").trim(),
    ),
  ).toBe("0px");
});
