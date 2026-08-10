import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Form } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";
import {
  AppShell,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavLink,
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardLink,
  CardTitle,
  CodeBlock,
  CodeToken,
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  EmptyState,
  Field,
  Icon,
  LinkButton,
  PageHeader,
  Popover,
  PopoverTrigger,
  SearchField,
  Select,
  SkipLink,
  StatusIcon,
  iconNames,
} from "./index.js";
import {
  renderStatic,
  renderStaticDocument,
  StaticRenderError,
} from "./static.js";

const readSource = (name: string) =>
  readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");

describe("Button", () => {
  it("has a native accessible name and activates from the keyboard", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Button onPress={onPress}>Save settings</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Save settings" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe("Field", () => {
  it("connects its label, description, and error message without a redundant invalid prop", () => {
    render(
      <Field
        description="Use a durable address."
        errorMessage="Enter a complete email address."
        inputProps={{ type: "email" }}
        label="Email address"
      />,
    );

    const field = screen.getByRole("textbox", { name: "Email address" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      /durable address.*complete email address/i,
    );
    expect(screen.getByText("Enter a complete email address.")).toBeVisible();
  });

  it("honors an explicit valid state over a supplied error message", () => {
    render(
      <Field
        errorMessage="Enter a complete email address."
        isInvalid={false}
        label="Email address"
      />,
    );

    const field = screen.getByRole("textbox", { name: "Email address" });
    expect(field).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Enter a complete email address.")).toBeNull();
  });

  it("still reports native constraint violations when no error message is supplied", async () => {
    const user = userEvent.setup();
    render(
      <Form>
        <Field isRequired label="Email address" name="email" />
        <Button type="submit">Save settings</Button>
      </Form>,
    );

    const field = screen.getByRole("textbox", { name: "Email address" });
    expect(field).not.toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(field).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Select", () => {
  it("opens from the keyboard and exposes named options", async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Destination"
        options={[
          { id: "projects", label: "Projects" },
          { id: "resources", label: "Resources" },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Destination/ });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeVisible();
    expect(screen.getByRole("option", { name: "Resources" })).toBeVisible();
  });
});

describe("Popover", () => {
  it("opens from its trigger, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <PopoverTrigger>
        <Button variant="secondary">Account help</Button>
        <Popover aria-label="Account help">Use your jflamb.com account.</Popover>
      </PopoverTrigger>,
    );

    const trigger = screen.getByRole("button", { name: "Account help" });
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Account help" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Account help" })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe("Banner, Badge, and Card", () => {
  it("uses status semantics, preserves text labels, and keeps a heading structure", async () => {
    const dismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Banner onDismiss={dismiss} title="Connection lost" tone="danger">
          Reconnect Gmail to restore coverage.
        </Banner>
        <Card>
          <CardHeader>
            <Badge tone="warning">Review needed</Badge>
            <CardTitle>Filing destination</CardTitle>
            <CardDescription>Choose where this record belongs.</CardDescription>
          </CardHeader>
          <CardBody>Resources / Design systems</CardBody>
        </Card>
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Reconnect Gmail");
    expect(screen.getByText("Review needed")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Filing destination", level: 2 })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});

describe("automated accessibility baseline", () => {
  it("has no axe violations in a representative component composition", async () => {
    const { container } = render(
      <main>
        <Banner title="Draft saved" tone="success">
          Your work has not been published.
        </Banner>
        <Card aria-labelledby="settings-title">
          <CardHeader>
            <CardTitle id="settings-title">Project settings</CardTitle>
          </CardHeader>
          <CardBody>
            <Field label="Project name" inputProps={{ placeholder: "Keycaps" }} />
            <Select
              label="Destination"
              options={[
                { id: "projects", label: "Projects" },
                { id: "archive", label: "Archive" },
              ]}
            />
            <Button>Save settings</Button>
          </CardBody>
        </Card>
      </main>,
    );

    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});

describe("Button variants", () => {
  it("marks the danger key with its own variant rather than reusing the coral face", () => {
    render(<Button variant="danger">Delete zone</Button>);
    expect(screen.getByRole("button", { name: "Delete zone" })).toHaveAttribute(
      "data-variant",
      "danger",
    );
  });

  it("carries an accessible name on an icon-only key", () => {
    render(
      <Button aria-label="Dismiss notification" iconOnly variant="secondary">
        <svg viewBox="0 0 20 20" aria-hidden="true" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Dismiss notification" });
    expect(button).toHaveAttribute("data-icon-only", "true");
  });

  it("renders a LinkButton as an anchor wearing the key", () => {
    render(
      <LinkButton href="/docs" variant="secondary">
        Read the docs
      </LinkButton>,
    );
    const link = screen.getByRole("link", { name: "Read the docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveClass("kc-button");
    expect(link).toHaveAttribute("href", "/docs");
  });
});

/**
 * The danger key's shape carrier.
 *
 * Outlining the destructive key stops it colliding with the coral one and puts
 * it beside `secondary` instead, where the only remaining differences are a pink
 * border and red ink — and both vanish into system colors under
 * `forced-colors: active`. Shape is what survives, so the component supplies it
 * rather than trusting a call site to remember. These tests exist because the
 * failure they guard against is invisible in the default theme: the key looks
 * fine, and it is only the high-contrast reader who loses the distinction.
 */
describe("the destructive key's second carrier", () => {
  const toneMark = (element: HTMLElement) =>
    element.querySelector(".kc-button__tone-icon");

  it("marks a danger button with the danger shape without being asked", () => {
    render(<Button variant="danger">Delete zone</Button>);
    const button = screen.getByRole("button", { name: "Delete zone" });
    expect(toneMark(button)).not.toBeNull();
    // The shape is decoration for the accessibility tree — the label already
    // names the destruction, and a second announcement would be noise.
    expect(toneMark(button)).toHaveAttribute("aria-hidden", "true");
  });

  it("marks a danger LinkButton the same way, so the two cannot drift", () => {
    render(
      <LinkButton href="/zones/1/delete" variant="danger">
        Delete zone
      </LinkButton>,
    );
    expect(toneMark(screen.getByRole("link", { name: "Delete zone" }))).not.toBeNull();
  });

  it("marks a danger key whose children are a render function", () => {
    render(<Button variant="danger">{() => "Delete zone"}</Button>);
    expect(
      toneMark(screen.getByRole("button", { name: "Delete zone" })),
    ).not.toBeNull();
  });

  it("leaves every other variant unmarked", () => {
    for (const variant of ["primary", "secondary", "quiet", "link"] as const) {
      const { unmount } = render(<Button variant={variant}>Save</Button>);
      expect(toneMark(screen.getByRole("button", { name: "Save" }))).toBeNull();
      unmount();
    }
  });

  it("exempts an icon-only danger key, whose glyph is already the shape", () => {
    render(
      <Button aria-label="Delete zone" iconOnly variant="danger">
        <svg data-testid="caller-glyph" viewBox="0 0 20 20" aria-hidden="true" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete zone" });
    expect(toneMark(button)).toBeNull();
    expect(button.querySelectorAll("svg")).toHaveLength(1);
  });

  it("paints the shape itself, so it survives markup the stylesheet never reaches", () => {
    render(<Button variant="danger">Delete zone</Button>);
    // A carrier that needs a second file to become visible is not a carrier:
    // Mode 1 pages render this markup with only the token layer in scope. The
    // glyph is a filled Phosphor shape now rather than an outline, so the paint
    // it carries is a fill — but the guarantee is the one this always asserted.
    expect(toneMark(screen.getByRole("button", { name: "Delete zone" }))).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });
});

describe("Badge", () => {
  it("gives each tone a distinct icon shape rather than a recolored one", () => {
    const { container } = render(
      <>
        <Badge icon tone="success">
          Complete
        </Badge>
        <Badge icon tone="warning">
          Attention
        </Badge>
        <Badge icon tone="danger">
          Blocked
        </Badge>
      </>,
    );

    // The Tone Trio Rule requires distinct shapes, not one shape in three
    // colors. Compare the drawn geometry, which is what a reader without color
    // actually sees.
    const shapes = [...container.querySelectorAll(".kc-badge__icon")].map((icon) =>
      [...icon.querySelectorAll("path, circle")]
        .map((node) => node.getAttribute("d") ?? node.getAttribute("r"))
        .join("|"),
    );
    expect(new Set(shapes).size).toBe(3);
  });

  it("renders no icon on the neutral tone, which has no shape of its own", () => {
    const { container } = render(<Badge icon>Draft</Badge>);
    expect(container.querySelector(".kc-badge__icon")).toBeNull();
  });

  it("keeps the words when a tone is set", () => {
    render(
      <Badge icon shape="pill" tone="success">
        Connected
      </Badge>,
    );
    expect(screen.getByText("Connected")).toBeVisible();
  });
});

describe("Card as a link", () => {
  it("takes the whole card as the link name when the card is the anchor", () => {
    render(
      <Card as="a" href="/approvals">
        <CardHeader>
          <CardTitle level={3}>Approvals</CardTitle>
        </CardHeader>
      </Card>,
    );
    const link = screen.getByRole("link", { name: /Approvals/ });
    expect(link).toHaveClass("kc-card");
    expect(link).toHaveAttribute("data-linked", "true");
  });

  it("keeps the title as the link name when the link is inside the card", () => {
    render(
      <Card isLinked>
        <CardHeader>
          <CardTitle level={3}>
            <CardLink href="/filing">Confirm the filing destination</CardLink>
          </CardTitle>
          <CardDescription>A longer sentence that must not become link text.</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(
      screen.getByRole("link", { name: "Confirm the filing destination" }),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: /must not become/ })).toBeNull();
  });
});

describe("Field and SearchField", () => {
  it("renders a textarea when the field is multiline and keeps its label bound", () => {
    render(<Field label="What changed?" multiline />);
    const field = screen.getByRole("textbox", { name: "What changed?" });
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("data-multiline", "true");
  });

  it("infers multiline from textareaProps, the way isInvalid is inferred from errorMessage", () => {
    render(<Field label="Notes" textareaProps={{ rows: 3 }} />);
    expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe("TEXTAREA");
  });

  it("hides the clear control until there is something to clear, and clears on Escape", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search knowledge" />);

    const input = screen.getByRole("searchbox", { name: "Search knowledge" });
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    await user.type(input, "provenance");
    expect(await screen.findByRole("button", { name: "Clear search" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("keeps a hidden label in the accessibility tree", () => {
    render(<SearchField isLabelHidden label="Search knowledge" />);
    expect(screen.getByRole("searchbox", { name: "Search knowledge" })).toBeVisible();
  });
});

describe("Tier 1 components", () => {
  it("renders a description list whose terms survive the div wrapper", () => {
    const { container } = render(
      <DescriptionList divided>
        <DescriptionListItem>
          <DescriptionTerm>Requested by</DescriptionTerm>
          <DescriptionDetails>Assistant Pulse</DescriptionDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionTerm>Expires</DescriptionTerm>
          <DescriptionDetails numeric>48h</DescriptionDetails>
        </DescriptionListItem>
      </DescriptionList>,
    );

    expect(container.querySelectorAll("dl > div > dt")).toHaveLength(2);
    expect(container.querySelectorAll("dl > div > dd")).toHaveLength(2);
    expect(container.querySelector("[data-numeric]")).toHaveTextContent("48h");
  });

  it("keeps the page header's eyebrow out of the document outline", () => {
    render(<PageHeader eyebrow="Operator" title="Approvals" description="Three waiting." />);
    expect(screen.getByRole("heading", { level: 1, name: "Approvals" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Operator" })).toBeNull();
  });

  it("renders an empty state at the heading level the outline needs", () => {
    render(<EmptyState level={4} title="No approvals waiting" description="Nothing to do." />);
    expect(
      screen.getByRole("heading", { level: 4, name: "No approvals waiting" }),
    ).toBeVisible();
  });

  it("points the skip link at the main region the shell renders", () => {
    render(
      <AppShell>
        <AppShellMain>Content</AppShellMain>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#kc-main",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "kc-main");
  });

  it("lets the skip link name its own target", () => {
    render(<SkipLink targetId="plan">Skip to the plan</SkipLink>);
    expect(screen.getByRole("link", { name: "Skip to the plan" })).toHaveAttribute(
      "href",
      "#plan",
    );
  });

  it("announces the current shell destination rather than only shading it", () => {
    render(
      <AppShellNav label="Sections">
        <AppShellNavLink href="/overview" isCurrent>
          Overview
        </AppShellNavLink>
        <AppShellNavLink href="/approvals">Approvals</AppShellNavLink>
      </AppShellNav>,
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Approvals" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("makes a code block reachable by keyboard, because it scrolls", () => {
    const { container } = render(
      <CodeBlock label="Terminal">npx @jflamb/mcp-dnsimple</CodeBlock>,
    );
    expect(container.querySelector(".kc-code__pre")).toHaveAttribute("tabindex", "0");
  });

  it("marks syntax runs by role rather than by color alone", () => {
    const { container } = render(
      <CodeBlock>
        <CodeToken kind="comment">{"// note"}</CodeToken>
        <CodeToken kind="string">{'"value"'}</CodeToken>
      </CodeBlock>,
    );
    expect(container.querySelector('[data-token="comment"]')).toHaveTextContent("// note");
    expect(container.querySelector('[data-token="string"]')).toHaveTextContent('"value"');
  });
});

describe("the static-render path", () => {
  it("renders a Keycaps tree to markup carrying its rest-state attributes", () => {
    const markup = renderStatic(<Button variant="secondary">Read the docs</Button>);
    expect(markup).toContain('class="kc-button"');
    expect(markup).toContain('data-variant="secondary"');
    // No runtime state attributes: nothing is running to put them there, which
    // is precisely why static.css exists.
    expect(markup).not.toContain("data-hovered");
    expect(markup).not.toContain("data-pressed");
  });

  it("refuses to render a Select, which cannot degrade to CSS", () => {
    expect(() =>
      renderStatic(<Select label="Destination" options={[{ id: "a", label: "A" }]} />),
    ).toThrow(StaticRenderError);
  });

  it("refuses to render popover markup", () => {
    expect(() => renderStatic(<div className="kc-popover">Detached</div>)).toThrow(
      StaticRenderError,
    );
  });

  it("documents its one blind spot rather than pretending to cover it", () => {
    // A PopoverTrigger renders only its trigger until the popover opens, so
    // nothing marked `kc-popover` reaches the markup and the guard cannot see
    // it. The result is a key that does nothing on a page with no React. This
    // test pins the limitation so it stays a known cost rather than becoming a
    // surprise: do not put a PopoverTrigger on a Mode 1 page.
    const markup = renderStatic(
      <PopoverTrigger>
        <Button>Why this matters</Button>
        <Popover aria-label="Why this matters">Text</Popover>
      </PopoverTrigger>,
    );
    expect(markup).toContain("kc-button");
    expect(markup).not.toContain("kc-popover");
  });

  it("escapes document metadata rather than interpolating it", () => {
    const html = renderStaticDocument({
      title: 'Zones & "records" <live>',
      description: "A & B",
      children: <Button>Go</Button>,
    });
    expect(html).toContain("<title>Zones &amp; &quot;records&quot; &lt;live&gt;</title>");
    expect(html).toContain('content="A &amp; B"');
  });

  it("emits a document with the theme bootstrap and both theme-color variants", () => {
    const html = renderStaticDocument({
      title: "mcp-dnsimple",
      stylesheets: ["/kc/tokens.css", "/kc/styles.css", "/kc/static.css"],
      children: <Button>Go</Button>,
    });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("jflamb-theme");
    expect(html).toContain('media="(prefers-color-scheme: dark)"');
    expect(html).toContain('<link rel="stylesheet" href="/kc/static.css">');
  });

  it("omits the bootstrap when a page opts out of the stored preference", () => {
    const html = renderStaticDocument({
      title: "mcp-unifi",
      themeStorageKey: false,
      children: <Button>Go</Button>,
    });
    expect(html).not.toContain("jflamb-theme");
    expect(html).not.toContain("<script>");
  });
});

/**
 * The structural guarantee from ADR 0002, asserted against the stylesheets
 * themselves rather than against rendered output.
 *
 * `styles.css` must stay data-attribute-only, so hand-authored `.kc-` markup is
 * visibly inert. `static.css` carries the real pseudo-classes and is imported
 * only by a prerender path. The browser suite proves the behavior; these two
 * tests are the cheap tripwire that fires the moment someone edits the wrong
 * file, without waiting for Playwright.
 */
describe("Icon", () => {
  const glyph = (container: HTMLElement) => container.querySelector("svg")!;

  it("hides an unnamed glyph from assistive technology", () => {
    // An icon beside its own label is decoration. Naming it repeats the label
    // to a screen reader, which is worse than leaving it unnamed.
    const { container } = render(<Icon name="magnifying-glass" />);
    expect(glyph(container)).toHaveAttribute("aria-hidden", "true");
    expect(glyph(container)).not.toHaveAttribute("role");
  });

  it("names a labelled glyph as an image", () => {
    const { container } = render(<Icon label="Search" name="magnifying-glass" />);
    expect(glyph(container)).toHaveAttribute("role", "img");
    expect(glyph(container)).toHaveAttribute("aria-label", "Search");
    expect(glyph(container)).not.toHaveAttribute("aria-hidden");
  });

  it("carries its own paint, so it renders without this package's stylesheet", () => {
    const { container } = render(<Icon name="x" />);
    expect(glyph(container)).toHaveAttribute("fill", "currentColor");
    expect(glyph(container)).toHaveAttribute("viewBox", "0 0 256 256");
  });

  it("draws every vendored glyph, and draws a different shape for each", () => {
    const shapes = new Set<string>();
    for (const name of iconNames) {
      const { container } = render(<Icon name={name} />);
      const drawn = glyph(container).innerHTML;
      expect(drawn, `${name} rendered nothing`).not.toBe("");
      shapes.add(drawn);
    }
    expect(shapes.size, "two glyph names resolve to the same drawing").toBe(iconNames.length);
  });

  it("gives each status tone its own shape rather than a recolor", () => {
    // The Tone Trio Rule's second carrier. Four tones, four distinct drawings —
    // asserted here rather than trusted, because a recolor would look correct.
    const drawings = (["info", "success", "warning", "danger"] as const).map((tone) => {
      const { container } = render(<StatusIcon tone={tone} />);
      return glyph(container).innerHTML;
    });
    expect(new Set(drawings).size).toBe(4);
  });
});

describe("the vendored icon set is the one prose masks", () => {
  it("draws each status shape from the same path prose.css masks", () => {
    // The two used to be drawn separately and kept in step by review. This is
    // the assertion that replaces the review: one vendoring run feeds both, so
    // a warning in an article and a warning on a Badge are one shape.
    // Resolved from the package root rather than from `import.meta.url`: this
    // reaches outside the Vite root, where that URL is no longer a file: one.
    const prose = readFileSync(resolve(process.cwd(), "../tokens/src/prose.css"), "utf8");
    for (const [tone, name] of [
      ["info", "info"],
      ["success", "check-circle"],
      ["warning", "warning"],
      ["danger", "warning-octagon"],
    ] as const) {
      const declaration = new RegExp(`--kc-prose-icon-${tone}: url\\("([^"]+)"\\)`).exec(prose);
      expect(declaration, `prose.css declares no ${tone} mask`).not.toBeNull();
      const masked = decodeURIComponent(declaration![1]!).replace(/'/g, '"');
      const { container } = render(<Icon name={name} />);
      // The mask is a standalone document and the component is a fragment, so
      // compare the geometry both carry rather than the markup around it.
      const paths = [...container.querySelector("svg")!.innerHTML.matchAll(/ d="([^"]+)"/g)];
      expect(paths.length).toBeGreaterThan(0);
      for (const [, d] of paths) expect(masked).toContain(d!);
    }
  });
});

describe("styles.css stays data-attribute-only", () => {
  const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

  it("declares no :hover, :active, or :focus-visible selector", () => {
    const css = stripComments(readSource("./styles.css"));
    for (const pseudo of [":hover", ":active", ":focus-visible", ":focus-within"]) {
      expect(css, `styles.css must not contain ${pseudo}`).not.toContain(pseudo);
    }
  });

  it("keeps Select and Popover out of static.css, since neither degrades to CSS", () => {
    const css = stripComments(readSource("./static.css"));
    expect(css).not.toContain("kc-select");
    expect(css).not.toContain("kc-popover");
  });

  it("mirrors each data-attribute state it claims to mirror", () => {
    const staticCss = stripComments(readSource("./static.css"));
    // Every state static.css restores must exist in the data-attribute layer, or
    // the two files have drifted and Mode 1 no longer matches Mode 2.
    expect(staticCss).toContain(":hover");
    expect(staticCss).toContain(":active");
    expect(staticCss).toContain(":focus-visible");
    expect(staticCss).toContain("--kc-press-travel");
    expect(staticCss).toContain("--kc-press-edge-width");
  });
});

describe("automated accessibility baseline for the new surfaces", () => {
  it("has no axe violations across the Tier 1 components and the new variants", async () => {
    const { container } = render(
      <AppShell>
        <AppShellHeader
          brand="Workbench"
          actions={<Button size="small" variant="secondary">Account</Button>}
        >
          <AppShellNav label="Sections">
            <AppShellNavLink href="/overview" isCurrent>
              Overview
            </AppShellNavLink>
            <AppShellNavLink href="/approvals">Approvals</AppShellNavLink>
          </AppShellNav>
        </AppShellHeader>
        <AppShellMain>
          <PageHeader
            eyebrow="Operator"
            title="Approvals"
            description="Requests the assistant cannot decide on its own."
            actions={
              <>
                <Button>Approve all safe</Button>
                <Button variant="danger">Reject all</Button>
              </>
            }
          >
            <Badge icon tone="warning">
              3 waiting
            </Badge>
          </PageHeader>

          <SearchField label="Filter requests" />

          <Card isLinked>
            <CardHeader>
              <CardTitle level={2}>
                <CardLink href="/requests/1">Zone record change</CardLink>
              </CardTitle>
              <CardDescription>Requested by Assistant Pulse.</CardDescription>
            </CardHeader>
            <CardBody>
              <DescriptionList divided>
                <DescriptionListItem>
                  <DescriptionTerm>Resource</DescriptionTerm>
                  <DescriptionDetails>jflamb.com</DescriptionDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionTerm>Expires</DescriptionTerm>
                  <DescriptionDetails numeric>48h</DescriptionDetails>
                </DescriptionListItem>
              </DescriptionList>
            </CardBody>
          </Card>

          <Field label="Why?" multiline />

          <CodeBlock copyable label="Request payload">
            {'{"type":"zone.record.update"}'}
          </CodeBlock>

          <EmptyState
            icon={<StatusIcon tone="success" />}
            level={2}
            title="Nothing else waiting"
            description="Everything past this point was decided automatically."
            actions={<Button variant="quiet">See the log</Button>}
          />

          <p>
            Assumptions changed since the last run —{" "}
            <Button variant="link">recalculate now</Button>.
          </p>
        </AppShellMain>
        <AppShellFooter>Build 5308874</AppShellFooter>
      </AppShell>,
    );

    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
