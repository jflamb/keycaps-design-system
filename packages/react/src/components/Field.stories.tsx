import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./Field";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Field binds a visible label, optional description, input, and validation message. Put format or privacy guidance before the input; write errors as a specific problem plus a recovery step.",
      },
    },
  },
  args: {
    label: "Email address",
    description: "Used only for account notices.",
    inputProps: { placeholder: "name@example.com", type: "email" },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { isRequired: true, label: "Project name" },
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    errorMessage: "Enter an email address in the format name@example.com.",
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, inputProps: { value: "Managed by your organization" } },
};
