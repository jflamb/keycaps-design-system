import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SkipLink } from "./SkipLink";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Skip link",
  component: SkipLink,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "The first focusable thing in the document. Hidden until it takes focus, then a real key at the top-left corner.",
          "",
          "Three of the five consumer repos hand-roll one; two have none at all. `AppShell` renders one by default, which is the only way an accessibility floor holds across five codebases — someone always forgets, and the fix is to make forgetting impossible rather than to remember harder.",
          "",
          "**This is the one component whose styling lives in the tokens package rather than in `styles.css`.** `.kc-skip-link` is declared in `base.css` for two reasons: it has to work in a consumer that loads no component stylesheet at all, and its entire behavior is a `:focus` rule — which the data-attribute discipline that keeps `styles.css` inert cannot express. A skip link that needed React to appear would be useless in exactly the situations it exists for.",
          "",
          "The consequence worth knowing: it needs no entry in `static.css`. It already works in every delivery mode.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Tab into the frame below to see it. At rest it occupies no space and is
 * invisible; focused, it is a 44px-high key pinned to the corner of the viewport.
 */
export const Default: Story = {
  render: () => (
    <div>
      <SkipLink targetId="skip-demo-main" />
      <p>
        Press <kbd>Tab</kbd> from the top of this frame. The link appears in the
        upper-left corner of the viewport, not here.
      </p>
      <main id="skip-demo-main" tabIndex={-1}>
        <p>This is the target it jumps to.</p>
      </main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "Skip to main content",
    });
    await expect(link).toHaveAttribute("href", "#skip-demo-main");

    // Hidden at rest, and hidden by clipping rather than by `display: none` —
    // a `display: none` element is not focusable, which would defeat the point.
    await expect(link.getBoundingClientRect().height).toBeLessThanOrEqual(1);

    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

export const CustomLabel: Story = {
  render: () => (
    <div>
      <SkipLink targetId="skip-demo-plan">Skip to the plan</SkipLink>
      <main id="skip-demo-plan" tabIndex={-1}>
        <p>A shorter label is fine. Naming the destination is better than not.</p>
      </main>
    </div>
  ),
};
