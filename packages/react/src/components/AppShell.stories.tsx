import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, within } from "storybook/test";
import {
  AppShell,
  AppShellBody,
  AppShellFooter,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavGroup,
  AppShellNavLink,
  AppShellNavMeta,
  AppShellNavTrigger,
  AppShellSidebar,
} from "./AppShell.js";
import { Badge } from "./Badge.js";
import { Banner } from "./Banner.js";
import { Button, LinkButton } from "./Button.js";
import { Card, CardBody, CardHeader, CardTitle } from "./Card.js";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
} from "./DescriptionList.js";
import { EmptyState } from "./EmptyState.js";
import { Dialog } from "./Dialog.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { Icon } from "../icons.js";
import { PageHeader } from "./PageHeader.js";

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
          `<span class="kc-badge" data-tone="info">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "The frame every application page sits in: a bar, a body, a footer, and a skip link before all of them. All five consumer repos carry a bespoke one — `.topbar`/`.layout`, `.app-shell`, `.knowledge-shell`, `.site-header` — and no two are alike. That is five repos routing around a hole rather than ignoring the system.",
          "",
          "It is deliberately structural. Apart from `AppShellNavLink` it contributes no interactive element of its own, so it needs almost nothing in `static.css` and composes with whatever router an app already has.",
          "",
          "**The skip link is rendered by default and first in the DOM.** Two of the five consumers have none at all; making it the shell's responsibility is the only way that floor holds across five codebases.",
          "",
          "For application navigation, `AppShellBody sidebarLayout` provides the persistent left rail, `AppShellSidebar density=\"compact\"` uses the reviewed 36px desktop directory row, and `AppShellNavTrigger` appears when a collapsible rail reflows away. Render the same groups in a start-side `Dialog` to retain the 44px mobile target.",
          "",
          "When both are present, textual brand and navigation items share a baseline by default. The bar and action slot otherwise stay centered, so navigation-free marketing headers, buttons, badges, and logo marks keep their own geometry when the bar wraps.",
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

/** A graphic mark must not change the bar's baseline or cross-size. */
export const WithLogoMark: Story = {
  render: () => (
    <AppShell>
      <AppShellHeader
        brand={
          <>
            <Icon
              aria-hidden="true"
              name="wifi-high"
              style={{ blockSize: "1.5rem", inlineSize: "1.5rem" }}
            />
            Workbench
          </>
        }
        actions={
          <Button size="small" variant="secondary">
            Account
          </Button>
        }
      >
        <AppShellNav label="Sections">
          <AppShellNavLink href="#overview" isCurrent>
            Overview
          </AppShellNavLink>
          <AppShellNavLink href="#activity">Activity</AppShellNavLink>
        </AppShellNav>
      </AppShellHeader>
      <AppShellBody>
        <AppShellMain>
          <PageHeader title="Overview" description="A logo-mark header." />
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  ),
};

const BaselineText = ({
  children,
  probe,
}: {
  children: string;
  probe: "brand" | "nav";
}) => (
  <span>
    {children}
    <span
      aria-hidden="true"
      data-baseline-probe={probe}
      style={{ blockSize: 0, display: "inline-block", inlineSize: 0 }}
    />
  </span>
);

const BaselineFixture = ({ withLogo }: { withLogo?: boolean }) => (
  <AppShell
    data-baseline-fixture={withLogo ? "logo" : "text"}
    skipLink={false}
    style={{ minBlockSize: "auto" }}
  >
    <AppShellHeader
      brand={
        <>
          {withLogo ? (
            <Icon
              aria-hidden="true"
              name="wifi-high"
              style={{
                blockSize: "2rem",
                boxSizing: "border-box",
                inlineSize: "2rem",
                // Preserve the 32px layout stress while matching the public
                // mark's 24px ink.
                padding: "var(--kc-space-1)",
              }}
            />
          ) : (
            <span aria-hidden="true">◆</span>
          )}
          <BaselineText probe="brand">Workbench</BaselineText>
        </>
      }
      actions={
        <Button size="small" variant="secondary">
          Account
        </Button>
      }
    >
      <AppShellNav label="Sections">
        <AppShellNavLink href="#overview" isCurrent>
          <BaselineText probe="nav">Overview</BaselineText>
        </AppShellNavLink>
        <AppShellNavLink href="#activity">Activity</AppShellNavLink>
      </AppShellNav>
    </AppShellHeader>
  </AppShell>
);

