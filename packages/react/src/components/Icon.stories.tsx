import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, StatusIcon, iconNames } from "../icons.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Icon draws one of the Phosphor glyphs Keycaps vendors. The set is closed: names come from a generated union, so an unknown one is a compile error rather than a blank space at render time.",
          "",
          "There is no `register()`. A consumer adding its own glyphs would be rebuilding a local icon vocabulary, which is the divergence the adoption program exists to remove — a glyph Keycaps lacks is one line in the vendoring manifest and a release.",
          "",
          "**Naming.** Omit `label` and the glyph is decoration, hidden from assistive technology. That is almost always right: an icon beside its own label should not announce itself twice. Pass `label` only when the glyph is the whole message, and note that an icon-only Button names itself through `aria-label` on the button rather than on the glyph inside it.",
          "",
          "**Paint and size.** Every glyph fills with `currentColor` and scales to the box it is given, so it inherits ink from whatever it sits in and needs no stylesheet to become visible — which is what lets it survive a statically rendered Mode 1 page and forced colors alike.",
        ].join("\n"),
      },
    },
  },
  args: { name: "magnifying-glass" },
  argTypes: {
    name: {
      description: "Which glyph to draw. Unknown names do not compile.",
      control: "select",
      options: iconNames,
      table: { type: { summary: "KeycapsIconName" } },
    },
    label: {
      description:
        "The accessible name. Omit for decoration — the glyph then carries `aria-hidden`.",
      control: "text",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const mcpUnifiLandingIcons = [
  "arrow-right",
  "cloud-arrow-up",
  "globe-hemisphere-west",
  "hard-drives",
  "laptop",
  "shield-check",
  "terminal-window",
  "tree-structure",
  "users-three",
  "wifi-high",
] as const;

export const Default: Story = {
  render: (args) => <Icon {...args} style={{ inlineSize: "2rem", blockSize: "2rem" }} />,
};

/** Every glyph the package ships. Adding one is a commit, which is the point. */
export const TheWholeSet: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The complete vendored set. It grows by manifest entry rather than by import, so this gallery is the whole vocabulary a consumer can reach.",
      },
    },
  },
  render: () => (
    <ul
      style={{
        display: "grid",
        gap: "var(--kc-space-5)",
        gridTemplateColumns: "repeat(auto-fill, minmax(7rem, 1fr))",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {iconNames.map((name) => (
        <li
          key={name}
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "var(--kc-space-2)",
            textAlign: "center",
          }}
        >
          <Icon name={name} style={{ inlineSize: "1.75rem", blockSize: "1.75rem" }} />
          <code style={{ fontSize: "var(--kc-font-size-2xs)" }}>{name}</code>
        </li>
      ))}
    </ul>
  ),
};

/** The closed subset added for mcp-unifi's reviewed Phase 4 composition. */
export const McpUnifiLandingPage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The regular-weight glyphs used by mcp-unifi's semantic runtime path and supported-area tiles. They are vendored here so the consumer can retire its direct Phosphor React imports without replacing them with a runtime dependency.",
      },
    },
  },
  render: () => (
    <ul
      aria-label="mcp-unifi landing-page icons"
      style={{
        display: "grid",
        gap: "var(--kc-space-5)",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {mcpUnifiLandingIcons.map((name) => (
        <li
          key={name}
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "var(--kc-space-2)",
            textAlign: "center",
          }}
        >
          <Icon name={name} style={{ blockSize: "2rem", inlineSize: "2rem" }} />
          <code style={{ fontSize: "var(--kc-font-size-2xs)" }}>{name}</code>
        </li>
      ))}
    </ul>
  ),
};

/**
 * The Tone Trio Rule's second carrier: a distinct shape per tone, never a
 * recolor, and selected by tone rather than chosen by the caller.
 */
export const StatusShapes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Four tones, four shapes — a circled i, a circled check, a triangle, an octagon. These are the same paths `prose.css` masks for its callouts, from the same vendoring run, so a warning in an article and a warning on a Badge are one glyph. `neutral` has no shape and renders none.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "var(--kc-space-5)" }}>
      {(["info", "success", "warning", "danger"] as const).map((tone) => (
        <StatusIcon
          key={tone}
          label={tone}
          style={{ inlineSize: "2rem", blockSize: "2rem" }}
          tone={tone}
        />
      ))}
    </div>
  ),
};
