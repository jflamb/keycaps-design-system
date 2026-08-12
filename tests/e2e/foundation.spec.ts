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

test("forced colors leave the destructive key distinguishable from the neutral one", async ({
  page,
}) => {
  // The claim under test is narrow and easy to get wrong by looking: in the
  // default theme a danger key is obviously red. Under forced colors its border,
  // wall, and ink all resolve to system colors — the same ones a secondary key
  // resolves to — so every difference the design relies on is gone except shape.
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto(
    "/iframe.html?id=components-button--variants&viewMode=story&globals=theme:light",
  );
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);

  const danger = page.getByRole("button", { name: "Reject request" });
  const neutral = page.getByRole("button", { name: "Review details" });

  const paint = (locator: typeof danger) =>
    locator.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        color: computed.color,
        borderBlockEndColor: computed.borderBlockEndColor,
      };
    });

  // Not an incidental observation — this is the defect the shape exists to cover.
  // If a future palette change makes these differ, the assertion should be
  // revisited rather than deleted: the shape is still the carrier that survives
  // monochrome print and color vision deficiency.
  expect(await paint(danger)).toEqual(await paint(neutral));

  const markBox = async (locator: typeof danger) =>
    locator.locator(".kc-button__tone-icon").boundingBox();

  const dangerMark = await markBox(danger);
  expect(dangerMark).not.toBeNull();
  expect(dangerMark?.width).toBeGreaterThan(8);
  expect(dangerMark?.height).toBeGreaterThan(8);
  await expect(neutral.locator(".kc-button__tone-icon")).toHaveCount(0);
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

/**
 * The two halves of ADR 0002's structural guarantee.
 *
 * `styles.css` is data-attribute-only, so hand-authored `.kc-` markup renders
 * correctly at rest and does nothing on hover or press. `static.css` — imported
 * only by a prerender path — restores those states with real pseudo-classes.
 *
 * Both stories carry byte-identical markup. If someone ever moves a `:hover`
 * rule into `styles.css`, the first test fails here rather than a consumer
 * discovering that hand-authoring suddenly looks supported.
 */
const staticStory = (story: string) =>
  `/iframe.html?id=foundations-static-render--${story}&viewMode=story&globals=theme:light`;

async function keyState(page: import("@playwright/test").Page) {
  // Settled states only. The press transitions over 120ms and the point here is
  // the resting geometry on each side of the interaction, not the animation.
  await page.addStyleTag({
    content: ".kc-button, .kc-field__input { transition: none !important; }",
  });

  const key = page.getByRole("button", { name: "Get started" });
  const read = () =>
    key.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        background: computed.backgroundColor,
        transform: computed.transform,
        edge: computed.borderBlockEndWidth,
      };
    });

  const rest = await read();
  await key.hover();
  const hovered = await read();

  const box = (await key.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressed = await read();
  await page.mouse.up();

  return { rest, hovered, pressed };
}

test("hand-authored markup is inert under styles.css alone", async ({ page }) => {
  await page.goto(staticStory("hand-authored-markup-is-inert"));

  const { rest, hovered, pressed } = await keyState(page);

  // Rendered correctly at rest — this is not a broken page, it is an inert one.
  expect(rest.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(Number.parseFloat(rest.edge)).toBe(4);

  // And nothing moves.
  expect(hovered.background).toBe(rest.background);
  expect(pressed.transform).toBe(rest.transform);
  expect(pressed.edge).toBe(rest.edge);
});

test("static.css restores the states on the same markup", async ({ page }) => {
  await page.goto(staticStory("static-css-restores-the-states"));

  const { rest, hovered, pressed } = await keyState(page);

  expect(hovered.background).not.toBe(rest.background);

  // The press physics, on a path with no React attached: the cap descends
  // exactly as far as its wall shrinks. `matrix(a, b, c, d, tx, ty)` — the last
  // component is the vertical translation. Parsed rather than read through
  // DOMMatrix, which the browser has and the test runner does not.
  const travel = Number.parseFloat(pressed.transform.split(",").at(-1)!);
  const restEdge = Number.parseFloat(rest.edge);
  const pressedEdge = Number.parseFloat(pressed.edge);
  expect(travel).toBe(3);
  expect(pressedEdge).toBe(1);
  expect(travel + pressedEdge).toBe(restEdge);
});

test("a statically rendered key keeps a visible focus indicator", async ({ page }) => {
  // The ring comes from the token layer's zero-specificity `:where(:focus-visible)`
  // rule, so it is present in *both* delivery modes — including the inert one.
  // A page that cannot show focus is not a degraded page, it is an inaccessible
  // one, and that is why this rule does not live with the other state selectors.
  for (const story of [
    "hand-authored-markup-is-inert",
    "static-css-restores-the-states",
  ]) {
    await page.goto(staticStory(story));
    await page.getByRole("button", { name: "Get started" }).focus();
    const outline = await page
      .getByRole("button", { name: "Get started" })
      .evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          style: computed.outlineStyle,
          width: Number.parseFloat(computed.outlineWidth),
          offset: Number.parseFloat(computed.outlineOffset),
        };
      });
    expect(outline.style, story).not.toBe("none");
    expect(outline.width, story).toBeGreaterThanOrEqual(3);
    expect(outline.offset, story).toBeGreaterThanOrEqual(3);
  }
});

