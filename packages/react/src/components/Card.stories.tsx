import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

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
