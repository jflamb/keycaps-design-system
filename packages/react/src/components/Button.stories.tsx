import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Use Button for actions. Choose primary once per decision area, secondary for alternatives, and quiet for low-emphasis actions. Labels should name the action directly. The key edge compresses on press and becomes a color change when reduced motion is requested.",
      },
    },
  },
  args: {
    children: "Continue",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Not now" },
};

export const Quiet: Story = {
  args: { variant: "quiet", children: "Learn more" },
};

export const Disabled: Story = {
  args: { isDisabled: true, children: "Saving" },
};

export const Variants: Story = {
  render: () => (
    <div className="kc-story-stack">
      <Button>Approve request</Button>
      <Button variant="secondary">Review details</Button>
      <Button variant="quiet">Cancel</Button>
    </div>
  ),
};