/** Playwright-only baseline probes; hidden from the generated component docs. */
export const BaselineRegressionFixture: Story = {
  parameters: { docs: { disable: true } },
  tags: ["!autodocs"],
  render: () => (
    <div style={{ display: "grid", gap: "var(--kc-space-5)" }}>
      <BaselineFixture />
      <BaselineFixture withLogo />
    </div>
  ),
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
 * Ordered groups may be labelled or unlabelled. Navigation icons accept any
 * React element, stay decorative beside a complete text label, and preserve
 * current, disabled, and trailing-meta states.
 */
export const GroupedNavigationStates: Story = {
  render: () => (
    <AppShell style={{ minBlockSize: "auto" }}>
      <AppShellBody sidebarLayout>
        <AppShellSidebar density="compact" label="Primary navigation">
          <AppShellNavGroup>
            <AppShellNavLink
              href="#overview"
              icon={<Icon name="tree-structure" />}
              isCurrent
            >
              Overview
            </AppShellNavLink>
          </AppShellNavGroup>
          <AppShellNavGroup label="Household">
            <AppShellNavLink
              href="#orders"
              icon={<Icon name="cloud-arrow-up" />}
            >
              Orders <AppShellNavMeta>3 active</AppShellNavMeta>
            </AppShellNavLink>
            <AppShellNavLink href="#bills" icon={<Icon name="info" />}>
              Bills
            </AppShellNavLink>
          </AppShellNavGroup>
          <AppShellNavGroup label="System">
            <AppShellNavLink
              href="#connection"
              icon={<span aria-hidden="true">◆</span>}
              isDisabled
            >
              Connection unavailable
            </AppShellNavLink>
          </AppShellNavGroup>
        </AppShellSidebar>
        <AppShellMain>
          <PageHeader
            title="Navigation states"
            description="A package-owned example of grouped application destinations."
          />
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(
      navigation.querySelectorAll(".kc-app-shell__nav-group"),
    ).toHaveLength(3);
    await expect(canvas.getByRole("list", { name: "Household" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      canvas.getByRole("link", { name: "Connection unavailable" }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      navigation.querySelectorAll(
        '.kc-app-shell__nav-icon[aria-hidden="true"]',
      ),
    ).toHaveLength(4);
  },
};

type DraftDestination = {
  id: string;
  icon?: ReactNode;
  label: string;
  meta?: string;
};

type DraftGroup = {
  id: string;
  label?: string;
  items: readonly DraftDestination[];
};

const workbenchGroups = [
  {
    id: "work",
    label: "Your work",
    items: [
      { id: "overview", icon: <Icon name="tree-structure" />, label: "Overview" },
      {
        id: "approvals",
        icon: <Icon name="check-circle" />,
        label: "Approvals",
        meta: "3",
      },
      { id: "activity", icon: <Icon name="hard-drives" />, label: "Activity" },
    ],
  },
  {
    id: "household",
    label: "Household",
    items: [
      { id: "orders", icon: <Icon name="cloud-arrow-up" />, label: "Orders" },
      { id: "bills", icon: <Icon name="info" />, label: "Bills", meta: "2 due" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "latest-run",
        icon: <Icon name="terminal-window" />,
        label: "Latest run",
        meta: "8:30",
      },
    ],
  },
] as const satisfies readonly DraftGroup[];

const retirementGroups = [
  {
    id: "home",
    items: [{ id: "overview", label: "Overview" }],
  },
  {
    id: "now",
    label: "Now",
    items: [
      { id: "net-worth", label: "Net worth" },
      { id: "spending", label: "Spending" },
      { id: "cash-flow", label: "Cash flow" },
      { id: "holdings", label: "Holdings" },
    ],
  },
  {
    id: "plan",
    label: "The plan",
    items: [
      { id: "ask", label: "Ask" },
      { id: "plan", label: "Plan" },
      { id: "decisions", label: "Decisions", meta: "2 mo" },
      { id: "timeline", label: "Timeline" },
      { id: "healthcare", label: "Healthcare" },
      { id: "taxes", label: "Taxes" },
      { id: "legacy", label: "Legacy" },
      { id: "changes", label: "Changes", meta: "10 mo" },
      { id: "sensitivity", label: "Sensitivity" },
    ],
  },
] as const satisfies readonly DraftGroup[];

function DraftNavigation({
  activeId,
  groups,
  onNavigate,
}: {
  activeId: string;
  groups: readonly DraftGroup[];
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      {groups.map((group) => (
        <AppShellNavGroup key={group.id} label={group.label}>
          {group.items.map((item) => (
            <AppShellNavLink
              href={`#${item.id}`}
              icon={item.icon}
              isCurrent={item.id === activeId}
              key={item.id}
              onPress={() => onNavigate(item.id)}
            >
              <span>{item.label}</span>
              {item.meta ? <AppShellNavMeta>{item.meta}</AppShellNavMeta> : null}
            </AppShellNavLink>
          ))}
        </AppShellNavGroup>
      ))}
    </>
  );
}

function DraftApplicationShell({
  actions,
  brand,
  children,
  groups,
  initialId = "overview",
  mobileDescription,
  renderMain,
}: {
  actions: ReactNode;
  brand: ReactNode;
  children?: never;
  groups: readonly DraftGroup[];
  initialId?: string;
  mobileDescription: string;
  renderMain: (activeId: string, onNavigate: (id: string) => void) => ReactNode;
}) {
  const [activeId, setActiveId] = useState(initialId);
  const [isNavigationOpen, setNavigationOpen] = useState(false);

  const navigate = (id: string) => {
    setActiveId(id);
    setNavigationOpen(false);
  };

  return (
    <AppShell data-app-shell-draft="rail">
      <AppShellHeader
        actions={
          <>
            <AppShellNavTrigger
              onPress={() => setNavigationOpen(true)}
            >
              Sections
            </AppShellNavTrigger>
            {actions}
          </>
        }
        brand={brand}
      />
      <AppShellBody sidebarLayout>
        <AppShellSidebar
          collapsible
          density="compact"
          isSticky
          label="Primary navigation"
        >
          <DraftNavigation activeId={activeId} groups={groups} onNavigate={navigate} />
        </AppShellSidebar>
        <AppShellMain>{renderMain(activeId, navigate)}</AppShellMain>
      </AppShellBody>
      <Dialog
        className="kc-app-shell-draft__mobile-drawer"
        description={mobileDescription}
        isOpen={isNavigationOpen}
        onOpenChange={setNavigationOpen}
        placement="inline-start"
        title="Sections"
      >
        <nav aria-label="Primary navigation">
          <DraftNavigation activeId={activeId} groups={groups} onNavigate={navigate} />
        </nav>
      </Dialog>
    </AppShell>
  );
}

const destinationLabel = (groups: readonly DraftGroup[], activeId: string) =>
  groups.flatMap((group) => group.items).find((item) => item.id === activeId)?.label ?? "Overview";

/**
 * First-draft application shell for Assistant Workbench. The top-level routes
 * move into a grouped left rail while identity, theme, and account controls
 * remain global utilities in the header.
 */
export const AssistantWorkbenchSidebarDraft: Story = {
  render: () => (
    <DraftApplicationShell
      actions={
        <>
          <ThemeToggle cookieDomain=".jflamb.com" size="small" variant="secondary" />
          <Button size="small" variant="secondary">
            Jaime
          </Button>
        </>
      }
      brand={
        <>
          <span>Assistant Workbench</span>
          <Badge icon tone="success">
            Enter protected
          </Badge>
        </>
      }
      groups={workbenchGroups}
      mobileDescription="Move between your work, household activity, and system history."
      renderMain={(activeId, onNavigate) => {
        const title = destinationLabel(workbenchGroups, activeId);
        return (
          <div className="kc-app-shell-draft__main-stack">
            <PageHeader
              title={title}
              description={
                activeId === "overview"
                  ? "What Ellis handled, and what needs your decision."
                  : `Assistant Workbench ${title.toLowerCase()} in one focused view.`
              }
            />
            {activeId === "overview" ? (
              <>
                <DescriptionList divided layout="grid">
                  <DescriptionListItem>
                    <DescriptionTerm>Awaiting you</DescriptionTerm>
                    <DescriptionDetails>3 approvals</DescriptionDetails>
                  </DescriptionListItem>
                  <DescriptionListItem>
                    <DescriptionTerm>Expiring soon</DescriptionTerm>
                    <DescriptionDetails>1 request</DescriptionDetails>
                  </DescriptionListItem>
                  <DescriptionListItem>
                    <DescriptionTerm>Cleared recently</DescriptionTerm>
                    <DescriptionDetails>8 items</DescriptionDetails>
                  </DescriptionListItem>
                </DescriptionList>
                <div className="kc-app-shell-draft__workbench-grid">
                  <Card aria-labelledby="draft-needs-jaime">
                    <CardHeader>
                      <CardTitle id="draft-needs-jaime">Needs Jaime</CardTitle>
                      <Badge icon tone="warning">
                        3 waiting
                      </Badge>
                    </CardHeader>
                    <CardBody>
                      <p>Nothing consequential proceeds until you sign off.</p>
                      <Button onPress={() => onNavigate("approvals")}>Review approvals</Button>
                    </CardBody>
                  </Card>
                  <Card aria-labelledby="draft-assistant-activity">
                    <CardHeader>
                      <CardTitle id="draft-assistant-activity">Assistant activity</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <DescriptionList divided>
                        <DescriptionListItem>
                          <DescriptionTerm>Last check</DescriptionTerm>
                          <DescriptionDetails>8:30 PM</DescriptionDetails>
                        </DescriptionListItem>
                        <DescriptionListItem>
                          <DescriptionTerm>Next check</DescriptionTerm>
                          <DescriptionDetails>9:00 PM</DescriptionDetails>
                        </DescriptionListItem>
                      </DescriptionList>
                    </CardBody>
                  </Card>
                </div>
              </>
            ) : (
              <EmptyState
                title={`${title} shell state`}
                description="This draft changes the application frame and navigation only; the existing page content will migrate in place."
              />
            )}
          </div>
        );
      }}
    />
  ),
};

/**
 * First-draft application shell for Retirement Dashboard. It preserves the
 * current rail's hierarchy and badges, while moving its narrow-screen directory
 * into a start-side modal instead of a clipped horizontal scroller.
 */
export const RetirementDashboardSidebarDraft: Story = {
  render: () => (
    <DraftApplicationShell
      actions={
        <>
          <Button size="small" variant="secondary">
            Assumptions
          </Button>
          <ThemeToggle
            size="small"
            storageKey="retirement-dashboard-theme"
            variant="secondary"
          />
          <Button size="small" variant="secondary">
            Full plan PDF
          </Button>
          <Button size="small" variant="quiet">
            Sign out
          </Button>
        </>
      }
      brand={
        <span className="kc-app-shell-draft__retirement-brand">
          <strong>Retirement</strong>
          <span>Private planning model</span>
        </span>
      }
      groups={retirementGroups}
      mobileDescription="Move between current finances and every part of the retirement plan."
      renderMain={(activeId, onNavigate) => {
        const title = destinationLabel(retirementGroups, activeId);
        return (
          <div className="kc-app-shell-draft__main-stack">
            <Banner
              title="Current measured spending is required"
              tone="warning"
            >
              Connect or refresh Tiller data before relying on the recommendation.
            </Banner>
            <PageHeader
              title={activeId === "overview" ? "Review the decision" : title}
              description={
                activeId === "overview"
                  ? "The answer, the work ahead, and the plan's movement since the last save."
                  : `The ${title.toLowerCase()} view within the selected retirement plan.`
              }
            />
            {activeId === "overview" ? (
              <div className="kc-app-shell-draft__decision-grid">
                <section>
                  <h2>When can we retire, and what does that plan look like?</h2>
                  <p className="kc-app-shell-draft__answer">Recommendation unavailable</p>
                  <p>A current Tiller spending window is required before the model can answer.</p>
                  <LinkButton
                    href="#plan"
                    onPress={() => onNavigate("plan")}
                    variant="link"
                  >
                    Open plan
                  </LinkButton>
                </section>
                <section>
                  <h2>What has to be done, and by when?</h2>
                  <p className="kc-app-shell-draft__answer">8 open</p>
                  <p>Next: finish the military service deposit and confirm it posted.</p>
                  <LinkButton
                    href="#decisions"
                    onPress={() => onNavigate("decisions")}
                    variant="link"
                  >
                    Open decisions
                  </LinkButton>
                </section>
                <section>
                  <h2>Has the answer moved since the last saved plan?</h2>
                  <p className="kc-app-shell-draft__answer">10 months later</p>
                  <p>Compare the current inputs with the plan saved June 19, 2026.</p>
                  <LinkButton
                    href="#changes"
                    onPress={() => onNavigate("changes")}
                    variant="link"
                  >
                    Open changes
                  </LinkButton>
                </section>
                <section>
                  <h2>Where does the money come from and go?</h2>
                  <p className="kc-app-shell-draft__answer">2028–2066</p>
                  <p>Income, spending, taxes, and balances for every modeled year.</p>
                  <LinkButton
                    href="#timeline"
                    onPress={() => onNavigate("timeline")}
                    variant="link"
                  >
                    Open timeline
                  </LinkButton>
                </section>
              </div>
            ) : (
              <EmptyState
                title={`${title} shell state`}
                description="This draft preserves the planner's current information architecture while standardizing its frame and navigation."
              />
            )}
          </div>
        );
      }}
    />
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
