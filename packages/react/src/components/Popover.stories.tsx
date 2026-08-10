import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./Button.js";
import { Popover, PopoverTrigger } from "./Popover.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    kcCanvas: "drop",
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Use Popover for brief, contextual content that belongs to a trigger. Do not put long tasks or consequential confirmation flows in a popover. It closes with Escape and returns focus to the trigger — the Escape story below performs that rather than asserting it in prose.",
          "",
          "A popover is the one thing in the system that genuinely floats, so it casts `--kc-shadow-overlay` in both themes. It caps at `min(24rem, calc(100vw - 2rem))` so it never overruns a small viewport.",
        ].join("\n"),
      },
    },
  },
  args: {
    children: "Popover content",
  },
  argTypes: {
    placement: {
      description:
        "Preferred side and alignment. React Aria flips it when there is not room, so treat this as a preference rather than a guarantee.",
      control: "select",
      options: ["bottom start", "bottom", "top start", "top", "start", "end"],
      table: {
        category: "React Aria (inherited)",
        type: { summary: "Placement" },
        defaultValue: { summary: '"bottom"' },
      },
    },
    isOpen: {
      description: "Controlled open state. Pair with `onOpenChange`.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    offset: {
      description: "Distance in pixels between the trigger and the popover.",
      control: "number",
      table: { category: "React Aria (inherited)", type: { summary: "number" } },
    },
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

/**
 * The keyboard contract, performed. Escape closes the dialog and focus lands
 * back on the trigger it came from.
 */
export const EscapeReturnsFocus: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="secondary">Account help</Button>
      <Popover aria-label="Account help" placement="bottom start">
        <strong>Use the email tied to your jflamb.com account.</strong>
        <p>Contact the site owner if you no longer have access.</p>
      </Popover>
    </PopoverTrigger>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Opens the popover, presses Escape, and asserts the dialog is gone and the trigger holds focus.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Account help",
    });

    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog", {
      name: "Account help",
    });
    // React Aria keeps the overlay hidden until it has measured its placement.
    await waitFor(() => expect(dialog).toBeVisible());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        within(document.body).queryByRole("dialog", { name: "Account help" }),
      ).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  },
};
