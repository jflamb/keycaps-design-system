import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { useState } from "react";
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
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableFoot,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  Dialog,
  Disclosure,
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
  ThemeToggle,
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

  it("draws the disclosure chevron from the same path prose.css masks", () => {
    // The disclosure is the one component whose glyph exists twice by
    // construction — prose masks it onto a pseudo-element because a CMS gives it
    // no element to reach, and the component renders it. Same vendoring run,
    // and this is what says so.
    const prose = readFileSync(resolve(process.cwd(), "../tokens/src/prose.css"), "utf8");
    const declaration = /--kc-prose-icon-caret: url\("([^"]+)"\)/.exec(prose);
    expect(declaration, "prose.css declares no caret mask").not.toBeNull();
    const masked = decodeURIComponent(declaration![1]!).replace(/'/g, '"');

    const { container } = render(<Icon name="caret-down" />);
    const paths = [...container.querySelector("svg")!.innerHTML.matchAll(/ d="([^"]+)"/g)];
    expect(paths.length).toBeGreaterThan(0);
    for (const [, d] of paths) expect(masked).toContain(d!);
  });
});

describe("ThemeToggle", () => {
  const setup = () => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
    return userEvent.setup();
  };

  it("starts from the system preference and hands the attribute back to it", async () => {
    const user = setup();
    render(<ThemeToggle />);
    const key = screen.getByRole("button");

    // No attribute is the system state, and the control must be able to return
    // to it — the token layer resolves an unset data-theme through the media
    // query, so a two-state toggle would strand the reader on an override.
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    await user.click(key);
    expect(document.documentElement.dataset.theme).toBe("light");
    await user.click(key);
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(key);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("names both where the reader is and what the next press does", async () => {
    const user = setup();
    render(<ThemeToggle />);

    // A cycling control cannot be predicted from its glyph, so the name carries
    // both halves rather than leaving the reader to press and find out.
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "Theme: following the system. Switch to light.",
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
      "Theme: light. Switch to dark.",
    );
  });

  it("draws a different glyph for each of the three states", async () => {
    const user = setup();
    const { container } = render(<ThemeToggle />);
    const drawn = () => container.querySelector("svg")!.innerHTML;

    const shapes = new Set([drawn()]);
    await user.click(screen.getByRole("button"));
    shapes.add(drawn());
    await user.click(screen.getByRole("button"));
    shapes.add(drawn());
    expect(shapes.size).toBe(3);
  });

  it("persists to localStorage under the key the bootstrap reads", async () => {
    const user = setup();
    render(<ThemeToggle storageKey="retirement-dashboard-theme" />);

    await user.click(screen.getByRole("button"));
    expect(window.localStorage.getItem("retirement-dashboard-theme")).toBe("light");
    // Returning to system clears the value rather than storing "system": the
    // bootstrap only recognizes light and dark, and anything else it reads is
    // an override it would apply forever.
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));
    expect(window.localStorage.getItem("retirement-dashboard-theme")).toBeNull();
  });

  it("writes a domain cookie instead when one is asked for, and never by default", async () => {
    const user = setup();
    const { unmount } = render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    // A default that wrote a domain cookie would leak one surface's preference
    // onto every sibling that never agreed to share it.
    expect(document.cookie).not.toContain("jflamb-theme");
    unmount();

    window.localStorage.clear();
    render(<ThemeToggle cookieDomain=".jflamb.com" />);
    await user.click(screen.getByRole("button"));
    expect(window.localStorage.getItem("jflamb-theme")).toBeNull();
  });

  it("adopts a stored preference on mount", async () => {
    setup();
    window.localStorage.setItem("jflamb-theme", "dark");
    render(<ThemeToggle />);

    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveAttribute("data-theme-preference", "dark"),
    );
  });

  it("is refused by the static-render path, since it is the interaction", () => {
    // Unlike a Banner whose dismiss is dead but whose message still reads, a
    // theme key on a page with no runtime has nothing left of it at all.
    expect(() => renderStatic(<ThemeToggle />)).toThrow(StaticRenderError);
  });
});

