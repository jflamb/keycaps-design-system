import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { Popover, PopoverTrigger } from "./Popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "Use Popover for brief, contextual content that belongs to a trigger. Do not put long tasks or consequential confirmation flows in a popover. It closes with Escape and returns focus to the trigger.",
      },
    },
  },
  args: {
    children: "Popover content",
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="secondary">Account help</Button>
      <Popover aria-label="Account help" placement="bottom start">
        <strong>Use the email tied to your jflamb.com account.</strong>
        <p>Contact the site owner if you no longer have access.</p>
      </Popover>
    </PopoverTrigger>
  ),
};
