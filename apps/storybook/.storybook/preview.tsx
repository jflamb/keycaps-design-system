import type { Decorator, Preview } from "@storybook/react-vite";
import "@jflamb/keycaps-tokens";
import "@jflamb/keycaps-react/styles.css";
import "./preview.css";

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as "light" | "dark";
  document.documentElement.dataset.theme = theme;
  return (
    <div className="kc-docs-canvas" data-testid="story-canvas">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Explicit Keycaps color theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      expanded: true,
    },
    docs: {
      canvas: { sourceState: "shown" },
    },
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default preview;
