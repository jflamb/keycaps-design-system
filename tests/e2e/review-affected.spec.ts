import AxeBuilder from "@axe-core/playwright";
import { existsSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

interface Receipt {
  version: "KeycapsAffectedStories v1";
  headSha: string;
  stories: Array<{ id: string; title: string; name: string }>;
}

const receiptPath = ".review/affected-stories.json";
const receipt = existsSync(receiptPath)
  ? (JSON.parse(readFileSync(receiptPath, "utf8")) as Receipt)
  : ({ version: "KeycapsAffectedStories v1", headSha: "", stories: [] } as Receipt);

async function waitForStoryReady(page: Page) {
  await expect(page.locator("body")).toHaveClass(/sb-show-main/);
  await expect(page.locator("#storybook-root")).not.toHaveAttribute("inert", "");
}

/**
 * Let entrance animations finish before measuring colour.
 *
 * axe samples whatever is painted when it runs, and a surface that fades in from
 * `opacity: 0` is, mid-fade, every one of its real colours blended toward
 * whatever is behind it. A dialog caught at that moment reported its body ink at
 * 3.95:1 against a background no element declares — a violation belonging to the
 * frame rather than to the component.
 *
 * Deliberately *not* folded into `waitForStoryReady`. The reduced-motion section
 * below asserts that no animation is still running shortly after load, and
 * settling first would make that check pass by construction. So this is called
 * only before the runs that measure colour.
 */
async function settleAnimations(page: Page) {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return timing?.iterations !== Infinity;
    });
    await Promise.all(
      finite.map((animation) =>
        Promise.race([
          animation.finished,
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]).catch(() => undefined),
      ),
    );
  });
}

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
      await waitForStoryReady(page);
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await settleAnimations(page);
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
    await waitForStoryReady(page);
    expect(runtimeErrors, `${story.id} reflow console and page errors`).toEqual([]);
    runtimeErrors.length = 0;
    const reflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(reflow.scrollWidth, story.id).toBeLessThanOrEqual(reflow.clientWidth);

    const focusableSelector =
      'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), summary, [tabindex]:not([tabindex="-1"])';
    const visibleFocusableCount = await page.locator(focusableSelector).evaluateAll(
      (elements) => {
        /*
         * A modal `<dialog>` blocks everything outside it, and it does so
         * *implicitly* — the platform's "blocked by a modal dialog" state, not
         * an `inert` attribute this filter could see. So a story with an open
         * modal counted the trigger behind the scrim as a reachable control,
         * then failed because it is correctly unreachable. `:modal` is the
         * pseudo-class for exactly this state; scoping to it makes the
         * assertion stronger rather than weaker, since it now demands that
         * every control inside the modal is reachable and says nothing about
         * the page the modal has taken over.
         */
        const modal = document.querySelector("dialog:modal");
        const visible = elements.filter((element) => {
          const style = getComputedStyle(element);
          return (
            (element as HTMLElement).tabIndex >= 0 &&
            element.getAttribute("aria-disabled") !== "true" &&
            !["listbox", "option"].includes(element.getAttribute("role") || "") &&
            (!modal || modal.contains(element)) &&
            !element.closest('[inert], [aria-hidden="true"]') &&
            !element.closest(
              'details:not([open]) > *:not(summary), details:not([open]) > *:not(summary) *',
            ) &&
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
      // Scoped for the same reason as the count above: the first button in DOM
      // order may be behind an open modal, where focus and Enter cannot reach
      // it. The control this checks has to be one a keyboard can actually get to.
      const modalPrefix = await page.evaluate(() =>
        document.querySelector("dialog:modal") ? "dialog:modal " : "",
      );
      const activatable = page
        .locator(
          `${modalPrefix}button:not([disabled]):not([aria-disabled="true"]):not([tabindex="-1"]), ${modalPrefix}[role="button"]:not([aria-disabled="true"]):not([tabindex="-1"])`,
        )
        .first();
      if (await activatable.isVisible().catch(() => false)) {
        /*
         * Activation is counted two ways, because this system has two kinds of
         * control and only one of them dispatches a DOM click.
         *
         * A native control activated by Enter fires a `click` with `detail === 0`,
         * which is what this originally looked for. A React Aria control does
         * not: `usePress` calls `preventDefault` on the keydown, suppressing the
         * synthesized click, and invokes `onPress` directly — verified against
         * this build, where Enter on a Keycaps Button produces `keydown` and
         * `keyup` at `document` and no `click` at all. Since every interactive
         * Keycaps component is React Aria, the click-only detector could never
         * fire for one; it had simply never run, because every story sampled so
         * far skips this block on the `isVisible` guard above. The Dialog stories
         * are the first to satisfy the guard, which is how it surfaced. See
         * correction 32.
         *
         * The React Aria signal is the `data-pressed` attribute the press
         * machinery sets while the control is down — the same attribute
         * `styles.css` styles every pressed state through. Accepting either
         * signal widens what can be detected without loosening what is asserted:
         * the claim is still that pressing Enter on a focused control activated
         * it.
         */
        await activatable.evaluate((element) => {
          const scope = window as typeof window & {
            __ellisKeyboardActivations?: number;
          };
          scope.__ellisKeyboardActivations = 0;
          document.addEventListener(
            "click",
            (event) => {
              if (event.detail === 0) {
                scope.__ellisKeyboardActivations =
                  (scope.__ellisKeyboardActivations || 0) + 1;
              }
            },
            { capture: true, once: true },
          );
          new MutationObserver(() => {
            if (element.getAttribute("data-pressed") === "true") {
              scope.__ellisKeyboardActivations =
                (scope.__ellisKeyboardActivations || 0) + 1;
            }
          }).observe(element, {
            attributes: true,
            attributeFilter: ["data-pressed"],
          });
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
        ).toBeGreaterThanOrEqual(1);
      }
      await page.keyboard.press("Escape");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowUp");
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await waitForStoryReady(page);
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
    await waitForStoryReady(page);
    expect(runtimeErrors, `${story.id} forced-colors console and page errors`).toEqual(
      [],
    );
    runtimeErrors.length = 0;
    expect(
      await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
    ).toBe(true);
    await settleAnimations(page);
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
