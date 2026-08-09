import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { PageHeader } from "./PageHeader";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Page header",
  component: PageHeader,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "The band at the top of a page: what this is, what it is for, and what you can do to it. All five consumer repos have one and no two agree — `.page-header`, `.hero`, `.knowledge-header`, a bare `h1`.",
          "",
          "The heading's own margins are zeroed and the header owns the rhythm instead. That follows the Heading Rhythm Rule rather than breaking it: a heading opening its container has nothing above it to separate from, and the space that matters here belongs to the header as a block rather than to the heading as a line.",
          "",
          "Heading **sizes** are declared by this component and nowhere else, which is the same reason the token package ships none — the surface decides how large a heading is, and a page header is a surface. They clamp with the viewport rather than stepping at a breakpoint.",
        ].join("\n"),
      },
    },
  },
  args: {
    title: "Approvals",
    description: "Requests the assistant cannot decide on its own.",
  },
  argTypes: {
    level: {
      description:
        "Heading level. A page has one h1; a header opening a section inside a page takes the level that keeps the outline intact.",
      control: "inline-radio",
      options: [1, 2, 3],
      table: { defaultValue: { summary: "1" } },
    },
    divided: {
      description:
        "A rule under the header. Off by default so it does not stack with the app shell's own header border.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * The full set of slots, which between them cover every consumer's version:
 * `assistant-workbench`'s `.page-header` with its action row,
 * `retirement-dashboard`'s hero stat line, `knowledge`'s breadcrumb eyebrow.
 */
export const Complete: Story = {
  args: {
    eyebrow: "Operator",
    title: "Approvals",
    description:
      "Requests the assistant cannot decide on its own. Anything left unanswered for 48 hours expires.",
    actions: (
      <>
        <Button>Approve all safe</Button>
        <Button variant="secondary">Filter</Button>
      </>
    ),
    children: (
      <>
        <Badge icon tone="warning">
          3 waiting
        </Badge>
        <Badge>Updated 2 minutes ago</Badge>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Approvals" })).toBeVisible();
    // The eyebrow is a paragraph, not a heading — it must not enter the outline.
    await expect(canvas.queryByRole("heading", { name: "Operator" })).toBeNull();
  },
};

/**
 * A destructive action in the header. It is outlined rather than filled, so it
 * cannot be mistaken for the coral key beside it — which is the whole reason the
 * danger variant has the shape it does.
 */
export const WithDangerAction: Story = {
  args: {
    title: "Zone: jflamb.com",
    description: "42 records. Last changed 3 August by Assistant Pulse.",
    actions: (
      <>
        <Button>Add record</Button>
        <Button variant="danger">Delete zone</Button>
      </>
    ),
  },
};

/**
 * A section header inside a page that already has an `h1`. Same appearance
 * decisions, different level — the outline is a document concern and the size is
 * a visual one, and they are set independently.
 */
export const SectionLevel: Story = {
  args: {
    level: 2,
    divided: true,
    title: "Sensitivity",
    description: "How the plan responds when one assumption moves.",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { level: 2, name: "Sensitivity" }),
    ).toBeVisible();
  },
};

/**
 * A marketing hero, which is the same component with a longer description and a
 * link rather than a button. This is `mcp-dnsimple`'s and `mcp-unifi`'s opening
 * band.
 */
export const MarketingHero: Story = {
  args: {
    eyebrow: "Model Context Protocol",
    title: "Your DNS, answerable in a sentence",
    description:
      "A local-first MCP server for DNSimple. Ask about a zone, change a record, and see what changed — without leaving the conversation.",
    actions: (
      <>
        <Button>Copy the MCP URL</Button>
        <Button variant="secondary">Read the docs</Button>
      </>
    ),
  },
};
