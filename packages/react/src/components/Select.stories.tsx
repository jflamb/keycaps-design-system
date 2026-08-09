import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select, type SelectOption } from "./Select";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const options: SelectOption[] = [
  { id: "project", label: "Project", description: "Work with a defined outcome." },
  { id: "area", label: "Area", description: "An ongoing responsibility." },
  { id: "resource", label: "Resource", description: "Reference material for later." },
  {
    id: "archive",
    label: "Archive",
    description: "Inactive material kept for the record.",
  },
];

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    kcCanvas: "drop",
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Use Select when one choice is required from a known list. Options may include short descriptions when labels alone are ambiguous. Keyboard support, focus movement, and accessible naming come from React Aria Components.",
          "",
          "The menu matches the trigger's width through `--trigger-width` and is bounded only by the viewport, so a wide field does not open a narrow menu. The list scrolls past roughly five described options.",
          "",
          "### The `options` array",
          "",
          "| Key | Type | Description |",
          "| --- | --- | --- |",
          "| `id` | `string \\| number` | Stable identity. This is the value reported by `onSelectionChange` and matched by `selectedKey` / `defaultSelectedKey`. Required. |",
          "| `label` | `string` | The visible option text, and the string used for typeahead. Required. |",
          "| `description` | `string` | Secondary line under the label. Add one only when the label alone is ambiguous. |",
          "| `isDisabled` | `boolean` | Renders the option unselectable while keeping it visible and announced. |",
        ].join("\n"),
      },
    },
  },
  args: {
    label: "Destination",
    description: "Choose the PARA location that best matches this item.",
    options,
  },
  argTypes: {
    defaultSelectedKey: {
      description:
        "Uncontrolled starting selection, matched against an option's `id`. Inherited from React Aria.",
      control: "text",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "string | number" },
      },
    },
    selectedKey: {
      description: "Controlled selection. Pair with `onSelectionChange`.",
      control: "text",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "string | number | null" },
      },
    },
    onSelectionChange: {
      description: "Called with the selected option's `id`.",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "(key: string | number) => void" },
      },
    },
    isDisabled: {
      description: "Disables the trigger while keeping it in the accessibility tree.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    isInvalid: {
      description:
        "Marks the select invalid. Unlike Field, Select does not infer this from `errorMessage` — set both.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    name: {
      description: "Form field name, used on submit.",
      control: "text",
      table: { category: "React Aria (inherited)", type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { defaultSelectedKey: "resource" },
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    errorMessage: "Choose a destination before continuing.",
  },
};

/**
 * A disabled option stays visible and announced. Removing it would hide the fact
 * that the choice exists at all, which is usually the thing the reader needs.
 */
export const WithDisabledOption: Story = {
  args: {
    options: [
      ...options.slice(0, 3),
      {
        id: "archive",
        label: "Archive",
        description: "Unavailable until the project is closed.",
        isDisabled: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "`isDisabled` on an option. The play function opens the menu and asserts the option is present and marked disabled rather than removed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Destination/,
    });
    await userEvent.click(trigger);

    const listbox = await within(document.body).findByRole("listbox");
    const archive = within(listbox).getByRole("option", { name: /Archive/ });
    await expect(archive).toHaveAttribute("aria-disabled", "true");

    await userEvent.keyboard("{Escape}");
  },
};

/**
 * The keyboard claims the guidance makes, demonstrated: the menu opens from the
 * keyboard, typeahead moves focus, Enter commits, and focus returns to the trigger.
 */
export const KeyboardSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Opens with ArrowDown, types to jump to an option, commits with Enter, and asserts the trigger holds the new value and the focus.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Destination/,
    });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await within(document.body).findByRole("listbox");

    await userEvent.keyboard("Resource");
    await userEvent.keyboard("{Enter}");

    await expect(trigger).toHaveTextContent("Resource");
    await expect(trigger).toHaveFocus();
  },
};
