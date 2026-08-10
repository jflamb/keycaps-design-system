import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLink,
  CardTitle,
} from "./Card.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Card groups one coherent topic or decision. Do not wrap every section in a card; open layout and simple dividers are often clearer, and a card inside a card usually means the inner grouping wanted a heading rather than a surface.",
          "",
          "Use heading levels that preserve the page outline — `CardTitle` renders `h2` by default and accepts `level={3}` or `level={4}`. The visual weight does not change with the level, so pick the level the document needs and nothing shifts.",
          "",
          "In light mode a card casts `--kc-shadow-plate`. In dark mode it casts nothing and depth comes from the surface ladder instead.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    "aria-labelledby": {
      description:
        "Point this at the `CardTitle` id when the card is a `section` or `article`, so the region takes the title as its accessible name.",
      control: "text",
      table: { category: "HTML (inherited)", type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card aria-labelledby="review-card-title">
      <CardHeader>
        <Badge tone="warning">Review needed</Badge>
        <CardTitle id="review-card-title">Confirm the filing destination</CardTitle>
        <CardDescription>
          This item looks like a durable resource, but it has not been moved.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <p>
          Suggested destination: <strong>Resources / Design systems</strong>
        </p>
      </CardBody>
      <CardFooter>
        <Button>Confirm destination</Button>
        <Button variant="secondary">Choose another</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * The prop that keeps a page outline intact. Three cards, three levels, one
 * appearance — the heading level is a document decision, not a visual one.
 */
export const HeadingLevels: Story = {
  render: () => (
    <div className="kc-story-column">
      <Card as="section" aria-labelledby="levels-h2">
        <CardHeader>
          <CardTitle id="levels-h2">Rendered as h2 — the default</CardTitle>
          <CardDescription>
            Correct directly beneath the page title.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card as="section" aria-labelledby="levels-h3">
        <CardHeader>
          <CardTitle id="levels-h3" level={3}>
            Rendered as h3
          </CardTitle>
          <CardDescription>
            Correct inside a section that already has an h2.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card as="div">
        <CardHeader>
          <CardTitle level={4}>Rendered as h4</CardTitle>
          <CardDescription>
            `as="div"` when the grouping is visual only and adds nothing to the
            outline.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The play function asserts each title renders at the level it was asked for, so a regression in `CardTitle` shows up as a failed interaction rather than a quietly flattened outline.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 2, name: /the default/ }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 3, name: /as h3/ }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 4, name: /as h4/ }),
    ).toBeVisible();
  },
};

/**
 * The whole card is one link.
 *
 * The accessible name is everything inside it, which is right for a short row —
 * `retirement-dashboard`'s `.hub-card-link`, `knowledge`'s `.home-update` — and
 * wrong the moment the card carries a title, a description, and a metadata line,
 * because a screen reader then announces the entire paragraph as the link text.
 * When that happens, reach for `CardLink` instead.
 *
 * It warms one step on hover rather than lifting. The plate shadow is `none` in
 * dark, so a hover expressed as elevation would exist in one theme only; surface
 * tone works in both, which is the same reasoning the dark ladder is built on.
 * It does not depress: a card is the plate, and the plate has no wall to
 * compress.
 */
export const WholeCardLink: Story = {
  render: () => (
    <div className="kc-story-column">
      <Card as="a" href="#approvals">
        <CardHeader>
          <CardTitle level={3}>Approvals</CardTitle>
          <CardDescription>Three requests waiting on you.</CardDescription>
        </CardHeader>
      </Card>
      <Card as="a" href="#activity">
        <CardHeader>
          <CardTitle level={3}>Activity</CardTitle>
          <CardDescription>What the assistant did overnight.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /Approvals/ });
    await expect(link).toHaveClass("kc-card");
    await expect(link).toHaveAttribute("data-linked");
  },
};

/**
 * The title is the link; the rest of the card is clickable through an overlay.
 *
 * This is the shape to use whenever the card carries more than a line or two —
 * the accessible name stays the title, so the link list a screen reader user
 * navigates by is a list of destinations rather than a list of paragraphs.
 *
 * The cost is real and worth stating rather than discovering: the overlay sits
 * above the card's text, so body copy inside a linked card cannot be selected. A
 * card whose content the reader needs to copy should use an ordinary link and no
 * overlay.
 */
export const LinkedTitle: Story = {
  render: () => (
    <Card isLinked>
      <CardHeader>
        <Badge tone="info">Updated</Badge>
        <CardTitle level={3}>
          <CardLink href="#filing-destination">
            Confirm the filing destination
          </CardLink>
        </CardTitle>
        <CardDescription>
          This item looks like a durable resource, but it has not been moved.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <p>
          Suggested destination: <strong>Resources / Design systems</strong>
        </p>
      </CardBody>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The name is the title, not the whole card.
    await expect(
      canvas.getByRole("link", { name: "Confirm the filing destination" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /durable resource/ })).toBeNull();
  },
};
