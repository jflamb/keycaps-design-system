import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, type SelectOption } from "./Select";

const options: SelectOption[] = [
  { id: "project", label: "Project", description: "Work with a defined outcome." },
  { id: "area", label: "Area", description: "An ongoing responsibility." },
  { id: "resource", label: "Resource", description: "Reference material for later." },
  { id: "archive", label: "Archive", description: "Inactive material kept for the record." },
];

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Use Select when one choice is required from a known list. Options may include short descriptions when labels alone are ambiguous. Keyboard support, focus movement, and accessible naming come from React Aria Components.",
      },
    },
  },
  args: {
    label: "Destination",
    description: "Choose the PARA location that best matches this item.",
    options,
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
