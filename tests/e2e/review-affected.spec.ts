import AxeBuilder from "@axe-core/playwright";
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

interface Receipt {
  version: "KeycapsAffectedStories v1";
  headSha: string;
  stories: Array<{ id: string; title: string; name: string }>;
}

const receiptPath = ".review/affected-stories.json";
const receipt = existsSync(receiptPath)
  ? (JSON.parse(readFileSync(receiptPath, "utf8")) as Receipt)
  : ({ version: "KeycapsAffectedStories v1", headSha: "", stories: [] } as Receipt);

test.skip(
  receipt.stories.length === 0,
  "run pnpm review:changed with exact --base and --head SHAs",
);

for (const story of receipt.stories) {
  test(`${story.id} satisfies the affected-story review matrix`, async ({ page }) => {
    const externalRequests = new Set<string>();
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        ["http:", "https:"].includes(url.protocol) &&
        url.origin !== "http://127.0.0.1:6006"
      )
        externalRequests.add(url.origin);
    });

    for (const theme of ["light", "dark"] as const) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
      );
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const accessibility = await new AxeBuilder({ page })
        .include("#storybook-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(accessibility.violations, `${story.id} ${theme}`).toEqual([]);
    }

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`,
    );
    const reflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(reflow.scrollWidth, story.id).toBeLessThanOrEqual(reflow.clientWidth);

    const focusableSelector =
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const visibleFocusableCount = await page.locator(focusableSelector).evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            element.getClientRects().length > 0
          );
        }).length,
    );
    if (visibleFocusableCount > 0) {
      await page.evaluate(() => {
        document.body.tabIndex = -1;
        document.body.focus();
      });
      let reachedFocusableControl = false;
      for (let attempt = 0; attempt < visibleFocusableCount + 2; attempt += 1) {
        await page.keyboard.press("Tab");
        reachedFocusableControl = await page.evaluate(
          (selector) => document.activeElement?.matches(selector) ?? false,
          focusableSelector,
        );
        if (reachedFocusableControl) break;
      }
      expect(reachedFocusableControl, `${story.id} keyboard traversal`).toBe(true);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
    ).toBe(true);
    const longestActiveMotionMs = await page.evaluate(() =>
      Math.max(
        0,
        ...document
          .getAnimations()
          .filter((animation) => animation.playState === "running")
          .map((animation) => {
            const duration = animation.effect?.getComputedTiming().duration;
            return typeof duration === "number" ? duration : 0;
          }),
      ),
    );
    expect(longestActiveMotionMs, `${story.id} reduced motion`).toBeLessThanOrEqual(10);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.reload();
    expect(
      await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
    ).toBe(true);
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .include("#storybook-root")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations, `${story.id} forced colors`).toEqual(
      [],
    );

    expect([...externalRequests], story.id).toEqual([]);
  });
}
