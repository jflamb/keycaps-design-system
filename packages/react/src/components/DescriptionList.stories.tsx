import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
} from "./DescriptionList";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Description list",
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A label-and-value list. Fifteen `<dl>` elements across the five consumer repos and five separate implementations of them — the single most repeated pattern in the set, which is why it is a component rather than advice.",
          "",
          "Each pair is wrapped in a `DescriptionListItem`. HTML permits exactly that — a `dl` may contain `div` elements each holding a `dt`/`dd` group — and it is what makes all three layouts one stylesheet instead of three: the pair becomes a box to lay out rather than two siblings to place by index.",
          "",
          "Choose the layout by the shape of the data, not the shape of the container. `rows` for a detail panel the reader scans down, `stacked` for a narrow column, `grid` for a strip of independent facts.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    layout: {
      description:
        "`rows` puts the term beside its value and stacks below 30rem; `stacked` always stacks; `grid` flows stacked pairs into as many columns as fit.",
      control: "inline-radio",
      options: ["rows", "stacked", "grid"],
      table: { defaultValue: { summary: '"rows"' } },
    },
    divided: {
      description:
        "A rule between items. Right for a ledger of many rows; wrong for three pairs inside a card, where the rule is louder than the content.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The detail-panel shape. This is `assistant-workbench`'s `.detail-list` and
 * `retirement-dashboard`'s `.data-grid`.
 */
export const Rows: Story = {
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionListItem>
        <DescriptionTerm>Requested by</DescriptionTerm>
        <DescriptionDetails>Assistant Pulse</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Resource</DescriptionTerm>
        <DescriptionDetails>dnsimple.com — zone records</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Expires</DescriptionTerm>
        <DescriptionDetails>
          <time dateTime="2026-08-11T09:00">11 August, 9:00</time>
        </DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>
          <Badge icon tone="warning">
            Waiting on you
          </Badge>
        </DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    // The `div` wrapper is spec-sanctioned and must not cost the terms their
    // semantics — axe's definition-list rules are the check that matters here.
    const terms = canvasElement.querySelectorAll("dl > div > dt");
    await expect(terms).toHaveLength(4);
  },
};

/**
 * The same content with a rule between rows. This is `mcp-unifi`'s
 * `.diagnostic-row` ledger, which is long enough that the rules help the eye
 * track across.
 */
export const Divided: Story = {
  ...Rows,
  args: { divided: true },
};

/**
 * The narrow-column shape, and what `rows` becomes below 30rem on its own.
 */
export const Stacked: Story = {
  ...Rows,
  args: { layout: "stacked" },
};

/**
 * A strip of independent facts. This is `knowledge`'s `.metadata-list` and
 * `mcp-dnsimple`'s `.stats` block, which is a `<dl>` of four `.stat` entries
 * hand-rolled today.
 *
 * Numbers take `numeric`, which sets tabular figures and aligns to the end edge
 * — the same reasoning `prose.css` applies to a numeric table column.
 */
export const Grid: Story = {
  render: () => (
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
        <DescriptionDetails>
          <code>5308874</code>
        </DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Health checked</DescriptionTerm>
        <DescriptionDetails>2 minutes ago</DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};

/**
 * Figures compared by digit position. `numeric` sets tabular numerals and aligns
 * to the end edge so the columns line up on the decimal.
 */
export const Numeric: Story = {
  render: () => (
    <DescriptionList divided>
      <DescriptionListItem>
        <DescriptionTerm>Portfolio at 65</DescriptionTerm>
        <DescriptionDetails numeric>$1,482,300</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Portfolio at 75</DescriptionTerm>
        <DescriptionDetails numeric>$1,109,750</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>Portfolio at 85</DescriptionTerm>
        <DescriptionDetails numeric>$894,020</DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),
};
