import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "./Button.js";
import { Card, CardBody, CardHeader, CardTitle } from "./Card.js";
import { EmptyState } from "./EmptyState.js";
import { Icon } from "../icons.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Empty state",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "The panel that says nothing is here yet. Four of the five consumer repos have one, across six implementations — `.empty-state`, `.empty-note`, `.legacy-gift-empty`, `.now-fallback`, `.browse-workspace__empty`, `.chat-empty`.",
          "",
          "It is a recess rather than a raised object: it takes the page ground instead of the plate, inside a `divider` border at the plate radius. A card is a thing on the plate and reads as content; an empty state is the absence of content, and a well reads as the shape content would fill. It is still an object — the border and the radius keep it from dissolving into the page, which is the system's confirmed anti-reference.",
          "",
          "**Name what is absent, not the emptiness.** \"No approvals waiting\" tells the reader something; \"Nothing here\" tells them the screen loaded.",
        ].join("\n"),
      },
    },
  },
  args: {
    title: "No approvals waiting",
    description:
      "Requests appear here when the assistant needs a decision it cannot make on its own.",
  },
  argTypes: {
    level: {
      description:
        "Heading level. Match the surrounding outline — an empty state inside a card whose title is an h2 takes 3.",
      control: "inline-radio",
      options: [2, 3, 4, 5],
      table: { defaultValue: { summary: "3" } },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * With a glyph. It is decorative and `aria-hidden` — the heading carries the
 * meaning, exactly as the Tone Trio Rule requires of every status carrier.
 */
export const WithIcon: Story = {
  args: {
    icon: <Icon name="check-circle" />,
    title: "Inbox clear",
    description: "Every message has been triaged. The next sweep runs at 06:00.",
  },
};

/**
 * The first-run case, where the action is a genuine commitment and therefore
 * wears the coral key. An empty state whose action commits to nothing should not.
 */
export const WithAction: Story = {
  args: {
    title: "No saved plans yet",
    description:
      "A saved plan freezes today's assumptions so you can compare against them later.",
    actions: (
      <>
        <Button>Save this plan</Button>
        <Button variant="quiet">What gets saved?</Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 3, name: "No saved plans yet" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Save this plan" })).toBeVisible();
  },
};

/**
 * The no-results case, which is different from the nothing-yet case and should
 * read that way: the reader did something, and the fix is to do it differently.
 */
export const NoResults: Story = {
  args: {
    icon: <Icon name="magnifying-glass" />,
    title: 'No matches for "provenance ledger"',
    description: "Try fewer words, or search titles only.",
    actions: <Button variant="secondary">Clear filters</Button>,
  },
};

/**
 * Inside a card, which is where four of the five consumers actually put theirs.
 * The recessed ground is what makes the nesting read — the card is raised, the
 * empty state is the well inside it.
 */
export const InsideACard: Story = {
  render: () => (
    <Card aria-labelledby="empty-card-title">
      <CardHeader>
        <CardTitle id="empty-card-title">Recent activity</CardTitle>
      </CardHeader>
      <CardBody>
        <EmptyState
          level={3}
          title="Nothing overnight"
          description="The assistant ran at 02:00 and had no material findings."
        />
      </CardBody>
    </Card>
  ),
};
