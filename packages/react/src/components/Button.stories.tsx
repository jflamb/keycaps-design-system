import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, LinkButton } from "./Button";
import { CloseIcon } from "../icons";

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

/**
 * An action that destroys something.
 *
 * It is outlined rather than filled, and that is the one decision in this
 * variant worth reading twice. `danger` (#c7302b) and `coral-key` (#c7452c)
 * differ only in their green channel — put a filled key of each side by side on
 * an approvals row and nobody can tell "Approve" from "Reject" at a glance. Form
 * carries the difference instead of hue.
 *
 * Outlining solves that collision and creates a nearer one. A `secondary` key is
 * also a raised plate key, so what separates destroying from cancelling comes
 * down to a pink border and red ink — and under `forced-colors: active` both
 * resolve to the same system colors, leaving nothing. The octagon is why this
 * variant still reads as destructive there, and the component renders it rather
 * than offering it, because a second carrier a call site can forget is not one.
 *
 * The label still has to name the destruction. "Delete draft", not "Confirm".
 */
export const Danger: Story = {
  args: { variant: "danger", children: "Delete draft" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Delete draft" });
    // The wall is heavier than the sides, so the Pressable Edge Rule obliges it
    // to travel — and it does, from the same tokens the primary key reads.
    const computed = getComputedStyle(button);
    await expect(Number.parseFloat(computed.borderBlockEndWidth)).toBeGreaterThan(
      Number.parseFloat(computed.borderInlineStartWidth),
    );
    // The shape is supplied by the component, and it is decoration for the
    // accessibility tree — the label already names what will be destroyed.
    const mark = button.querySelector(".kc-button__tone-icon");
    await expect(mark).not.toBeNull();
    await expect(mark).toHaveAttribute("aria-hidden", "true");
  },
};

/**
 * A key whose label is a glyph.
 *
 * Four of the five consumer repos have one — `.icon-button`, `.icon-control`,
 * `.star-control`, `.drawer-trigger-icon` — which is four chances to ship a
 * control with no accessible name at all, because the glyph is `aria-hidden`
 * and there is nothing else to compute a name from. Setting `iconOnly` therefore
 * requires `aria-label` or `aria-labelledby` in the type, so omitting both is a
 * compile error at the call site rather than an axe violation in production.
 */
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    variant: "secondary",
    "aria-label": "Dismiss notification",
    children: <CloseIcon />,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Dismiss notification",
    });
    const computed = getComputedStyle(button);
    await expect(computed.minInlineSize).toBe("44px");
    await expect(computed.minBlockSize).toBe("44px");
  },
};

/**
 * An action that reads as a word inside a sentence.
 *
 * Distinct from `quiet`, which is still a key: this one has no surface, no wall,
 * no control height, and does not travel. That last part is the Pressable Edge
 * Rule read correctly — the edge promises travel, this variant wears none, so it
 * owes none, and a 3px hop on a run of text inside a paragraph would read wrong
 * either way.
 *
 * It is also the system's second documented exception to the 44×44 minimum,
 * after the `small` size. WCAG 2.5.8 exempts a target inside a block of text,
 * because meeting it would mean opening the leading of the paragraph around it.
 * The underline is not optional in exchange: the link blue was chosen to sit
 * calmly beside body text and does not clear 3:1 against it, so color alone
 * cannot identify it.
 */
export const Link: Story = {
  render: () => (
    <p style={{ maxInlineSize: "34rem" }}>
      This plan was last recalculated on 4 August. Assumptions have changed since
      then — <Button variant="link">recalculate now</Button> to see the current
      projection.
    </p>
  ),
};

/**
 * A destination wearing the key.
 *
 * `Button` renders a `<button>` and always will, because that is what an action
 * is. But a marketing page's call to action is a link, and under ADR 0002's
 * Mode 1 that page ships no client React — a statically rendered `<button>`
 * there is a control that cannot do anything. Both static-render consumers lead
 * with a row of anchors, so this is what their CTA is made of.
 *
 * Choose by what happens, not by how it should look: navigating is a link,
 * doing is a button.
 */
export const AsLink: Story = {
  render: () => (
    <div className="kc-story-stack">
      <LinkButton href="#read-the-docs">Read the docs</LinkButton>
      <LinkButton href="#see-the-source" variant="secondary">
        See the source
      </LinkButton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Read the docs" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveClass("kc-button");
  },
};

export const Variants: Story = {
  render: () => (
    <div className="kc-story-stack">
      <Button>Approve request</Button>
      <Button variant="secondary">Review details</Button>
      <Button variant="danger">Reject request</Button>
      <Button variant="quiet">Cancel</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The four keys on one row, which is the arrangement that decided the danger variant's shape. A filled danger key here would be a second coral key — the two hexes differ by 21 points in one channel — and the reader would be choosing between two identical-looking commitments. Read this row again in forced colors: \"Reject request\" and \"Review details\" resolve to the same border, wall, and ink, and the octagon is the only thing left saying which one destroys.",
      },
    },
  },
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
