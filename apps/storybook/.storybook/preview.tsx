import type { Decorator, Preview } from "@storybook/react-vite";
import { KeycapsDocsContainer } from "./docs-container";
import "./globals";
import "@jflamb/keycaps-tokens";
// The prose layer is an opt-in subpath for consumers, and this site is one of
// its consumers. Imported here rather than inside a story file so it is loaded
// the way an application would load it.
import "@jflamb/keycaps-tokens/prose.css";
import "@jflamb/keycaps-react/styles.css";
import "../src/foundations/foundations.css";
import "./preview.css";

// `sb-unstyled` is Storybook's opt-out from docs prose typography. Without it,
// its `.sbdocs-content p` rules outrank a component's own single-class styling,
// so a card description rendered the docs page's ink instead of its own muted
// token — invisible inside a light sample on a dark page.
const withCanvas: Decorator = (Story, context) => (
  <div
    className="kc-docs-canvas sb-unstyled"
    data-canvas={context.parameters.kcCanvas ?? "default"}
    data-testid="story-canvas"
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withCanvas],
  globalTypes: {
    theme: {
      description: "Explicit Keycaps color theme",
      toolbar: {
        icon: "paintbrush",
        title: "Theme",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    motion: {
      description:
        "Reduced motion. Sets data-kc-motion on the root — the same contract an app uses for an in-product motion preference.",
      toolbar: {
        icon: "play",
        title: "Motion",
        items: [
          { value: "system", title: "System motion preference" },
          { value: "reduce", title: "Reduced motion" },
        ],
      },
    },
    forcedColors: {
      description:
        "Applies the forced-colors token mapping. Only the operating system can put the browser in real forced-colors mode.",
      toolbar: {
        icon: "contrast",
        title: "Forced colors",
        items: [
          { value: "off", title: "Off" },
          { value: "simulate", title: "Forced colors (simulated)" },
        ],
      },
    },
  },
  initialGlobals: {
    theme: "light",
    motion: "system",
    forcedColors: "off",
  },
  parameters: {
    a11y: {},
    controls: {
      expanded: true,
    },
    docs: {
      canvas: { sourceState: "hidden" },
      container: KeycapsDocsContainer,
      // The Color page runs to 4803px with 51 token rows. A page that long
      // without in-page navigation is a scroll, not a reference.
      toc: {
        headingSelector: "h2, h3",
        // A card's title, or a heading inside a specimen panel, is a heading in
        // the document outline — correctly — but it is the component's or the
        // sample's structure, not the page's, and it does not belong in the
        // page index. Demo blocks repeating the same title would otherwise fill
        // the contents with identical entries. The prose samples are the acute
        // case: an article specimen is nothing but headings, and every one of
        // them landed in the index of the page documenting it.
        ignoreSelector:
          ".kc-card__title, .kc-pair__heading, .kc-prose h1, .kc-prose h2, .kc-prose h3",
        title: "On this page",
      },
    },
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          [
            "Color",
            "Type",
            "Space & shape",
            "Depth & elevation",
            "Motion",
            "Consuming Keycaps",
            "Release status",
            "Component showcase",
          ],
          "Components",
          "Prose",
          [
            "Overview",
            "Typography",
            "Inline elements",
            "Lists",
            "Quotes & asides",
            "Code block",
            "Table",
            "Details",
            "Callout",
            "Progress & meter",
            "Navigation",
            "Article",
          ],
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