test("the app shell puts a working skip link before everything else", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-app-shell--default&viewMode=story&globals=theme:light",
  );

  const skip = page.getByRole("link", { name: "Skip to main content" });

  // Hidden at rest by clipping, not by `display: none` — a display-none element
  // is not focusable, which would defeat the whole point.
  expect((await skip.boundingBox())!.height).toBeLessThanOrEqual(1);

  await skip.focus();
  const focused = (await skip.boundingBox())!;
  expect(focused.height).toBeGreaterThanOrEqual(44);
  await expect(skip).toBeFocused();

  await skip.press("Enter");
  await expect(page.getByRole("main")).toBeVisible();
});

test("the application rail is compact on desktop and keeps drawer targets at 44px", async ({
  page,
}) => {
  const retirementShell =
    "/iframe.html?id=components-app-shell--retirement-dashboard-sidebar-draft&viewMode=story&globals=theme:light";

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(retirementShell);
  const sidebar = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(sidebar).toBeVisible();
  expect((await sidebar.getByRole("link", { name: "Overview" }).boundingBox())!.height).toBeCloseTo(
    36,
    3,
  );
  await expect(page.getByRole("button", { name: "Sections" })).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(sidebar).toBeHidden();
  const trigger = page.getByRole("button", { name: "Sections" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole("dialog", { name: "Sections" });
  await expect(drawer).toBeVisible();
  expect((await drawer.getByRole("link", { name: "Overview" }).boundingBox())!.height).toBeCloseTo(
    44,
    3,
  );
});

test("the new surfaces reflow at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });

  for (const id of [
    "components-app-shell--default",
    "components-app-shell--with-sidebar",
    "components-page-header--complete",
    "components-description-list--rows",
    "components-empty-state--with-action",
    "components-code-block--syntax-tokens",
    "components-search-field--default",
    // A six-column table at 320px is the case the scroll container exists for:
    // the table has to overflow *and* the page still must not.
    "components-data-table--wide-and-scrolling",
    "components-data-table--totals-and-rich-cells",
    // The two-slot summary is the case here. Both repos that invented it put
    // the description in a column beside the label, and both squeeze the label
    // to nothing at this width; this one wraps it onto its own line instead.
    "components-disclosure--with-descriptions",
    "components-disclosure--rich-body",
    // A `<dialog>` is capped by the UA at `calc(100% - 6px - 2em)` in each axis
    // unless the component restates its own maximum, which silently clamped the
    // panel to 282px here and made the browser rather than the component the
    // thing enforcing the Intrinsic Maximum Rule.
    "components-dialog--default",
    "components-dialog--with-a-chooser",
    // The drawer is the harder case: at this width it is the whole viewport, so
    // one pixel of the wrong measure is a horizontal page scroll.
    "components-dialog--drawer",
    "components-dialog--long-body",
  ]) {
    await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:light`);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth, id).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test("icon-gallery captions resolve the supported extra-small type token", async ({ page }) => {
  for (const story of ["the-whole-set", "mcp-unifi-landing-page"] as const) {
    await page.goto(
      `/iframe.html?id=components-icon--${story}&viewMode=story&globals=theme:light`,
    );
    const type = await page.locator("ul code").evaluateAll((captions) => {
      const rootStyles = getComputedStyle(document.documentElement);
      const token = rootStyles.getPropertyValue("--kc-font-size-xs").trim();
      const tokenPixels = token.endsWith("rem")
        ? Number.parseFloat(token) * Number.parseFloat(rootStyles.fontSize)
        : Number.parseFloat(token);
      return {
        captionPixels: captions.map((caption) =>
          Number.parseFloat(getComputedStyle(caption).fontSize),
        ),
        tokenPixels,
      };
    });

    expect(type.captionPixels.length, story).toBeGreaterThan(0);
    expect(
      type.captionPixels.every((size) => Math.abs(size - type.tokenPixels) <= 0.01),
      story,
    ).toBe(true);
  }
});

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 1280] as const) {
    test(`the app shell keeps baselines, centers, and actions intact in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const story of ["default", "with-logo-mark", "marketing-page"] as const) {
        await page.goto(
          `/iframe.html?id=components-app-shell--${story}&viewMode=story&globals=theme:${theme}`,
        );

        const geometry = await page.locator(".kc-app-shell__header").evaluate((header) => {
          const actions = header.querySelector<HTMLElement>(".kc-app-shell__actions")!;
          const button = actions.querySelector<HTMLElement>("button, a")!;
          const brand = header.querySelector<HTMLElement>(".kc-app-shell__brand")!;
          const headerRect = header.getBoundingClientRect();
          const actionsRect = actions.getBoundingClientRect();
          const brandRect = brand.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          const logoRect = brand.querySelector("svg")?.getBoundingClientRect();
          const root = document.documentElement;
          return {
            actionsCenter: (actionsRect.top + actionsRect.bottom) / 2,
            actionsInside:
              actionsRect.top >= headerRect.top - 0.5 &&
              actionsRect.bottom <= headerRect.bottom + 0.5,
            brandCenter: (brandRect.top + brandRect.bottom) / 2,
            buttonHeight: buttonRect.height,
            headerHeight: headerRect.height,
            logoSize: logoRect ? [logoRect.width, logoRect.height] : null,
            pageFits: root.scrollWidth <= root.clientWidth,
          };
        });

        expect(geometry.actionsInside, story).toBe(true);
        expect(geometry.buttonHeight, story).toBeGreaterThanOrEqual(36);
        expect(geometry.pageFits, story).toBe(true);
        expect(await page.locator("[data-baseline-probe]").count(), story).toBe(0);

        if (story === "with-logo-mark") {
          expect(geometry.logoSize, story).toEqual([24, 24]);
        }

        if (story === "marketing-page") {
          expect(
            Math.abs(geometry.brandCenter - geometry.actionsCenter),
            story,
          ).toBeLessThanOrEqual(0.5);
        } else if (width === 1280) {
          expect(geometry.headerHeight, story).toBeLessThanOrEqual(61);
        }
      }

      if (width === 1280) {
        await page.goto(
          `/iframe.html?id=components-app-shell--baseline-regression-fixture&viewMode=story&globals=theme:${theme}`,
        );
        await expect(page.locator("[data-baseline-fixture]")).toHaveCount(2);
        const fixtures = await page.locator("[data-baseline-fixture]").evaluateAll((shells) =>
          shells.map((shell) => {
            const header = shell.querySelector<HTMLElement>(".kc-app-shell__header")!;
            const brandProbe = header.querySelector<HTMLElement>(
              '[data-baseline-probe="brand"]',
            )!;
            const navProbe = header.querySelector<HTMLElement>(
              '[data-baseline-probe="nav"]',
            )!;
            const logo = header.querySelector<SVGSVGElement>(".kc-app-shell__brand > svg");
            const logoRect = logo?.getBoundingClientRect();
            const logoStyle = logo ? getComputedStyle(logo) : null;
            return {
              baselineDelta: Math.abs(
                brandProbe.getBoundingClientRect().top - navProbe.getBoundingClientRect().top,
              ),
              headerHeight: header.getBoundingClientRect().height,
              logoPadding: logoStyle ? Number.parseFloat(logoStyle.paddingInlineStart) : null,
              logoSize: logoRect ? [logoRect.width, logoRect.height] : null,
              name: shell.getAttribute("data-baseline-fixture"),
            };
          }),
        );

        expect(fixtures.map(({ name }) => name)).toEqual(["text", "logo"]);
        expect(fixtures.map(({ logoSize }) => logoSize)).toEqual([null, [32, 32]]);
        expect(fixtures.map(({ logoPadding }) => logoPadding)).toEqual([null, 4]);
        await expect(page.locator('[data-baseline-probe="brand"]')).toHaveCount(2);
        await expect(page.locator('[data-baseline-probe="nav"]')).toHaveCount(2);
        for (const fixture of fixtures) {
          expect(fixture.baselineDelta, fixture.name ?? "fixture").toBeLessThanOrEqual(0.5);
          expect(fixture.headerHeight, fixture.name ?? "fixture").toBeLessThanOrEqual(61);
        }
      }
    });

    test(`PageHeader keeps its two distinct text gaps in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const story of ["complete", "marketing-hero"] as const) {
        await page.goto(
          `/iframe.html?id=components-page-header--${story}&viewMode=story&globals=theme:${theme}`,
        );
        const rhythm = await page.locator(".kc-page-header").evaluate((header) => {
          const eyebrow = header.querySelector<HTMLElement>(".kc-page-header__eyebrow")!;
          const title = header.querySelector<HTMLElement>(".kc-page-header__title")!;
          const description = header.querySelector<HTMLElement>(
            ".kc-page-header__description",
          )!;
          const root = document.documentElement;
          const styles = getComputedStyle(root);
          const tokenPixels = (name: string) => {
            const value = styles.getPropertyValue(name).trim();
            return value.endsWith("rem")
              ? Number.parseFloat(value) * Number.parseFloat(styles.fontSize)
              : Number.parseFloat(value);
          };
          return {
            descriptionGap:
              description.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
            descriptionGapToken: tokenPixels("--kc-space-4"),
            eyebrowGap: title.getBoundingClientRect().top - eyebrow.getBoundingClientRect().bottom,
            eyebrowGapToken: tokenPixels("--kc-space-2"),
            pageFits: root.scrollWidth <= root.clientWidth,
          };
        });

        expect(rhythm.eyebrowGap, story).toBeCloseTo(rhythm.eyebrowGapToken, 0);
        expect(rhythm.descriptionGap, story).toBeCloseTo(rhythm.descriptionGapToken, 0);
        expect(rhythm.pageFits, story).toBe(true);
      }
    });
  }
}

// One test per theme rather than a loop inside one test, and the reason is not
// style. AxeBuilder injects axe into every frame and recurses through them; when
// a second `goto` reuses the same page, a frame can still carry the previous
// run's flag and the next `analyze()` fails with "Axe is already running". It is
// timing-dependent, so it passes locally and fails on a slower CI runner — the
// worst shape of flake. A separate `test()` gets a fresh page from the fixture,
// which removes the shared state instead of waiting longer for it to settle.
for (const theme of ["light", "dark"] as const) {
  test(`the Tier 1 surfaces are axe-clean in ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-app-shell--default&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.getByRole("main")).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations, theme).toEqual([]);
  });

  test(`the data table is axe-clean in ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-data-table--totals-and-rich-cells&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.getByRole("table")).toBeVisible();
    // Scoped to the component rather than the page, and no rule is switched off.
    // A component story is a sample rather than a document — it has no `h1` and
    // no landmark around it — so an unscoped run reports the *story's* page
    // shape, which is neither the component's fault nor something the component
    // could fix. The showcase and app shell stories are shaped as real documents
    // and keep their whole-page runs above. The unit suite additionally runs axe
    // over this table inside a `main`, so the composed case is covered too.
    const accessibility = await new AxeBuilder({ page })
      .include(".kc-table-scroll")
      .analyze();
    expect(accessibility.violations, theme).toEqual([]);
  });

  test(`the disclosure is axe-clean in ${theme}, open and closed`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-disclosure--with-descriptions&viewMode=story&globals=theme:${theme}`,
    );
    const summary = page.getByText("Household goals");
    await expect(summary).toBeVisible();

    // Scoped to the component: a component story is a sample rather than a
    // document, so an unscoped run reports the story's page shape. Closed first,
    // then open — the open panel is markup the closed run never sees.
    const run = async () =>
      (await new AxeBuilder({ page }).include(".kc-disclosure").analyze()).violations;
    expect(await run(), `${theme} closed`).toEqual([]);
    await summary.click();
    await expect(page.locator(".kc-disclosure").first()).toHaveAttribute("open", "");
    expect(await run(), `${theme} open`).toEqual([]);
  });

  test(`the dialog is axe-clean in ${theme}, with a footer and a nested chooser`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=components-dialog--with-a-chooser&viewMode=story&globals=theme:${theme}`,
    );
    const dialog = page.getByRole("dialog", { name: "Connect a spreadsheet" });
    await expect(dialog).toBeVisible();

    // The entrance fades from `opacity: 0` over 140ms, and axe samples whatever
    // is painted when it runs. Sampled mid-fade, every colour in the dialog is
    // its real value washed toward the page behind it — the muted description
    // reported 3.23:1 against a background neither element declares. Settling
    // first is the difference between measuring the component and measuring the
    // animation.
    await dialog.evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    );

    // Scoped to the component, like the table and the disclosure above: a
    // component story is a sample rather than a document.
    const accessibility = await new AxeBuilder({ page }).include(".kc-dialog").analyze();
    expect(accessibility.violations, theme).toEqual([]);
  });

  test(`the dialog casts a shadow and a scrim in ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-dialog--default&viewMode=story&globals=theme:${theme}`,
    );
    const dialog = page.locator("dialog.kc-dialog");
    await expect(dialog).toBeVisible();

    const painted = await dialog.evaluate((element) => ({
      shadow: getComputedStyle(element).boxShadow,
      scrim: getComputedStyle(element, "::backdrop").backgroundColor,
    }));

    // The Overlay Exception Rule: a dialog is genuinely detached, so it casts in
    // *both* themes. This is `assistant-workbench`'s live defect — its panel
    // takes `--shadow-plate`, which is `none` in dark, so its dialogs have no
    // depth there at all. A `none` here in either theme is that bug arriving.
    expect(painted.shadow, `${theme} shadow`).not.toBe("none");
    // And the scrim is a real paint rather than a token that failed to resolve.
    // Custom properties reach `::backdrop` only because it inherits from its
    // originating element, which is worth pinning rather than assuming.
    expect(painted.scrim, `${theme} scrim`).toMatch(/^rgba?\(/);
    expect(painted.scrim, `${theme} scrim`).not.toBe("rgba(0, 0, 0, 0)");
  });
}

/**
 * The half of the dialog only a browser can check, and the reason the unit suite
 * does not try.
 *
 * jsdom ships `HTMLDialogElement` with none of its methods, so the unit tests run
 * against a shim that fakes the element's bookkeeping. The top layer, the focus
 * trap, inertness, and the `::backdrop` cannot be shimmed honestly — they are the
 * entire argument for building on the platform primitive, so they are asserted
 * here against a real Chromium or nowhere.
 */
test("a Select inside a Dialog opens, is clickable, and paints above the scrim", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-dialog--with-a-chooser&viewMode=story&globals=theme:light",
  );

  const dialog = page.getByRole("dialog", { name: "Connect a spreadsheet" });
  await expect(dialog).toBeVisible();

  const trigger = page.locator(".kc-select__trigger");
  await trigger.click();

  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();

  /*
   * The failure this exists to catch, stated three ways because it fails three
   * ways. `showModal()` puts the dialog in the top layer and makes everything
   * outside it inert; React Aria portals to `document.body` by default. A
   * listbox that landed there would be inert (so the click below would do
   * nothing), painted under the scrim (so the hit test would find the dialog),
   * and outside the dialog element entirely.
   */
  expect(
    await listbox.evaluate((element) => element.closest("dialog.kc-dialog") !== null),
    "the listbox is portalled outside the dialog",
  ).toBe(true);

  const option = page.getByRole("option", { name: /Retirement plan/ });
  expect(
    await option.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return element.contains(top) || element === top;
    }),
    "something paints over the option",
  ).toBe(true);

  // And it actually works end to end: the choice lands and the dialog stays open.
  await option.click();
  await expect(listbox).toHaveCount(0);
  await expect(page.locator(".kc-select__value")).toContainText("Retirement plan");
  await expect(dialog).toBeVisible();
});

test("the dialog traps focus and hands it back to the trigger on Escape", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-dialog--default&viewMode=story&globals=theme:light",
  );

  const dialog = page.getByRole("dialog", { name: "Delete this plan" });
  // Storybook mounts asynchronously, so awaiting the element before touching the
  // keyboard is what stops a `press` landing on nothing.
  await expect(dialog).toBeVisible();

  const trigger = page.getByRole("button", { name: "Delete plan", exact: true }).first();

  /*
   * Inertness, checked directly rather than inferred from tabbing. Everything
   * outside a modal `<dialog>` is inert, so the trigger behind the scrim cannot
   * take focus even when something asks it to explicitly. This is the guarantee
   * `assistant-workbench`'s hand-rolled `<div role="dialog">` does not have at
   * all, and the single sharpest reason this component is built on the platform
   * primitive.
   */
  expect(
    await trigger.evaluate((element) => {
      (element as HTMLElement).focus();
      return document.activeElement === element;
    }),
    "a control behind the scrim took focus",
  ).toBe(false);

  /*
   * And tabbing never lands on page content either. Chromium moves focus to its
   * own chrome past the last control in a modal, which surfaces here as `body` —
   * so `body` is allowed and any *element* outside the dialog is not. Asserting
   * "always inside the dialog" would be asserting a browser behaviour that is
   * not the guarantee; asserting "never on the page behind" is the guarantee.
   */
  for (let press = 0; press < 5; press += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return true;
        return active.closest("dialog.kc-dialog") !== null;
      }),
      `focus reached the page behind the scrim after ${press + 1} Tab presses`,
    ).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  /*
   * Focus return is asserted on a dialog that was *opened from the trigger*,
   * which is a separate pass on purpose. A `<dialog>` restores focus to whatever
   * held it when `showModal()` ran, and this story opens at mount — so nothing
   * held it, and there is nothing to return to. Asserting focus return on the
   * first open would have been asserting a thing that cannot happen rather than
   * a thing the component does.
   */
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("a dialog that is not dismissable refuses Escape and keeps its close control", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=components-dialog--not-dismissable&viewMode=story&globals=theme:light",
  );

  const dialog = page.getByRole("dialog", { name: "Save before leaving?" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();

  // A modal with no way out is a trap, so the close control stays and works —
  // what `isDismissable={false}` removes is the accidental exit, not every exit.
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toHaveCount(0);
});

test("the page behind an open dialog does not scroll", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-dialog--default&viewMode=story&globals=theme:light",
  );
  // A tall page behind the dialog, so there is something to scroll.
  await page.addStyleTag({ content: "body { min-block-size: 300vh; }" });

  const dialog = page.getByRole("dialog", { name: "Delete this plan" });
  await expect(dialog).toBeVisible();

  const wheel = async () => {
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, 500);
    // Wheel scrolling is asynchronous; reading the offset in the same tick
    // reports the position before the scroll rather than after it.
    await page.waitForFunction(() => document.scrollingElement!.scrollTop !== -1);
    await page.waitForTimeout(200);
    return page.evaluate(() => document.scrollingElement!.scrollTop);
  };

  // The control, first. "It did not scroll" proves nothing unless this page can
  // scroll at all, and a storybook canvas is exactly the kind of surface where
  // it might not — so close the dialog and establish that it does.
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    await page.evaluate(() => {
      const scroller = document.scrollingElement!;
      return scroller.scrollHeight > scroller.clientHeight;
    }),
    "the page behind the dialog is not scrollable, so this test proves nothing",
  ).toBe(true);
  expect(await wheel(), "the unlocked page did not scroll").toBeGreaterThan(0);

  // The lock is released rather than leaked, restoring exactly what it found.
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
    "the scroll lock outlived the dialog",
  ).toBe("");

  // Now reopen, and the same gesture goes nowhere. A native `<dialog>` does not
  // do this on its own — the page keeps scrolling under the pointer, which is
  // the modal defect users report and nobody writes down.
  await page.evaluate(() => document.scrollingElement!.scrollTo(0, 0));
  await page.getByRole("button", { name: "Delete plan", exact: true }).first().click();
  await expect(dialog).toBeVisible();
  expect(await wheel(), "the page scrolled under the modal").toBe(0);
});

test("the dialog head holds still while its body scrolls", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-dialog--long-body&viewMode=story&globals=theme:light",
  );

  const dialog = page.locator("dialog.kc-dialog");
  await expect(dialog).toBeVisible();

  const measured = await dialog.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    const head = element.querySelector(".kc-dialog__head")!;
    const body = element.querySelector(".kc-dialog__body")!;
    const before = head.getBoundingClientRect().top;
    body.scrollTop = body.scrollHeight;
    return {
      scrolls: body.scrollHeight > body.clientHeight,
      scrolled: body.scrollTop,
      headMoved: head.getBoundingClientRect().top !== before,
      closeVisible:
        element.querySelector(".kc-dialog__close")!.getBoundingClientRect().top >=
        element.getBoundingClientRect().top,
    };
  });

  expect(measured.scrolls, "the long-body story does not actually scroll").toBe(true);
  expect(measured.scrolled).toBeGreaterThan(0);
  // AW scrolls the whole panel including its header, so its close control leaves
  // the viewport in a long dialog. This is the assertion that says Keycaps does
  // not — carried by the flex column rather than by a sticky offset.
  expect(measured.headMoved, "the head scrolled with the body").toBe(false);
  expect(measured.closeVisible).toBe(true);
});

test("the drawer is the same dialog pinned to the inline-end edge", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-dialog--drawer&viewMode=story&globals=theme:light",
  );

  const dialog = page.locator("dialog.kc-dialog");
  await expect(dialog).toBeVisible();

  const geometry = await dialog.evaluate(async (element) => {
    // The entrance translates 4px, so a rect read mid-animation is off by four.
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      rect: { top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      startStart: style.borderStartStartRadius,
      startEnd: style.borderStartEndRadius,
      tag: element.tagName,
    };
  });

  // RD's `.assumptions-drawer` in Keycaps' terms: 560px is 35rem, pinned to the
  // inline-end edge, full height. Geometry, not a sibling component.
  expect(geometry.tag).toBe("DIALOG");
  expect(geometry.rect.width).toBe(560);
  expect(geometry.rect.top).toBe(0);
  expect(geometry.rect.bottom).toBe(geometry.viewport.height);
  expect(geometry.rect.right).toBe(geometry.viewport.width);
  // Rounded on the edge that faces the page, square against the viewport edge.
  expect(geometry.startStart).toBe("18px");
  expect(geometry.startEnd).toBe("0px");
});

/**
 * The half of the disclosure only a browser can check.
 *
 * The press is the claim `DESIGN.md` makes about this element by name: a summary
 * takes input, so under the Pressable Edge Rule it owes travel and a wall. A
 * Button pins its border box with `min-block-size`; a summary wraps to as many
 * lines as its label needs and has no fixed height to pin, so the padding does
 * that job — the edge gives up exactly what the padding takes. If that coupling
 * ever breaks, the box resizes mid-press and everything below the disclosure
 * jumps while the key is down, which is the failure this measures.
 */
test("the summary travels on press without moving anything below it", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=components-disclosure--long-body&viewMode=story&globals=theme:light",
  );
  // Settled states only. The press transitions over 120ms and the point is the
  // geometry on each side of it, not the animation.
  await page.addStyleTag({ content: ".kc-disclosure > summary { transition: none !important; }" });

  const summary = page.locator(".kc-disclosure > summary");
  const paragraph = page.getByText("This paragraph is the test.");
  const geometry = async () => ({
    summary: await summary.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const computed = getComputedStyle(element);
      return {
        top: +rect.top.toFixed(2),
        height: +rect.height.toFixed(2),
        edge: computed.borderBlockEndWidth,
        transform: computed.transform,
      };
    }),
    below: +(await paragraph.boundingBox())!.y.toFixed(2),
  });

  const rest = await geometry();
  expect(Number.parseFloat(rest.summary.edge)).toBe(4);

  const box = (await summary.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressed = await geometry();
  await page.mouse.up();

  // The cap descends exactly as far as its wall shrinks.
  const travel = Number.parseFloat(pressed.summary.transform.split(",").at(-1)!);
  const pressedEdge = Number.parseFloat(pressed.summary.edge);
  expect(travel).toBe(3);
  expect(pressedEdge).toBe(1);
  expect(travel + pressedEdge).toBe(Number.parseFloat(rest.summary.edge));

  // The whole key descends, wall included — `getBoundingClientRect` reports the
  // transformed box, so this is the travel rather than a layout move.
  expect(pressed.summary.top - rest.summary.top).toBe(3);

  // And the border box never resizes, so nothing below it moves. The paragraph
  // is the honest witness here: it sits outside the disclosure, so it can only
  // move if the summary's *layout* height changed.
  expect(pressed.summary.height).toBe(rest.summary.height);
  expect(pressed.below).toBe(rest.below);
});

test("the disclosure opens from the keyboard and rings when it takes focus", async ({
  page,
}) => {
  // The story with no play function: the others open themselves on load, which
  // would leave this test asserting against a state a play step produced.
  await page.goto(
    "/iframe.html?id=components-disclosure--long-body&viewMode=story&globals=theme:light",
  );

  const details = page.locator(".kc-disclosure");
  const summary = page.locator(".kc-disclosure > summary");

  // Wait for the story to render before reaching for the tab order: Storybook
  // mounts asynchronously, and a Tab pressed into an empty document focuses
  // nothing and stays that way.
  await expect(summary).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(summary).toBeFocused();

  // The ring comes from `base.css`'s zero-specificity `:where(:focus-visible)`,
  // so it is present in every delivery mode. Same reasoning as the skip link.
  const outline = await summary.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { style: computed.outlineStyle, width: Number.parseFloat(computed.outlineWidth) };
  });
  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThanOrEqual(3);

  await expect(details).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open", "");
});

/**
 * The chevron is the one place the article and the component genuinely differ,
 * and forced colors is where that difference has consequences.
 *
 * The component draws an `<svg>` filling with `currentColor`, which the OS
 * recolors rather than erases. Prose has no element to reach, so it masks the
 * shape onto a pseudo-element — and a masked glyph is painted with
 * `background-color`, which forced colors flattens into the surface unless the
 * override in `base.css` opts it out. That override is one declaration, easy to
 * delete, and its absence is invisible in every other mode.
 */
test("forced colors keep the disclosure's edge and both chevrons", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });

  await page.goto(
    "/iframe.html?id=components-disclosure--long-body&viewMode=story&globals=theme:light",
  );
  const summary = page.locator(".kc-disclosure > summary");
  await expect(summary).toBeVisible();
  expect(
    await summary.evaluate((element) => getComputedStyle(element).borderBlockEndStyle),
  ).not.toBe("none");

  const caret = page.locator(".kc-disclosure__caret");
  expect((await caret.boundingBox())?.width).toBeGreaterThan(8);
  expect(await caret.evaluate((element) => getComputedStyle(element).fill)).not.toBe("none");

  await page.goto(
    "/iframe.html?id=prose-details--with-descriptions&viewMode=story&globals=theme:light",
  );
  const article = page.locator(".kc-prose summary").first();
  await expect(article).toBeVisible();
  expect(
    await article.evaluate((element) => getComputedStyle(element).borderBlockEndStyle),
  ).not.toBe("none");

  const paint = await article.evaluate((element) => ({
    adjust: getComputedStyle(element, "::after").forcedColorAdjust,
    glyph: getComputedStyle(element, "::after").backgroundColor,
    surface: getComputedStyle(element).backgroundColor,
  }));
  expect(paint.adjust).toBe("none");
  expect(paint.glyph).not.toBe(paint.surface);
});

/**
 * The delivery claim, measured rather than asserted in a comment.
 *
 * The static-render stories carry hand-authored markup: a set of keys that are
 * inert under `styles.css` alone, and one disclosure that is not. Its press
 * belongs to the browser rather than to React, so it works in both stories and
 * needs an entry in neither stylesheet — the standing the skip link and the
 * focus ring already have. This is the test that keeps that a fact.
 */
test("the disclosure presses under styles.css alone, unlike everything beside it", async ({
  page,
}) => {
  await page.goto(staticStory("hand-authored-markup-is-inert"));
  await page.addStyleTag({
    content: ".kc-button, .kc-disclosure > summary { transition: none !important; }",
  });

  const details = page.locator(".kc-disclosure");
  const summary = page.locator(".kc-disclosure > summary");
  const read = () =>
    summary.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { background: computed.backgroundColor, transform: computed.transform };
    });

  const rest = await read();
  await summary.hover();
  expect((await read()).background).not.toBe(rest.background);

  const box = (await summary.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  expect(Number.parseFloat((await read()).transform.split(",").at(-1)!)).toBe(3);
  await page.mouse.up();

  // And it toggles, with nothing attached to it.
  await expect(details).toHaveAttribute("open", "");

  // The key beside it, on the same page, still does nothing. Both halves of the
  // guarantee in one measurement.
  const key = page.getByRole("button", { name: "Get started" });
  const keyRest = await key.evaluate((element) => getComputedStyle(element).backgroundColor);
  await key.hover();
  expect(
    await key.evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe(keyRest);
});

/**
 * The half of the data table that only a browser can check.
 *
 * A region that scrolls and cannot be reached from the keyboard is a 2.1.1
 * failure, and one without a name is a 4.1.2 failure — so the two have to hold
 * together, not one or the other. `retirement-dashboard` reached the same place
 * from the other direction and its own e2e suite asserts the same thing, which
 * is why the component owns it rather than leaving it to each consumer.
 */
test("the table's scroll region is a named keyboard stop that actually scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    "/iframe.html?id=components-data-table--wide-and-scrolling&viewMode=story&globals=theme:light",
  );

  const region = page.getByRole("region", {
    name: "All positions, sorted by current value",
  });
  await expect(region).toBeVisible();

  // The container has to be genuinely overflowing, or the rest of this test is
  // asserting that an unnecessary tab stop takes focus.
  const overflow = await region.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);

  await region.focus();
  await expect(region).toBeFocused();

  // The ring comes from `base.css`'s zero-specificity `:where(:focus-visible)`,
  // so it is present in every delivery mode rather than only where `styles.css`
  // is loaded — the same reasoning that keeps the skip link there.
  const outline = await region.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      style: computed.outlineStyle,
      width: Number.parseFloat(computed.outlineWidth),
    };
  });
  expect(outline.style).not.toBe("none");
  expect(outline.width).toBeGreaterThanOrEqual(3);

  // And the keyboard can move it, which is the entire point of the tab stop.
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => region.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);

  // The page itself never scrolls sideways, at any width. The 320 Rule.
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
