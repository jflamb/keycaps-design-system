import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Field } from "./Field";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Field binds a visible label, optional description, input, and validation message. Put format or privacy guidance before the input; write errors as a specific problem plus a recovery step.",
          "",
          "**How errors are announced.** React Aria wires `aria-describedby` from the input to both the description and the error text, and sets `aria-invalid` on the input. The error is part of the field's accessible description rather than a live region, so a screen reader reads it when the field is reached or re-read — it does not interrupt. For an error that must announce immediately, raise a `Banner` with `tone=\"danger\"` as well.",
          "",
          '**The `isInvalid={false}` trap.** Supplying `errorMessage` marks the field invalid on its own. Passing `isInvalid={false}` explicitly is a *controlled valid* state: it suppresses your message **and** React Aria\'s native constraint validation, so `isRequired`, `type="email"`, `pattern`, and server errors all stop reporting. Leave `isInvalid` unset unless you are deliberately controlling validity.',
        ].join("\n"),
      },
    },
  },
  args: {
    label: "Email address",
    description: "Used only for account notices.",
    inputProps: { placeholder: "name@example.com", type: "email" },
  },
  argTypes: {
    isRequired: {
      description:
        "Marks the field required and enables native constraint validation on form submit. Inherited from React Aria.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    isInvalid: {
      description:
        "Controlled validity. Leave unset to let `errorMessage` and native validation decide — see the trap described above.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    isDisabled: {
      description: "Disables the input while keeping it in the accessibility tree.",
      control: "boolean",
      table: { category: "React Aria (inherited)", type: { summary: "boolean" } },
    },
    value: {
      description: "Controlled value. Pair with `onChange`.",
      control: "text",
      table: { category: "React Aria (inherited)", type: { summary: "string" } },
    },
    defaultValue: {
      description: "Uncontrolled starting value.",
      control: "text",
      table: { category: "React Aria (inherited)", type: { summary: "string" } },
    },
    onChange: {
      description: "Called with the new string value, not the event.",
      table: {
        category: "React Aria (inherited)",
        type: { summary: "(value: string) => void" },
      },
    },
    name: {
      description: "Form field name, used on submit.",
      control: "text",
      table: { category: "React Aria (inherited)", type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { isRequired: true, label: "Project name" },
};

/**
 * A real error happens after input, so this story shows a value that is actually
 * wrong rather than an empty box with a red border.
 */
export const Invalid: Story = {
  args: {
    defaultValue: "jaime@",
    errorMessage: "Enter an email address in the format name@example.com.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`errorMessage` alone marks the field invalid — no `isInvalid` needed. The play function asserts the message reaches the input's accessible description.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: "Email address",
    });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(/name@example\.com/);
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    defaultValue: "Managed by your organization",
    description: "Your administrator controls this value.",
  },
};
