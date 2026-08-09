import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Badge is a compact, non-interactive status or category label. Keep text short and always include words; color alone never carries meaning.",
          "",
          "A badge wears a uniform 1px border on all four sides and no weighted bottom edge. That is deliberate: under the Pressable Edge Rule an object with a heavier bottom border promises travel, and a badge never receives input.",
        ].join("\n"),
      },
    },
  },
  args: { children: "Beta", tone: "neutral" },
  argTypes: {
    children: {
      description:
        "The label. One or two words, and always words — the tone is a second carrier, never the only one.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="kc-story-stack" aria-label="Badge tones">
      <Badge>Draft</Badge>
      <Badge tone="info">In review</Badge>
      <Badge tone="success">Complete</Badge>
      <Badge tone="warning">Needs attention</Badge>
      <Badge tone="danger">Blocked</Badge>
    </div>
  ),
};
