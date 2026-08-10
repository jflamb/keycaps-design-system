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
    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        ["http:", "https:"].includes(url.protocol) &&
        url.origin !== "http://127.0.0.1:6006"
      )
        externalRequests.add(url.origin);
    });
    page.on("websocket", (socket) => {
      const url = new URL(socket.url());
      if (url.hostname !== "127.0.0.1" || url.port !== "6006")
        externalRequests.add(url.origin);
    });

    for (const theme of ["light", "dark"] as const) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
      );
      await page.waitForTimeout(150);
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const accessibility = await new AxeBuilder({ page })
        .include("#storybook-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(accessibility.violations, `${story.id} ${theme}`).toEqual([]);
      expect(runtimeErrors, `${story.id} ${theme} console and page errors`).toEqual(
        [],
      );
      runtimeErrors.length = 0;
    }

    if (story.id === "components-popover--escape-returns-focus") {
      const trigger = page.getByRole("button", { name: "Account help" });
      await expect(
        page.getByRole("dialog", { name: "Account help" }),
      ).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    if (story.id === "components-select--keyboard-selection") {
      const trigger = page.getByRole("button", { name: /Destination/ });
      await expect(trigger).toContainText("Resource");
      await expect(trigger).toBeFocused();
    }

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`,
    );
    await page.waitForTimeout(150);
    expect(runtimeErrors, `${story.id} reflow console and page errors`).toEqual([]);
    runtimeErrors.length = 0;
    const reflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(reflow.scrollWidth, story.id).toBeLessThanOrEqual(reflow.clientWidth);

    const focusableSelector =
      'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
    const visibleFocusableCount = await page.locator(focusableSelector).evaluateAll(
      (elements) => {
        const visible = elements.filter((element) => {
          const style = getComputedStyle(element);
          return (
            (element as HTMLElement).tabIndex >= 0 &&
            element.getAttribute("aria-disabled") !== "true" &&
            !element.closest('[inert], [aria-hidden="true"]') &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            element.getClientRects().length > 0
          );
        });
        visible.forEach((element, index) => {
          (element as HTMLElement).dataset.ellisReviewFocus = String(index);
        });
        return visible.length;
      },
    );
    if (visibleFocusableCount > 0) {
      await page.evaluate(() => {
        document.body.tabIndex = -1;
        document.body.focus();
      });
      const reached = new Set<string>();
      for (let attempt = 0; attempt < visibleFocusableCount + 2; attempt += 1) {
        await page.keyboard.press("Tab");
        const active = await page.evaluate(
          () => (document.activeElement as HTMLElement | null)?.dataset.ellisReviewFocus,
        );
        if (active !== undefined) reached.add(active);
      }
      expect(reached.size, `${story.id} keyboard traversal`).toBe(
        visibleFocusableCount,
      );
      const activatable = page
        .locator(
          'button:not([disabled]):not([aria-disabled="true"]):not([tabindex="-1"]), [role="button"]:not([aria-disabled="true"]):not([tabindex="-1"])',
        )
        .first();
      if (await activatable.isVisible().catch(() => false)) {
        await page.evaluate(() => {
          (window as typeof window & { __ellisKeyboardActivations?: number })
            .__ellisKeyboardActivations = 0;
          document.addEventListener(
            "click",
            (event) => {
              if (event.detail === 0) {
                const value = window as typeof window & {
                  __ellisKeyboardActivations?: number;
                };
                value.__ellisKeyboardActivations =
                  (value.__ellisKeyboardActivations || 0) + 1;
              }
            },
            { capture: true, once: true },
          );
        });
        await activatable.focus();
        await page.keyboard.press("Enter");
        expect(
          await page.evaluate(
            () =>
              (window as typeof window & { __ellisKeyboardActivations?: number })
                .__ellisKeyboardActivations || 0,
          ),
          `${story.id} keyboard activation`,
        ).toBe(1);
      }
      await page.keyboard.press("Escape");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowUp");
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForTimeout(150);
    expect(runtimeErrors, `${story.id} reduced-motion console and page errors`).toEqual(
      [],
    );
    runtimeErrors.length = 0;
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
    await page.waitForTimeout(150);
    expect(runtimeErrors, `${story.id} forced-colors console and page errors`).toEqual(
      [],
    );
    runtimeErrors.length = 0;
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
