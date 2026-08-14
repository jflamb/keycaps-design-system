import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "./ThemeToggle.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A key that cycles the reader between following the system, light, and dark. Keycaps has defined the `data-theme` contract since ADR 0001 and shipped no control for it, so two consumers wrote their own and a third is about to.",
          "",
          "**Three states, not two.** The token layer resolves an unset `data-theme` through `prefers-color-scheme`, and the no-flash bootstrap writes nothing when nothing is stored — the system preference is the default and an explicit theme is an override. A two-state toggle cannot express that: the first press writes a value and the reader can never get back to the setting that tracks their evening.",
          "",
          "**Storage is a prop, because it is the one thing consumers genuinely differ on.** `assistant-workbench` shares a `jflamb-theme` cookie on `.jflamb.com` with `enter.jflamb.com`; `retirement-dashboard` is a single surface and stores locally. Pass `cookieDomain` for the first and nothing for the second. The component never writes a domain cookie by default — doing so would leak one surface's preference onto every sibling that never agreed to share it.",
          "",
          "**`storageKey` must match the page's bootstrap**, or the choice survives the click and not the reload.",
          "",
          "**Browser chrome is part of the contract.** `themeColorSelector` defaults to `meta[name=\"theme-color\"]`; the control synchronizes it after every choice and after operating-system changes in system mode. Use the same selector with `createThemeBootstrapScript` from `@jflamb/keycaps-react/theme` so the first frame is correct too.",
          "",
          "This is a Mode 2 component. `renderStatic` refuses it: a theme key on a page with no client runtime cannot do the one thing it is for, and unlike a Banner whose dismiss is dead but whose message still reads, there is nothing left of this one without the script.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    storageKey: {
      description: "Where the choice is stored. Must match the page's no-flash bootstrap.",
      control: "text",
      table: { defaultValue: { summary: '"jflamb-theme"' } },
    },
    cookieDomain: {
      description:
        "Write a cookie on this domain instead of `localStorage`, for a preference shared across surfaces.",
      control: "text",
      table: { type: { summary: "string" } },
    },
    themeColorSelector: {
      description:
        "Theme-color meta selector shared with the Mode 2 head bootstrap, or false to disable synchronization.",
      control: "text",
      table: { defaultValue: { summary: 'meta[name="theme-color"]' } },
    },
    variant: {
      description: "Emphasis. `quiet` is usual in header chrome.",
      control: "inline-radio",
      options: ["primary", "secondary", "quiet"],
    },
  },
  args: { variant: "quiet" },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Press it. The document's `data-theme` changes underneath the whole preview,
 * because that is the contract — the control sets one attribute on the root and
 * the token layer does everything else.
 */
export const Default: Story = {};

/**
 * The shared-preference arrangement, as `assistant-workbench` needs it. The
 * cookie is scoped to the parent domain so `enter.jflamb.com` reads the same
 * choice; nothing else about the control changes, which is the point of it
 * being a prop rather than a second component.
 */
export const SharedAcrossSurfaces: Story = {
  args: { cookieDomain: ".jflamb.com", storageKey: "jflamb-theme" },
  parameters: {
    docs: {
      description: {
        story:
          "Storybook is not served from `jflamb.com`, so the browser will decline this cookie here — the story documents the arrangement rather than demonstrating it.",
      },
    },
  },
};

/** In header chrome, which is where both existing consumers put theirs. */
export const InChrome: Story = {
  render: (args) => (
    <div
      style={{
        alignItems: "center",
        background: "var(--kc-color-surface-raised)",
        border: "1px solid var(--kc-color-border)",
        borderRadius: "var(--kc-radius-plate)",
        display: "flex",
        gap: "var(--kc-space-4)",
        justifyContent: "space-between",
        padding: "var(--kc-space-4) var(--kc-space-5)",
      }}
    >
      <strong style={{ fontFamily: "var(--kc-font-display)" }}>Keycaps</strong>
      <ThemeToggle {...args} />
    </div>
  ),
};
