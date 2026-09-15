import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, within } from "storybook/test";
import {
  AppShell,
  AppShellBody,
  AppShellHeader,
  AppShellMain,
  AppShellNav,
  AppShellNavGroup,
  AppShellNavLink,
  AppShellNavMeta,
  AppShellSidebar,
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@jflamb/keycaps-react";
import "./layered-plate.css";

const meta = {
  title: "Foundations/Layered Plate comparison",
  parameters: {
    kcCanvas: "comparison",
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "A decision record for the shipped Layered Plate APIs. Each story renders the earlier Keycaps treatment beside the same content using the promoted Card, PageHeader, AppShell, token, and motion contracts.",
          "",
          "Use the Theme, Motion, and Forced colors toolbar controls to review the comparison against the system's real document-level contracts.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface TreatmentProps {
  children: ReactNode;
  className?: string;
  description: string;
  id: string;
  label: string;
  treatment: "current" | "layered";
}

function Treatment({
  children,
  className,
  description,
  id,
  label,
  treatment,
}: TreatmentProps) {
  return (
    <article
      aria-labelledby={`${id}-title`}
      className={`kc-layered-plate__treatment${className ? ` ${className}` : ""}`}
      data-testid={`${treatment}-treatment`}
      data-treatment={treatment}
    >
      <header className="kc-layered-plate__treatment-header">
        <div>
          <p className="kc-layered-plate__kicker">
            {treatment === "current" ? "Baseline" : "Proposal"}
          </p>
          <h2 id={`${id}-title`}>{label}</h2>
        </div>
        {treatment === "layered" ? (
          <Badge className="kc-layered-plate__tilted-badge">Layered Plate</Badge>
        ) : (
          <Badge>Current Keycaps</Badge>
        )}
      </header>
      <p className="kc-layered-plate__treatment-description">{description}</p>
      <div className="kc-layered-plate__viewport">{children}</div>
    </article>
  );
}

interface ComparisonProps {
  children: ReactNode;
  description: string;
  title: string;
}

function Comparison({ children, description, title }: ComparisonProps) {
  return (
    <main className="kc-layered-plate" aria-labelledby="layered-plate-title">
      <header className="kc-layered-plate__intro">
        <Badge tone="info">Design proposal</Badge>
        <h1 id="layered-plate-title">{title}</h1>
        <p>{description}</p>
      </header>
      <div className="kc-layered-plate__comparison">{children}</div>
    </main>
  );
}

function AppShellScreen({ treatment }: { treatment: "current" | "layered" }) {
  const prefix = `layered-plate-${treatment}`;
  const [utilityActive, setUtilityActive] = useState<"activity" | "overview">("overview");
  const [workspaceActive, setWorkspaceActive] = useState<
    "decisions" | "inbox" | "sources"
  >("inbox");

  return (
    <AppShell
      className="kc-layered-plate__app-shell"
      mainId={`${prefix}-main`}
      skipLabel={`Skip to ${treatment} main content`}
    >
      <AppShellHeader
        actions={
          <Button
            size={treatment === "current" ? "small" : undefined}
            variant="secondary"
          >
            Review
          </Button>
        }
        brand="Keycaps Studio"
      >
        <AppShellNav
          label={`${treatment} utility navigation`}
          treatment={treatment === "layered" ? "selector" : "plain"}
        >
          <AppShellNavLink
            href={`#${prefix}-overview`}
            isCurrent={utilityActive === "overview"}
            onPress={() => setUtilityActive("overview")}
          >
            Overview
          </AppShellNavLink>
          <AppShellNavLink
            href={`#${prefix}-activity`}
            isCurrent={utilityActive === "activity"}
            onPress={() => setUtilityActive("activity")}
          >
            Activity
          </AppShellNavLink>
        </AppShellNav>
      </AppShellHeader>
      <AppShellBody sidebarLayout>
        <AppShellSidebar density="compact" label={`${treatment} workspace navigation`}>
          <AppShellNavGroup
            label="Workspace"
            treatment={treatment === "layered" ? "selector" : "plain"}
          >
            <AppShellNavLink
              href={`#${prefix}-inbox`}
              isCurrent={workspaceActive === "inbox"}
              onPress={() => setWorkspaceActive("inbox")}
            >
              Inbox <AppShellNavMeta>8</AppShellNavMeta>
            </AppShellNavLink>
            <AppShellNavLink
              href={`#${prefix}-decisions`}
              isCurrent={workspaceActive === "decisions"}
              onPress={() => setWorkspaceActive("decisions")}
            >
              Decisions <AppShellNavMeta>3</AppShellNavMeta>
            </AppShellNavLink>
            <AppShellNavLink
              href={`#${prefix}-sources`}
              isCurrent={workspaceActive === "sources"}
              onPress={() => setWorkspaceActive("sources")}
            >
              Sources
            </AppShellNavLink>
          </AppShellNavGroup>
        </AppShellSidebar>
        <AppShellMain id={`${prefix}-main`}>
          <PageHeader
            className="kc-layered-plate__app-header"
            eyebrow="Today"
            level={3}
            surface={treatment === "layered" ? "contrast" : "plain"}
            title="Design review"
            description="Three decisions need a clear owner before the next handoff."
          />
          <div className="kc-layered-plate__app-stack">
            <Banner title="Ready for review" tone="success">
              The evidence pack is current and no conflicts are open.
            </Banner>
            <Card
              className="kc-layered-plate__app-card"
              surface={treatment === "layered" ? "minimal" : "raised"}
            >
              <CardHeader>
                <CardTitle level={4}>Surface hierarchy</CardTitle>
                <CardDescription>
                  Decide which boundaries need a line and which can rely on tone.
                </CardDescription>
              </CardHeader>
              <CardBody>
                <Button size={treatment === "current" ? "small" : undefined}>
                  Open comparison
                </Button>
              </CardBody>
            </Card>
          </div>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

const cardContent = [
  {
    badge: "Foundation",
    description: "The canvas and raised plate remain quiet and warm.",
    title: "Surface ladder",
  },
  {
    badge: "Interaction",
    description: "Borders stay where they explain a control, state, or edge.",
    title: "Border economy",
  },
  {
    badge: "Expression",
    description: "Tilt and motion punctuate the page without entering the task path.",
    title: "Settled motion",
  },
] as const;

function CardGrid({ treatment }: { treatment: "current" | "layered" }) {
  return (
    <div className="kc-layered-plate__card-grid">
      {cardContent.map((item, index) => (
        <Card
          aria-labelledby={`${treatment}-card-${index}`}
          className="kc-layered-plate__grid-card"
          key={item.title}
          surface={
            treatment === "layered"
              ? (["minimal", "tonal", "contrast"] as const)[index]
              : "raised"
          }
        >
          <CardHeader>
            <Badge className={index === 2 ? "kc-layered-plate__tilted-badge" : undefined}>
              {item.badge}
            </Badge>
            <CardTitle id={`${treatment}-card-${index}`} level={3}>
              {item.title}
            </CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="kc-layered-plate__card-note">
              {index === 0
                ? "Minimal contrast"
                : index === 1
                  ? "Tonal contrast"
                  : "Strong contrast"}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function PageHeaderScreen({ treatment }: { treatment: "current" | "layered" }) {
  return (
    <section className="kc-layered-plate__page-sample" aria-label={`${treatment} page header`}>
      <div className="kc-layered-plate__page-header-surface">
        <PageHeader
          actions={
            <>
              <Button>Review decisions</Button>
              <Button variant="secondary">View evidence</Button>
            </>
          }
          className="kc-layered-plate__page-header"
          eyebrow="Product design"
          level={3}
          surface={treatment === "layered" ? "tonal" : "plain"}
          title="Make the next decision obvious"
          description="Use surface tone to group related work, then reserve lines for boundaries that carry meaning."
        >
          <Badge className="kc-layered-plate__tilted-badge">3 open questions</Badge>
          <Badge>Updated today</Badge>
        </PageHeader>
      </div>
      <div className="kc-layered-plate__page-followup">
        <h3>What changes</h3>
        <p>
          The content and actions stay the same. The proposal changes only how the
          opening region sits on the page.
        </p>
      </div>
    </section>
  );
}

export const AppShellComparison: Story = {
  render: () => (
    <Comparison
      title="AppShell — current and Layered Plate"
      description="The proposed shell keeps simple dividers between its primary regions, then uses nested surface steps inside the content area."
    >
      <Treatment
        description="Borders and raised surfaces delineate the header, rail, and content objects."
        id="app-shell-current"
        label="Current"
        treatment="current"
      >
        <AppShellScreen treatment="current" />
      </Treatment>
      <Treatment
        description="Simple shell dividers define major regions; tonal surfaces carry hierarchy within the content area."
        id="app-shell-layered"
        label="Layered Plate"
        treatment="layered"
      >
        <AppShellScreen treatment="layered" />
      </Treatment>
    </Comparison>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("current-treatment")).toBeVisible();
    await expect(canvas.getByTestId("layered-treatment")).toBeVisible();
    await expect(canvas.getAllByRole("navigation", { name: /workspace navigation/ })).toHaveLength(2);
  },
};

export const CardGridComparison: Story = {
  render: () => (
    <Comparison
      title="Card grid — current and Layered Plate"
      description="The proposal turns one universal card treatment into a controlled surface ladder, with one deliberately tilted editorial accent."
    >
      <Treatment
        description="Every card uses the same raised plate, divider border, and light-theme shadow."
        id="card-grid-current"
        label="Current"
        treatment="current"
      >
        <CardGrid treatment="current" />
      </Treatment>
      <Treatment
        className="kc-layered-plate__treatment--card-grid"
        description="Subtle, raised, and contrast surfaces create hierarchy without making every container a box."
        id="card-grid-layered"
        label="Layered Plate"
        treatment="layered"
      >
        <CardGrid treatment="layered" />
      </Treatment>
    </Comparison>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { name: "Surface ladder" })).toHaveLength(2);
    await expect(canvas.getByTestId("layered-treatment")).toBeVisible();
  },
};

export const PageHeaderComparison: Story = {
  render: () => (
    <Comparison
      title="PageHeader — current and Layered Plate"
      description="The proposal treats the opening band as an intentional surface and keeps the heading, actions, metadata, and document outline unchanged."
    >
      <Treatment
        description="Open layout lets typography and spacing carry the opening hierarchy."
        id="page-header-current"
        label="Current"
        treatment="current"
      >
        <PageHeaderScreen treatment="current" />
      </Treatment>
      <Treatment
        className="kc-layered-plate__treatment--page-header"
        description="A tonal surface groups the opening band; the stronger inverse option remains available only for rare chapter breaks."
        id="page-header-layered"
        label="Layered Plate"
        treatment="layered"
      >
        <PageHeaderScreen treatment="layered" />
      </Treatment>
    </Comparison>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("heading", { name: "Make the next decision obvious" }),
    ).toHaveLength(2);
    await expect(canvas.getByTestId("layered-treatment")).toBeVisible();
  },
};
