import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const storyPath =
  "/iframe.html?id=foundations-component-showcase--default&viewMode=story&globals=theme:light";

test("showcase is named, keyboard operable, and axe-clean", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:" && url.origin !== "http://127.0.0.1:6006") {
      externalRequests.push(request.url());
    }
  });

  await page.goto(storyPath);
  await expect(page).toHaveTitle(/foundations-component-showcase--default/i);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A calm foundation for consequential work",
    }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Project name" })).toBeVisible();

  const select = page.getByRole("button", { name: /Destination/ });
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.type("Resources");
  await page.keyboard.press("Enter");
  await expect(select).toContainText("Resources");

  const help = page.getByRole("button", { name: "Why this matters" });
  await help.click();
  await expect(
    page.getByRole("dialog", { name: "Why the destination matters" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(help).toBeFocused();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("explicit light and dark themes resolve to distinct semantic colors", async ({
  page,
}) => {
  await page.goto(storyPath);
  const light = await page.evaluate(() => ({
    background: getComputedStyle(document.documentElement)
      .getPropertyValue("--kc-color-surface")
      .trim(),
    text: getComputedStyle(document.documentElement)
      .getPropertyValue("--kc-color-text")
      .trim(),
  }));

  await page.goto(storyPath.replace("theme:light", "theme:dark"));
  const dark = await page.evaluate(() => ({
    background: getComputedStyle(document.documentElement)
      .getPropertyValue("--kc-color-surface")
      .trim(),
    text: getComputedStyle(document.documentElement)
      .getPropertyValue("--kc-color-text")
      .trim(),
  }));

  expect(light).not.toEqual(dark);
  expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
});

test("reduced motion removes key travel and overlay animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(storyPath);

  const transitionDuration = await page
    .getByRole("button", { name: "Save settings" })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  const durations = transitionDuration.split(",").map((value) => {
    const trimmed = value.trim();
    return trimmed.endsWith("ms")
      ? Number.parseFloat(trimmed) / 1000
      : Number.parseFloat(trimmed);
  });
  expect(Math.max(...durations)).toBeLessThanOrEqual(0.001);

  await page.getByRole("button", { name: "Why this matters" }).click();
  const animationName = await page
    .getByRole("dialog", { name: "Why the destination matters" })
    .locator("..")
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});

test("forced colors preserve borders and a visible keyboard focus indicator", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto(storyPath);
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);

  const save = page.getByRole("button", { name: "Save settings" });
  await save.focus();
  const styles = await save.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      border: computed.borderBottomStyle,
      outline: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
    };
  });
  expect(styles.border).not.toBe("none");
  expect(styles.outline).not.toBe("none");
  expect(Number.parseFloat(styles.outlineWidth)).toBeGreaterThanOrEqual(3);
});

test("showcase reflows at 320 CSS pixels without horizontal page scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(storyPath);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
});
