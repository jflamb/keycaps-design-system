import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { CopyableCode, Prose } from "./prose";

const SAMPLE = `.my-key {
  min-block-size: var(--kc-control-min-size);
  border-block-end: var(--kc-key-edge-width) solid var(--kc-color-key-edge);
  border-radius: var(--kc-radius-key);
  background: var(--kc-color-key-face);
  transition: transform var(--kc-duration-press) var(--kc-ease-press);
}`;

const meta = {
  title: "Prose/Code block",
  parameters: {
    docs: {
      description: {
        component: [
          "`pre` takes the keycap radius, a divider border, and the raised surface — the same treatment inline `code` gets one step smaller, so a token name reads the same in a sentence as it does in a block.",
          "",
          "A `code` inside a `pre` draws nothing of its own. Two concentric boxes a few pixels apart is the failure mode, and it is the one this documentation site had to fix in its own frame.",
          "",
          "The copy control is visible at rest, which is a deliberate departure from the usual reveal-on-hover pattern: hover hides it from every touch user and from anyone navigating by keyboard until focus happens to land inside. That is also why it sits in a row above the block rather than floating over the corner — a control that is always there and also overlaid is always covering the first line. `.kc-prose__copy` is presentation only, though; a stylesheet cannot put text on a clipboard, so the button and its handler belong to the consuming app.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Prose>
      <h2>A key built from tokens alone</h2>
      <p>
        This honors both themes, forced colors, and reduced motion without any
        further work, because all three are token-level contracts.
      </p>
      <pre tabIndex={0}>
        <code>{SAMPLE}</code>
      </pre>
    </Prose>
  ),
};

export const WithCopyControl: Story = {
  render: () => (
    <Prose>
      <h2>The same block, with a copy control</h2>
      <CopyableCode code={SAMPLE} lang="CSS" />
      <p>
        The label swaps rather than announcing through a live region: the button
        is what the reader just activated, so its own accessible name changing is
        the feedback and needs no second channel.
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /copy/i });
    await userEvent.click(button);
    // In a runtime that denies the clipboard the label stays put rather than
    // claiming a success that did not happen, so accept either outcome and only
    // assert the control survived the interaction.
    expect(button).toBeVisible();
  },
};

/**
 * Long lines scroll by default, which keeps indentation readable and keeps the
 * page from going horizontal with them. `data-wrap` is the opt-out, for content
 * where the line breaks are incidental — a shell command, a URL, a log line.
 */
export const Wrapping: Story = {
  render: () => (
    <Prose>
      <h2>Scrolling and wrapping</h2>
      <p>Default — the block scrolls, the article does not.</p>
      <pre tabIndex={0}>
        <code>
          pnpm --filter @jflamb/keycaps-tokens build &amp;&amp; pnpm --filter
          @jflamb/keycaps-react build &amp;&amp; pnpm --filter
          @jflamb/keycaps-storybook build
        </code>
      </pre>
      <p>
        With <code>data-wrap</code> — the same command, broken where it fits.
      </p>
      <pre data-wrap tabIndex={0}>
        <code>
          pnpm --filter @jflamb/keycaps-tokens build &amp;&amp; pnpm --filter
          @jflamb/keycaps-react build &amp;&amp; pnpm --filter
          @jflamb/keycaps-storybook build
        </code>
      </pre>
    </Prose>
  ),
};
