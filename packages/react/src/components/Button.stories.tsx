import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./Button";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Use Button for actions. Choose primary once per decision area, secondary for alternatives, and quiet for low-emphasis actions. Labels should name the action directly.",
          "",
          "A primary key travels `3px` on press while its `4px` bottom edge compresses to `1px`, over `120ms`. The two values are coupled — the cap descends exactly as far as its wall shrinks, so the wall reads as absorbing the travel. The box itself never resizes: the press is transform-only, because animating the height relayouts every frame and turns the press into a wobble. When motion is suppressed the travel is removed, the wall stays at full height, and the key fills with `--kc-color-key-edge` instead. Switch the **Motion** control in the toolbar to feel the substitution, or read the values on the Motion page.",
        ].join("\n"),
      },
    },
  },
  args: {
    children: "Continue",
  },
  argTypes: {
    children: {
      description:
        "The label. Name the action — \"Save settings\", not \"OK\" — and keep it short enough that the key stays a key.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    isDisabled: {
      description:
        "Disables the button. Inherited from React Aria: the element stays in the accessibility tree and keeps its name, unlike removing it.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    onPress: {
      description:
        "Fires on click, Enter, and Space, and is not fired by a drag that leaves the target. Prefer this over `onClick`, which React Aria does not normalize across input methods.",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "(event: PressEvent) => void" },
      },
    },
    type: {
      description: "Native button type. Use `submit` inside a form.",
      control: "select",
      options: ["button", "submit", "reset"],
      table: {
        category: "React Aria (inherited)",
        type: { summary: '"button" | "submit" | "reset"' },
        defaultValue: { summary: '"button"' },
      },
    },
    autoFocus: {
      description: "Focuses the button on mount. Use sparingly — it moves the reader.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
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

/**
 * The 36px exception to the 44×44 minimum target. Reserve it for controls inside
 * a surface that is itself already a target, and enlarge the hit area another
 * way — Banner's dismiss uses this size with a 44×44 minimum and negative margin.
 */
export const Small: Story = {
  args: { size: "small", children: "Undo" },
  parameters: {
    docs: {
      description: {
        story:
          "The system's only documented exception to the 44×44 minimum target: 36px tall, micro type, tighter padding. The measured height is asserted by the play function below.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Undo" });
    await expect(getComputedStyle(button).minBlockSize).toBe("36px");
  },
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

/**
 * The press, driven rather than described. Holding the pointer down puts React
 * Aria's `data-pressed` on the element, which is what the travel and the edge
 * compression key off.
 */
export const PressAndHold: Story = {
  args: { children: "Save settings", onPress: fn() },
  parameters: {
    docs: {
      description: {
        story:
          "Holds the pointer down, checks the pressed state the travel and the edge compression key off, then releases. It also asserts the coupling itself: **travel + pressed edge width = resting edge width**. That equality is the physics — it holds at 3 + 1 = 4 with motion and at 0 + 4 = 4 with motion suppressed, so a change to one value without the other fails here rather than in someone's product.",
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Save settings",
    });
    const token = (name: string) =>
      Number.parseFloat(getComputedStyle(button).getPropertyValue(name));

    await expect(token("--kc-press-travel") + token("--kc-press-edge-width")).toBe(
      token("--kc-key-edge-width"),
    );

    await userEvent.pointer({ keys: "[MouseLeft>]", target: button });
    await expect(button).toHaveAttribute("data-pressed");

    // The release needs the same target: React Aria captures the pointer on
    // press, and a release without a target is delivered somewhere the capture
    // never sees. `waitFor` covers the React commit, which is not synchronous.
    await userEvent.pointer({ keys: "[/MouseLeft]", target: button });
    await waitFor(() => expect(button).not.toHaveAttribute("data-pressed"));
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
