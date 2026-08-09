import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SearchField } from "./SearchField";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Search field",
  component: SearchField,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A Field with three things a Field does not have: the `searchbox` role, Escape-to-clear, and a clear control. All three come from React Aria's `SearchField` rather than from Keycaps — hand-rolled clear buttons are where the Escape key quietly goes missing, and `knowledge` hand-rolls exactly this shape today as `.search-field` plus `.search-field__clear`.",
          "",
          "The clear control is **absent** rather than present-and-inert while the field is empty, because an announced control that would do nothing is worse than no control at all.",
          "",
          "The magnifier and the clear key sit over the input rather than beside it in a wrapper. That is structural rather than visual: keeping the border, fill, and focus ring on the input itself means this field reuses `.kc-field__input`'s existing data-attribute states exactly. A wrapper carrying the box would have needed `:focus-within` — a live interactive selector in the stylesheet that is supposed to have none.",
        ].join("\n"),
      },
    },
  },
  args: { label: "Search knowledge" },
  argTypes: {
    label: {
      description:
        "The visible label. Required. A placeholder is not a label — it disappears the moment someone types.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    isLabelHidden: {
      description:
        "Renders the label to assistive technology only. For a search box in a header with no room for a visible label. The label itself is still required.",
      control: "boolean",
    },
    onSubmit: {
      description: "Fires on Enter.",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "(value: string) => void" },
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: "Titles, body text, and metadata.",
    inputProps: { placeholder: "Try a topic or a person" },
  },
};

/**
 * The clear control appearing and disappearing, driven rather than described.
 */
export const Clearing: Story = {
  args: { inputProps: { placeholder: "Try a topic or a person" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", { name: "Search knowledge" });

    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();

    await userEvent.type(input, "design system");
    const clear = await canvas.findByRole("button", { name: "Clear search" });
    await expect(clear).toBeVisible();

    // React Aria's own behavior, not ours: Escape clears a search field.
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
  },
};

/**
 * The header case. `knowledge` puts its search in a topbar where there is no
 * room for a visible label — which is a layout constraint, not permission to
 * drop the label.
 */
export const HiddenLabel: Story = {
  args: {
    isLabelHidden: true,
    inputProps: { placeholder: "Search" },
    defaultValue: "provenance",
  },
  play: async ({ canvasElement }) => {
    // Invisible to the eye, present to the accessibility tree.
    await expect(
      within(canvasElement).getByRole("searchbox", { name: "Search knowledge" }),
    ).toBeVisible();
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "??",
    errorMessage: "Search for at least three characters.",
  },
};