function BalanceTable() {
  return (
    <DataTable caption="Balance by account group">
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Group</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Balance</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableRowHeader>Taxable brokerage</DataTableRowHeader>
          <DataTableCell numeric>$412,880</DataTableCell>
        </DataTableRow>
      </DataTableBody>
      <DataTableFoot>
        <DataTableRow>
          <DataTableRowHeader>Total</DataTableRowHeader>
          <DataTableCell numeric>$412,880</DataTableCell>
        </DataTableRow>
      </DataTableFoot>
    </DataTable>
  );
}

describe("DataTable", () => {
  it("names its scroll region from the caption, and makes it reachable", () => {
    const { container } = render(<BalanceTable />);

    // The two halves a stylesheet cannot supply. A region that scrolls and
    // cannot be focused is a 2.1.1 failure; one without a name is a 4.1.2 one,
    // so making it focusable without naming it only trades one for the other.
    const region = screen.getByRole("region", { name: "Balance by account group" });
    expect(region).toHaveAttribute("tabindex", "0");

    // The caption *is* the name rather than a second copy of it, which is what
    // `retirement-dashboard` passes to its wrapper today.
    const caption = container.querySelector("caption")!;
    expect(region.getAttribute("aria-labelledby")).toBe(caption.id);
  });

  it("names the table itself when there is no caption to do it", () => {
    render(
      <DataTable aria-label="Survivor income">
        <DataTableBody>
          <DataTableRow>
            <DataTableCell>$96,400/yr</DataTableCell>
          </DataTableRow>
        </DataTableBody>
      </DataTable>,
    );

    // Both, deliberately: the region for a reader who tabs in, the table for one
    // who jumps straight to it with a table shortcut.
    expect(screen.getByRole("region", { name: "Survivor income" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Survivor income" })).toBeInTheDocument();
  });

  it("supplies scope on both header cells rather than trusting the caller", () => {
    render(<BalanceTable />);

    // Forgetting `scope` is the most common table accessibility defect there is,
    // and the survey found it already happening in two consumer tables. It is
    // not a prop here, so it cannot be forgotten.
    expect(screen.getByRole("columnheader", { name: "Group" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: "Taxable brokerage" })).toHaveAttribute(
      "scope",
      "row",
    );
  });

  it("marks numeric cells on both the header and the body", () => {
    const { container } = render(<BalanceTable />);

    // Per-cell, because CSS has no per-column hook: `text-align` does not
    // inherit through a `<col>` and `:nth-child()` breaks on a spanning cell.
    expect(container.querySelectorAll("[data-numeric]")).toHaveLength(3);
    expect(container.querySelector("thead th[data-numeric]")).not.toBeNull();
  });

  it("puts a totals row in tfoot, where it is a summary rather than more data", () => {
    const { container } = render(<BalanceTable />);
    expect(container.querySelector("tfoot th[scope='row']")?.textContent).toBe("Total");
  });

  it("renders statically, which is the whole reason it has no hover", () => {
    // Mode 1 eligibility is the trade the missing row hover buys. If this ever
    // starts throwing, something interactive was added and the component owes
    // `static.css` an entry — or owes the exclusion list a line.
    const markup = renderStatic(<BalanceTable />);
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('scope="col"');
    expect(markup).toContain("<tfoot>");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <main>
        <BalanceTable />
      </main>,
    );
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});

describe("the data table and the article table are one treatment", () => {
  const flatten = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");

  const declarations = (css: string, selector: string): Record<string, string> => {
    const start = css.indexOf(`${selector} {`);
    expect(start, `no rule for \`${selector}\``).toBeGreaterThan(-1);
    const open = css.indexOf("{", start) + 1;
    return Object.fromEntries(
      css
        .slice(open, css.indexOf("}", open))
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const colon = entry.indexOf(":");
          return [entry.slice(0, colon).trim(), entry.slice(colon + 1).trim()] as const;
        }),
    );
  };

  // The claim this file makes about itself, checked rather than reviewed. A
  // table of numbers in a dashboard and a table of numbers in an article are the
  // same object, and `retirement-dashboard`'s eight table classes — four of them
  // copies, one of which lost a `text-align` on the way — are what happens when
  // that is left to whoever edits one of the two files next.
  it("declares the same values in styles.css and prose.css", () => {
    const styles = flatten(readSource("./styles.css"));
    const prose = flatten(readFileSync(resolve(process.cwd(), "../tokens/src/prose.css"), "utf8"));

    for (const [component, article] of [
      [".kc-table caption", ".kc-prose caption"],
      [".kc-table thead th", ".kc-prose thead th"],
      [".kc-table tbody td, .kc-table tbody th", ".kc-prose tbody td, .kc-prose tbody th"],
      [".kc-table tbody th", ".kc-prose tbody th"],
      [".kc-table tbody tr:last-child > *", ".kc-prose tbody tr:last-child > *"],
      [".kc-table tfoot th, .kc-table tfoot td", ".kc-prose tfoot th, .kc-prose tfoot td"],
      [
        ".kc-table[data-zebra] tbody tr:nth-child(even)",
        ".kc-prose table[data-zebra] tbody tr:nth-child(even)",
      ],
      [".kc-table [data-numeric]", ".kc-prose .kc-prose__numeric"],
    ] as const) {
      expect(declarations(styles, component), component).toEqual(
        declarations(prose, article),
      );
    }

    // The root rule is the one honest exception: a product surface has to state
    // the ink and the face that `.kc-prose` already sets on its container.
    const table = declarations(styles, ".kc-table");
    const proseTable = declarations(prose, ".kc-prose table");
    for (const property of Object.keys(proseTable)) {
      expect(table[property], property).toBe(proseTable[property]);
    }
  });

  it("keeps the row hover out of prose, since styles.css cannot have one", () => {
    // Removing it is what makes the two treatments identical rather than nearly
    // so. A row that lights up under the pointer and does nothing when clicked
    // is a false affordance anyway, and no consumer had one on a real table.
    const prose = flatten(readFileSync(resolve(process.cwd(), "../tokens/src/prose.css"), "utf8"));
    expect(prose).not.toContain("tbody tr:hover");
  });
});

describe("Disclosure", () => {
  it("is a native details, with no button and no aria-expanded to keep in step", () => {
    const { container } = render(
      <Disclosure summary="Technical details">
        <p>Correlation id req_5308874.</p>
      </Disclosure>,
    );

    // The whole Mode 1 claim, in structural form. React Aria's Disclosure would
    // render a `<button aria-expanded>` whose state lives in a client runtime;
    // this renders the platform element, whose state lives in the browser.
    const details = container.querySelector("details.kc-disclosure");
    expect(details).not.toBeNull();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[aria-expanded]")).toBeNull();
    expect(details).not.toHaveAttribute("open");
  });

  it("opens and closes from the pointer with nothing listening", async () => {
    const user = userEvent.setup();
    const { container } = render(<Disclosure summary="Technical details">Body</Disclosure>);
    const details = container.querySelector("details")!;

    await user.click(screen.getByText("Technical details"));
    expect(details.open).toBe(true);
    await user.click(screen.getByText("Technical details"));
    expect(details.open).toBe(false);
  });

  it("carries both summary slots, and the description is a small", () => {
    const { container } = render(
      <Disclosure summary="Household goals" description="Success, spending, survivor">
        <p>Four controls.</p>
      </Disclosure>,
    );

    const summary = container.querySelector("summary")!;
    // `<span>` plus `<small>` is the shape `knowledge` and `retirement-dashboard`
    // arrived at independently, and it is markup rather than a class so an
    // article writing it by hand takes the same rule.
    expect(summary.querySelector("span")).toHaveTextContent("Household goals");
    expect(summary.querySelector("small")).toHaveTextContent(
      "Success, spending, survivor",
    );
  });

  it("renders no description element when there is no description", () => {
    const { container } = render(<Disclosure summary="Technical details">Body</Disclosure>);
    expect(container.querySelector("small")).toBeNull();
  });

  it("draws the chevron as a decorative glyph rather than a rotated border box", () => {
    const { container } = render(<Disclosure summary="Technical details">Body</Disclosure>);

    const caret = container.querySelector(".kc-disclosure__caret")!;
    expect(caret.tagName).toBe("svg");
    // Decoration: the summary's own label already says what pressing it does,
    // and a second announcement would be noise.
    expect(caret).toHaveAttribute("aria-hidden", "true");
    expect(caret.querySelector("path")).not.toBeNull();
  });

  it("takes an initial open state and a group name, both native", () => {
    const { container } = render(
      <>
        <Disclosure defaultOpen name="assumption-section" summary="Household goals">
          Body
        </Disclosure>
        <Disclosure name="assumption-section" summary="Stress tests">
          Body
        </Disclosure>
      </>,
    );

    const [first, second] = [...container.querySelectorAll("details")];
    expect(first).toHaveAttribute("open");
    expect(second).not.toHaveAttribute("open");
    // The exclusive accordion is the browser's, not this package's: `name` is a
    // pass-through, so grouping four sections costs no runtime and survives a
    // statically rendered page.
    expect(first).toHaveAttribute("name", "assumption-section");
    expect(second).toHaveAttribute("name", "assumption-section");
  });

  it("wraps its body so the inline padding lands on something", () => {
    // `<Disclosure>Some sentence.</Disclosure>` is a text node, which no
    // stylesheet can reach. An article emits element siblings and needs no
    // wrapper; a component takes whatever it is handed.
    const { container } = render(<Disclosure summary="Technical details">Loose text</Disclosure>);
    const body = container.querySelector("details > *:not(summary)")!;
    expect(body).toHaveTextContent("Loose text");
  });

  it("renders statically, which is the whole reason it is a native details", () => {
    // The disclosure is the only remaining Tier 2 entry the two Mode 1 repos
    // could ever use. If this ever starts throwing, or the markup stops carrying
    // its own glyph, the component has acquired a runtime and the reason it was
    // built first is gone.
    const markup = renderStatic(
      <Disclosure defaultOpen name="group" summary="Technical details" description="Payload">
        <p>Correlation id req_5308874.</p>
      </Disclosure>,
    );
    expect(markup).toContain("<details ");
    expect(markup).toContain('class="kc-disclosure"');
    expect(markup).toContain('name="group"');
    expect(markup).toContain("<summary>");
    expect(markup).toContain("<small>Payload</small>");
    expect(markup).toContain('class="kc-disclosure__caret"');
    expect(markup).not.toContain("aria-expanded");
  });

  it("has no axe violations, open or closed", async () => {
    for (const defaultOpen of [false, true]) {
      const { container, unmount } = render(
        <main>
          <Disclosure
            defaultOpen={defaultOpen}
            description="Request payload and routing"
            summary="Technical details"
          >
            <p>Correlation id req_5308874.</p>
          </Disclosure>
        </main>,
      );
      const result = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(result.violations, String(defaultOpen)).toEqual([]);
      unmount();
    }
  });
});

/**
 * The disclosure's treatment is not two blocks kept in agreement — it is one
 * block, and this is what holds it to that.
 *
 * `DataTable` shipped as parallel rules in `styles.css` and `prose.css` with a
 * test comparing them declaration by declaration. A disclosure cannot take that
 * route: its press is real and `styles.css` may not contain a `:hover` or an
 * `:active`. So the treatment lives in `base.css`, which every delivery mode
 * loads, and every selector in it names both surfaces at once. There is nothing
 * to compare because there is nothing to drift.
 */
describe("the disclosure and the article disclosure are one rule", () => {
  const readToken = (name: string) =>
    readFileSync(resolve(process.cwd(), `../tokens/src/${name}`), "utf8");

  const disclosureBlock = () => {
    const css = readToken("base.css");
    const start = css.indexOf("/* ---- Disclosure");
    const end = css.indexOf("@media (prefers-reduced-motion");
    expect(start, "base.css has no disclosure section").toBeGreaterThan(-1);
    expect(end, "base.css has no reduced-motion block after it").toBeGreaterThan(start);
    return css.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, "");
  };

  const rules = (css: string) => {
    const found: Array<{ selectors: string[]; body: string }> = [];
    for (const [, head, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = head!.trim().replace(/\s+/g, " ");
      // `@media` and `@supports` heads open a block of their own; the rules
      // inside them are matched separately on the next pass of the same regex.
      if (!selector || selector.startsWith("@")) continue;
      found.push({
        selectors: selector.split(",").map((part) => part.trim()),
        body: body!,
      });
    }
    return found;
  };

  /**
   * The two rules that legitimately reach one surface and not the other, and
   * both are about *painting the glyph* rather than about the treatment. Prose
   * has no element for the chevron, so it masks the shape onto a pseudo-element;
   * the component renders an `<svg>` that paints itself. The box both sit in is
   * a shared rule like everything else.
   */
  const glyphPaintOnly = new Set([
    "content",
    "background-color",
    "mask-image",
    "mask-size",
    "mask-repeat",
    "mask-position",
    "forced-color-adjust",
  ]);

  it("names both surfaces in every rule of the treatment", () => {
    const parsed = rules(disclosureBlock());
    expect(parsed.length).toBeGreaterThan(8);

    for (const { selectors, body } of parsed) {
      const article = selectors.filter((one) => one.startsWith(".kc-prose"));
      const component = selectors.filter((one) => one.includes(".kc-disclosure"));
      expect(article.length, selectors.join(", ")).toBeGreaterThan(0);

      if (component.length > 0) {
        // One rule, both surfaces: the ordinary case, and the point of the file.
        expect(article.length, selectors.join(", ")).toBe(component.length);
        continue;
      }

      // The exception is allowed to paint a glyph and nothing else. This is what
      // stops it growing back into a second treatment one declaration at a time.
      const properties = body
        .split(";")
        .map((entry) => entry.slice(0, entry.indexOf(":")).trim())
        .filter(Boolean);
      expect(properties.length, selectors.join(", ")).toBeGreaterThan(0);
      for (const property of properties) {
        expect(glyphPaintOnly, `${selectors.join(", ")} declares ${property}`).toContain(
          property,
        );
      }
    }
  });

  it("leaves prose.css with no disclosure rule of its own to drift", () => {
    const prose = readToken("prose.css").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const { selectors } of rules(prose)) {
      for (const selector of selectors) {
        expect(selector, "prose.css has taken a summary rule back").not.toContain("summary");
      }
      // One `details` selector survives here, and it is not part of the
      // treatment: prose's block-flow margin, which a `details` shares with
      // every other block in an article. A component sets no outer margin, so
      // this is the one line that is genuinely prose's alone.
      if (selectors.some((one) => one.includes("details"))) {
        expect(selectors, "an unexpected details rule in prose.css").toContain(".kc-prose p");
      }
    }
  });

  it("keeps the component out of styles.css and static.css entirely", () => {
    // Not "has no pseudo-class here" — has *nothing* here. The treatment is in
    // the token layer because it works in every delivery mode, so there is no
    // rest state to declare in one file and no state to restore in the other.
    // `SkipLink` is the only other component that can say this.
    //
    // Comments are stripped first: both files *say* the component is absent, and
    // saying so is the point. What must not appear is a rule.
    const rulesOnly = (name: string) => readSource(name).replace(/\/\*[\s\S]*?\*\//g, "");
    expect(rulesOnly("./styles.css")).not.toContain("kc-disclosure");
    expect(rulesOnly("./static.css")).not.toContain("kc-disclosure");
  });

  it("keeps the press in the token layer, where every delivery mode loads it", () => {
    // The other half of the guarantee above. If someone "tidies" this into
    // `styles.css`, the data-attribute test fires; if someone deletes it from
    // here, this one does.
    const block = disclosureBlock();
    expect(block).toContain(".kc-disclosure > summary:active");
    expect(block).toContain(".kc-disclosure > summary:hover");
    expect(block).toContain("--kc-press-travel");
    expect(block).toContain("--kc-press-edge-width");
  });
});

/**
 * What jsdom can and cannot be asked about this component.
 *
 * jsdom 28 ships `HTMLDialogElement` with its `open` property and none of its
 * methods, so `test/setup.ts` shims `show`, `showModal`, and `close`. The shim
 * fakes the element's *bookkeeping* and nothing else: there is no top layer, no
 * focus trap, no inertness, and no `::backdrop` behind it. So none of those is
 * asserted here — they are the browser suite's, against a real Chromium.
 *
 * That split is deliberate rather than a shortfall. The whole argument for this
 * component is that the platform provides those four things; a unit test that
 * appeared to confirm them against a shim would be asserting the shim.
 */
describe("Dialog", () => {
  const options = [
    { id: "household", label: "Household budget" },
    { id: "retirement", label: "Retirement plan" },
  ];

  function ControlledDialog({ description }: { description?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setIsOpen(true)}>Open it</Button>
        <Dialog
          description={description}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title="Connect a spreadsheet"
        >
          <p>Body copy.</p>
        </Dialog>
      </>
    );
  }

  it("opens as a modal and takes its accessible name from its title", async () => {
    const user = userEvent.setup();
    render(<ControlledDialog description="Pick the spreadsheet to read from." />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open it" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Connect a spreadsheet");
    expect(dialog).toHaveAccessibleDescription("Pick the spreadsheet to read from.");
    // The heading is a real heading as well as the name, so the dialog has an
    // outline of its own once a reader is inside it.
    expect(
      screen.getByRole("heading", { level: 2, name: "Connect a spreadsheet" }),
    ).toBeVisible();
  });

  it("renders a named close control by construction and reports the close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog isOpen onOpenChange={onOpenChange} title="Assumptions">
        <p>Body copy.</p>
      </Dialog>,
    );

    // Not a prop a caller supplies. Escape is the other way out and it is
    // invisible, so a dialog whose close control can be forgotten looks
    // inescapable — the same reasoning that makes the app shell render its own
    // skip link.
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("refuses Escape when it is not dismissable, and accepts it when it is", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog isDismissable={false} isOpen onOpenChange={onOpenChange} title="Save first">
        <p>Body copy.</p>
      </Dialog>,
    );

    // Escape reaches a `<dialog>` as a cancelable `cancel` event before `close`,
    // so refusing it is a `preventDefault` on that event and nothing else.
    const dialog = screen.getByRole("dialog");
    const refused = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(refused);
    expect(refused.defaultPrevented).toBe(true);

    rerender(
      <Dialog isOpen onOpenChange={onOpenChange} title="Save first">
        <p>Body copy.</p>
      </Dialog>,
    );
    const allowed = new Event("cancel", { cancelable: true });
    screen.getByRole("dialog").dispatchEvent(allowed);
    expect(allowed.defaultPrevented).toBe(false);
  });

  it("carries the placement as an attribute, so the drawer is this component", () => {
    render(
      <Dialog isOpen onOpenChange={() => {}} placement="inline-end" title="Assumptions">
        <p>Body copy.</p>
      </Dialog>,
    );
    // The drawer is geometry rather than a sibling component. If a `Drawer`
    // export ever appears, this is the test that should have stopped it.
    expect(screen.getByRole("dialog")).toHaveAttribute("data-placement", "inline-end");
  });

  it("locks the page while it is open and restores exactly what it found", () => {
    const root = document.documentElement;
    root.style.overflow = "auto";

    const { rerender } = render(
      <Dialog isOpen onOpenChange={() => {}} title="Assumptions">
        <p>Body copy.</p>
      </Dialog>,
    );
    // A native `<dialog>` does not do this on its own — the page keeps
    // scrolling under the pointer, which is the modal defect users report.
    expect(root.style.overflow).toBe("hidden");

    rerender(
      <Dialog isOpen={false} onOpenChange={() => {}} title="Assumptions">
        <p>Body copy.</p>
      </Dialog>,
    );
    expect(root.style.overflow).toBe("auto");
    root.style.overflow = "";
  });

  it("puts a nested Select inside the dialog rather than on document.body", async () => {
    const user = userEvent.setup();
    render(
      <Dialog isOpen onOpenChange={() => {}} title="Connect a spreadsheet">
        <Select label="Spreadsheet" options={options} />
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: /Spreadsheet/ }));
    const listbox = await screen.findByRole("listbox");

    /*
     * The whole architecture in one assertion. `showModal()` puts the dialog in
     * the top layer and makes everything outside it inert; React Aria portals to
     * `document.body` by default, so a listbox landing there is both inert and
     * painted under the scrim — it cannot be opened at all.
     *
     * jsdom has no top layer, so what this can prove is the *containment*, which
     * is the part the system controls. That it is consequently clickable and
     * above the scrim is asserted in the browser suite, where those things exist.
     */
    const dialog = screen.getByRole("dialog", { name: "Connect a spreadsheet" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog.contains(listbox)).toBe(true);
  });

  it("leaves a Popover outside a dialog exactly where React Aria puts it", async () => {
    const user = userEvent.setup();
    render(
      <PopoverTrigger>
        <Button variant="secondary">Account help</Button>
        <Popover aria-label="Account help">Use your jflamb.com account.</Popover>
      </PopoverTrigger>,
    );

    // The context defaults to `undefined` outside a Dialog, which is what leaves
    // React Aria's own default in place rather than replacing it with ours.
    await user.click(screen.getByRole("button", { name: "Account help" }));
    const popover = await screen.findByRole("dialog", { name: "Account help" });
    expect(document.body.contains(popover)).toBe(true);
  });

  it("is refused by renderStatic, because a modal that cannot open is not a degraded dialog", () => {
    expect(() =>
      renderStatic(
        <Dialog isOpen onOpenChange={() => {}} title="Assumptions">
          <p>Body copy.</p>
        </Dialog>,
      ),
    ).toThrow(StaticRenderError);
  });

  it("reads a scrim token that is declared in both themes and under forced colors", () => {
    // The design direction said "the token layer ships one scrim and neither
    // number is it." It shipped none — see correction 30. This is the test that
    // stops the dark theme or the forced-colors mapping being the one that gets
    // forgotten, which is exactly how AW ended up with dialogs that have no
    // depth in dark mode.
    const tokens = readFileSync(resolve(process.cwd(), "../tokens/src/tokens.css"), "utf8");
    const declarations = [...tokens.matchAll(/--kc-color-scrim:\s*([^;]+);/g)].map(
      (match) => match[1]!.trim(),
    );
    expect(declarations).toHaveLength(4);

    // Light is tinted with the graphite ink, the same tint both shadows carry.
    expect(declarations[0]).toBe("rgb(58 63 71 / 0.68)");
    // Both dark blocks — the `prefers-color-scheme` one and the explicit
    // `data-theme` one — or a reader with an explicit choice gets the light
    // scrim on a dark ground.
    expect(declarations[1]).toBe("rgb(0 0 0 / 0.68)");
    expect(declarations[2]).toBe("rgb(0 0 0 / 0.68)");
    // `--kc-shadow-overlay` is `none` under forced colors, which leaves the
    // scrim as the only thing between the dialog and the page.
    expect(declarations[3]).toBe("Canvas");

    // And the component spends it, rather than declaring a literal of its own —
    // which is what both consumer repos did.
    expect(readSource("./styles.css")).toContain("background: var(--kc-color-scrim);");
  });

  it("has no axe violations, open, with a footer and a nested chooser", async () => {
    const { container } = render(
      <Dialog
        description="Pick the spreadsheet this dashboard reads from."
        isOpen
        onOpenChange={() => {}}
        title="Connect a spreadsheet"
        footer={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Connect</Button>
          </>
        }
      >
        <Select label="Spreadsheet" options={options} />
      </Dialog>,
    );

    const result = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    expect(result.violations).toEqual([]);
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

  it("keeps Select, Popover, and Dialog out of static.css, since none degrades to CSS", () => {
    const css = stripComments(readSource("./static.css"));
    expect(css).not.toContain("kc-select");
    expect(css).not.toContain("kc-popover");
    // A `<dialog>` opens only when something calls `showModal()`. There is no
    // state here for a prerender path to restore, because there is no page with
    // no JavaScript on which this component does anything at all.
    expect(css).not.toContain("kc-dialog");
  });

  it("styles the dialog through the attribute and the pseudo-element, not a pseudo-class", () => {
    // The narrow reading of the rule above, made explicit because it is the one
    // a future edit is most likely to get wrong. `[open]` is an attribute the
    // browser writes and `::backdrop` is a pseudo-element, so a native
    // `<dialog>` can be styled in this file without touching the guarantee —
    // and the scoping to `[open]` is load-bearing, since an author `display`
    // beats the UA's `display: none` at any specificity.
    const css = stripComments(readSource("./styles.css"));
    expect(css).toContain(".kc-dialog[open]");
    expect(css).toContain(".kc-dialog::backdrop");
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
