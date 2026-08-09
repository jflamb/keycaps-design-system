import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  AppShell,
  AppShellBody,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavLink,
  AppShellSidebar,
} from "./AppShell";
import { Badge } from "./Badge";
import { Button, LinkButton } from "./Button";
import { Card, CardBody, CardHeader, CardTitle } from "./Card";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
} from "./DescriptionList";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/App shell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    kcCanvas: "drop",
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "The frame every application page sits in: a bar, a body, a footer, and a skip link before all of them. All five consumer repos carry a bespoke one — `.topbar`/`.layout`, `.app-shell`, `.knowledge-shell`, `.site-header` — and no two are alike. That is five repos routing around a hole rather than ignoring the system.",
          "",
          "It is deliberately structural. Apart from `AppShellNavLink` it contributes no interactive element of its own, so it needs almost nothing in `static.css` and composes with whatever router an app already has.",
          "",
          "**The skip link is rendered by default and first in the DOM.** Two of the five consumers have none at all; making it the shell's responsibility is the only way that floor holds across five codebases.",
          "",
          "The sidebar split uses flex wrapping rather than a second media query — the system is single-breakpoint, and a sidebar that reflows on its own content's terms is what the Intrinsic Maximum Rule asks for anyway. Drag the frame narrow to watch it drop.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wordmark = () => (
  <>
    <span aria-hidden="true">◆</span> Workbench
  </>
);

/**
 * The operator-dashboard shape: a bar with navigation and account actions, a
 * page header, and content. This is what `assistant-workbench` builds by hand
 * across ten pages today.
 */
export const Default: Story = {
  render: () => (
    <AppShell>
      <AppShellHeader
        brand={<Wordmark />}
        actions={
          <>
            <Badge icon shape="pill" tone="success">
              Live
            </Badge>
            <Button size="small" variant="secondary">
              Account
            </Button>
          </>
        }
      >
        <AppShellNav label="Sections">
          <AppShellNavLink href="#overview" isCurrent>
            Overview
          </AppShellNavLink>
          <AppShellNavLink href="#approvals">Approvals</AppShellNavLink>
          <AppShellNavLink href="#activity">Activity</AppShellNavLink>
          <AppShellNavLink href="#bills">Bills</AppShellNavLink>
        </AppShellNav>
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain>
          <PageHeader
            eyebrow="Operator"
            title="Overview"
            description="What the assistant did, and what it needs from you."
            actions={<Button>Run a sweep</Button>}
          />
          <Card aria-labelledby="shell-card-title">
            <CardHeader>
              <CardTitle id="shell-card-title">Last run</CardTitle>
            </CardHeader>
            <CardBody>
              <DescriptionList>
                <DescriptionListItem>
                  <DescriptionTerm>Started</DescriptionTerm>
                  <DescriptionDetails>02:00</DescriptionDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionTerm>Sources reviewed</DescriptionTerm>
                  <DescriptionDetails>6</DescriptionDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionTerm>Needs you</DescriptionTerm>
                  <DescriptionDetails>
                    <Badge icon tone="warning">
                      3 approvals
                    </Badge>
                  </DescriptionDetails>
                </DescriptionListItem>
              </DescriptionList>
            </CardBody>
          </Card>
        </AppShellMain>
      </AppShellBody>
      <AppShellFooter>Assistant Workbench — build 5308874</AppShellFooter>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The skip link is first in the DOM and points at the main region.
    const skip = canvas.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveAttribute("href", "#kc-main");
    await expect(canvas.getByRole("main")).toHaveAttribute("id", "kc-main");

    // The nav landmark is named, which matters as soon as a page has two.
    await expect(canvas.getByRole("navigation", { name: "Sections" })).toBeVisible();

    // The current page is announced, not only shaded.
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

/**
 * With a sidebar. This is `knowledge`'s `.knowledge-nav` and
 * `retirement-dashboard`'s `.plan-rail` — both of which are 300-plus-line
 * bespoke components today, and both of which can keep their tree while sitting
 * in this frame.
 */
export const WithSidebar: Story = {
  render: () => (
    <AppShell>
      <AppShellHeader brand={<Wordmark />}>
        <AppShellNav label="Sections">
          <AppShellNavLink href="#browse">Browse</AppShellNavLink>
          <AppShellNavLink href="#search" isCurrent>
            Search
          </AppShellNavLink>
        </AppShellNav>
      </AppShellHeader>
      <AppShellBody>
        <AppShellSidebar label="Topics">
          <AppShellNav label="Topics list">
            <AppShellNavLink href="#design">Design systems</AppShellNavLink>
            <AppShellNavLink href="#infra">Infrastructure</AppShellNavLink>
            <AppShellNavLink href="#finance">Finance</AppShellNavLink>
          </AppShellNav>
        </AppShellSidebar>
        <AppShellMain>
          <PageHeader title="Search" description="Titles, body text, and metadata." />
          <EmptyState
            title="No matches yet"
            description="Search across every captured note, decision, and source."
          />
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  ),
};

/**
 * The marketing shape, which is the same shell with a link CTA instead of a
 * button and no application navigation. Both static-render consumers open this
 * way — and on those pages the shell ships as HTML with no React behind it.
 */
export const MarketingPage: Story = {
  render: () => (
    <AppShell>
      <AppShellHeader
        brand="mcp-dnsimple"
        actions={
          <LinkButton href="#docs" size="small" variant="secondary">
            Docs
          </LinkButton>
        }
      />
      <AppShellBody>
        <AppShellMain>
          <PageHeader
            eyebrow="Model Context Protocol"
            title="Your DNS, answerable in a sentence"
            description="A local-first MCP server for DNSimple."
            actions={<LinkButton href="#start">Get started</LinkButton>}
          />
          <DescriptionList layout="grid">
            <DescriptionListItem>
              <DescriptionTerm>Tools</DescriptionTerm>
              <DescriptionDetails>34</DescriptionDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionTerm>Prompts</DescriptionTerm>
              <DescriptionDetails>12</DescriptionDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionTerm>Build ref</DescriptionTerm>
              <DescriptionDetails>5308874</DescriptionDetails>
            </DescriptionListItem>
          </DescriptionList>
        </AppShellMain>
      </AppShellBody>
      <AppShellFooter>MIT licensed. No telemetry.</AppShellFooter>
    </AppShell>
  ),
};

/**
 * A sticky bar. Off by default: a pinned bar costs vertical space on every
 * scroll, and on a 320px viewport that is a real fraction of the page.
 */
export const StickyHeader: Story = {
  render: () => (
    <AppShell>
      <AppShellHeader isSticky brand={<Wordmark />}>
        <AppShellNav label="Sections">
          <AppShellNavLink href="#one" isCurrent>
            Ledger
          </AppShellNavLink>
          <AppShellNavLink href="#two">Plan</AppShellNavLink>
        </AppShellNav>
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain>
          <PageHeader title="Ledger" description="Scroll to see the bar hold." />
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index}>
              Row {index + 1}. A long enough page that the sticky behavior is
              observable rather than asserted.
            </p>
          ))}
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  ),
};
