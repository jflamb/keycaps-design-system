import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Badge is a compact, non-interactive status or category label. Keep text short and always include words; color alone never carries meaning.",
      },
    },
  },
  args: { children: "Beta", tone: "neutral" },
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
