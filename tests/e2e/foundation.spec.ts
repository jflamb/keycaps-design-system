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
  // The showcase is shaped as a page, not a sample: one main landmark, one h1,
  // card titles at h2. Opened in isolation it has to be a valid document.
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A calm foundation for consequential work",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Project settings" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
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
  const animationDuration = await page
    .getByRole("dialog", { name: "Why the destination matters" })
    .locator("..")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.001);
});

test("data-kc-motion suppresses the press without the system preference", async ({
  page,
}) => {
  await page.goto(storyPath);

  const save = page.getByRole("button", { name: "Save settings" });
  const pressTokens = () =>
    save.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        travel: computed.getPropertyValue("--kc-press-travel").trim(),
        edge: computed.getPropertyValue("--kc-press-edge-width").trim(),
        restEdge: computed.getPropertyValue("--kc-key-edge-width").trim(),
        duration: computed.transitionDuration,
      };
    });

  const motion = await pressTokens();
  expect(motion.travel).toBe("3px");
  expect(motion.edge).toBe("1px");

  await page.locator("html").evaluate((element) => {
    element.dataset.kcMotion = "reduce";
  });

  const reduced = await pressTokens();
  expect(reduced.travel).toBe("0px");
  expect(reduced.edge).toBe(reduced.restEdge);
  expect(
    Math.max(
      ...reduced.duration.split(",").map((value) => Number.parseFloat(value)),
    ),
  ).toBeLessThanOrEqual(0.001);

  // The coupling holds under both physics: travel + pressed edge = resting edge.
  for (const values of [motion, reduced]) {
    expect(
      Number.parseFloat(values.travel) + Number.parseFloat(values.edge),
    ).toBe(Number.parseFloat(values.restEdge));
  }
});

test("the press moves the key without relayout", async ({ page }) => {
  // The press is transform-only by design. Animating the box height instead
  // relayouts every frame, and inside a container that centers its items the
  // shrinking key re-centers mid-transition — a wobble, not a press. This test
  // exists to keep a layout-driving property out of the transition.
  await page.goto(
    "/iframe.html?id=components-button--primary&viewMode=story&globals=theme:light",
  );
  // Measure settled states, not mid-transition frames.
  await page.addStyleTag({ content: ".kc-button { transition: none !important; }" });

  const save = page.getByRole("button", { name: "Continue" });
  const box = async () =>
    save.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: +rect.top.toFixed(2), bottom: +rect.bottom.toFixed(2), height: +rect.height.toFixed(2) };
    });

  const rest = await box();
  expect(rest.height).toBe(44);

  // Dispatch the pointer sequence directly: React Aria captures the pointer, and
  // the capture is what Playwright's mouse API does not reproduce here. The
  // event plumbing is covered by the Button "Press and hold" play function; this
  // test is about the geometry the pressed state produces.
  const press = (type: "pointerdown" | "pointerup") =>
    save.evaluate((element, eventType) => {
      element.dispatchEvent(
        new PointerEvent(eventType, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          button: 0,
          buttons: eventType === "pointerdown" ? 1 : 0,
        }),
      );
    }, type);

  await press("pointerdown");
  await expect(save).toHaveAttribute("data-pressed", "true");
  const pressed = await box();
  await press("pointerup");
  await expect(save).not.toHaveAttribute("data-pressed", "true");

  // The box does not resize: the wall compresses inside a pinned border box.
  expect(pressed.height).toBe(rest.height);
  expect(pressed.top - rest.top).toBe(3);
  expect(pressed.bottom - rest.bottom).toBe(3);

  // And no layout-driving property is in the transition, which is what would
  // reintroduce the wobble.
  const transitioned = await save.evaluate((element) =>
    getComputedStyle(element)
      .transitionProperty.split(",")
      .map((property) => property.trim()),
  );
  for (const layoutProperty of [
    "width",
    "height",
    "min-block-size",
    "min-height",
    "padding",
    "margin",
  ]) {
    expect(transitioned).not.toContain(layoutProperty);
  }
});

test("the select menu matches its trigger width", async ({ page }) => {
  await page.goto(storyPath);

  const trigger = page.getByRole("button", { name: /Destination/ });
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();

  const widths = await page.evaluate(() => {
    const button = document.querySelector(".kc-select__trigger") as HTMLElement;
    const popover = document.querySelector(".kc-select__popover") as HTMLElement;
    return {
      trigger: Math.round(button.getBoundingClientRect().width),
      popover: Math.round(popover.getBoundingClientRect().width),
    };
  });
  expect(widths.popover).toBe(widths.trigger);
});

test("forced colors preserve borders and a visible keyboard focus indicator", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", forcedColors: "active" });
  await page.goto(storyPath.replace("theme:light", "theme:dark"));
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);

  const forcedColorTokens = async () =>
    page.evaluate(() => {
      const computed = getComputedStyle(document.documentElement);
      return {
        surface: computed.getPropertyValue("--kc-color-surface").trim(),
        text: computed.getPropertyValue("--kc-color-text").trim(),
      };
    });

  expect(await forcedColorTokens()).toEqual({
    surface: "Canvas",
    text: "CanvasText",
  });

  await page.locator("html").evaluate((element) => {
    element.removeAttribute("data-theme");
  });
  expect(await forcedColorTokens()).toEqual({
    surface: "Canvas",
    text: "CanvasText",
  });

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

test("a dismiss button inherits its banner tone", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-banner--dismissible&viewMode=story&globals=theme:light&args=tone:danger",
  );

  const banner = page.getByRole("alert");
  const dismiss = page.getByRole("button", { name: "Dismiss message" });
  await expect(banner).toBeVisible();
  await expect(dismiss).toBeVisible();

  const colors = await banner.evaluate((element) => ({
    banner: getComputedStyle(element).color,
    dismiss: getComputedStyle(
      element.querySelector(".kc-banner__dismiss") as HTMLElement,
    ).color,
  }));
  expect(colors.dismiss).toBe(colors.banner);
});

test("a missing directory index returns 404 without stopping the server", async ({
  page,
}) => {
  const missingIndex = await page.request.get("/assets/");
  expect(missingIndex.status()).toBe(404);

  const storybook = await page.request.get("/index.html");
  expect(storybook.ok()).toBe(true);
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
