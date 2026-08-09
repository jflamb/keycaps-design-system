import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Banner } from "./Banner";
import { Button } from "./Button";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Banner",
  component: Banner,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Banner communicates page-level status. State the consequence first and include a concrete next step when one exists.",
          "",
          "**The tone selects the role.** `warning` and `danger` render `role=\"alert\"`, which interrupts a screen reader immediately. `info` and `success` render `role=\"status\"`, which waits for a pause. Pass `role` explicitly to override — do that when the banner is present on first paint rather than appearing in response to something, so it does not announce out of nowhere.",
        ].join("\n"),
      },
    },
  },
  args: {
    children: "Your changes were saved locally.",
    title: "Saved",
    tone: "success",
  },
  argTypes: {
    children: {
      description:
        "The body. Put the next step here; the consequence belongs in `title`.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    role: {
      description:
        "Overrides the tone-derived live-region role. Destructured out of the native attributes, so it is listed here rather than under HTML props.",
      control: "select",
      options: [undefined, "status", "alert", "note"],
      table: { type: { summary: "string" }, defaultValue: { summary: "by tone" } },
    },
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

/**
 * Every tone, with the role each one announces under. Color is never the only
 * carrier: the title says what happened and the role says how urgently.
 */
export const Tones: Story = {
  render: () => (
    <div className="kc-story-column">
      <Banner title="Draft saved" tone="info">
        Your work is local and has not been published.
      </Banner>
      <Banner title="Saved" tone="success">
        Your changes were saved locally.
      </Banner>
      <Banner title="Review needed" tone="warning">
        One source has not been checked in 24 hours.
      </Banner>
      <Banner title="Connection lost" tone="danger">
        Reconnect Gmail before relying on inbox coverage.
      </Banner>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The play function asserts the role each tone resolves to: `status` for info and success, `alert` for warning and danger.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("status")).toHaveLength(2);
    await expect(canvas.getAllByRole("alert")).toHaveLength(2);
  },
};

/**
 * Dismiss actually dismisses. Banner is uncontrolled about its own visibility,
 * so removing it from the tree is the caller's job — this is what that looks like.
 */
export const Dismissible: Story = {
  args: {
    onDismiss: fn(),
    title: "New version available",
    tone: "info",
    children: "Refresh when you are ready to use the latest components.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The ✕ is a 44×44 target with a negative margin, so the visual padding stays tight while the hit area stays legal. The play function dismisses it and asserts `onDismiss` fired and the banner left the document.",
      },
    },
  },
  render: (args) => {
    const [visible, setVisible] = useState(true);

    return (
      <div className="kc-story-column">
        {visible ? (
          <Banner
            {...args}
            onDismiss={() => {
              args.onDismiss?.();
              setVisible(false);
            }}
          />
        ) : (
          <p>Dismissed.</p>
        )}
        <Button
          isDisabled={visible}
          onPress={() => setVisible(true)}
          variant="secondary"
        >
          Bring it back
        </Button>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole("button", { name: "Dismiss message" });

    const box = getComputedStyle(dismiss);
    await expect(box.minInlineSize).toBe("44px");
    await expect(box.minBlockSize).toBe("44px");

    await userEvent.click(dismiss);
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(
      canvas.queryByRole("button", { name: "Dismiss message" }),
    ).not.toBeInTheDocument();

    // Put it back, so a reader arriving after the play function has run finds a
    // banner to dismiss rather than the aftermath of one.
    await userEvent.click(canvas.getByRole("button", { name: "Bring it back" }));
    await expect(
      await canvas.findByRole("button", { name: "Dismiss message" }),
    ).toBeInTheDocument();
  },
};
