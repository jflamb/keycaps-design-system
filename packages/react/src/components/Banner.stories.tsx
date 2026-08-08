import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./Banner";

const meta = {
  title: "Components/Banner",
  component: Banner,
  parameters: {
    docs: {
      description: {
        component:
          "Banner communicates page-level status. Use info and success for polite updates; warning and danger announce immediately. State the consequence first and include a concrete next step when one exists.",
      },
    },
  },
  args: {
    children: "Your changes were saved locally.",
    title: "Saved",
    tone: "success",
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Warning: Story = {
  args: {
    title: "Review needed",
    tone: "warning",
    children: "One source has not been checked in 24 hours.",
  },
};

export const Danger: Story = {
  args: {
    title: "Connection lost",
    tone: "danger",
    children: "Reconnect Gmail before relying on inbox coverage.",
  },
};

export const Dismissible: Story = {
  args: {
    onDismiss: () => undefined,
    title: "New version available",
    tone: "info",
    children: "Refresh when you are ready to use the latest components.",
  },
};
