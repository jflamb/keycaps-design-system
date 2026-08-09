import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Callout",
  parameters: {
    docs: {
      description: {
        component: [
          "An admonition inside an article — the thing a markdown pipeline emits for `> [!WARNING]`.",
          "",
          "It is deliberately the Banner's shape: small radius, a 4px leading edge in the tone's border color, the tone's surface and ink. A reader should not have to learn that an admonition in an article and a message in an app are the same thing. What differs is that this one is built from bare markup and a `data-tone` attribute, so a pipeline with no access to React can produce it.",
          "",
          "The icon is a CSS mask drawn inline in the stylesheet — nothing is fetched at runtime — and each tone is a **different shape**, not the same shape in a different color, so the distinction survives forced colors, monochrome print, and color vision deficiency. It is decorative; the accessible name has to come from the markup.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <Prose>
      <div aria-label="Note" className="kc-prose__callout" role="note">
        <div>
          <p className="kc-prose__callout-title">Info is the default</p>
          <p>
            A callout with no <code>data-tone</code> takes the info treatment.
            Use it for context the reader needs but does not have to act on.
          </p>
        </div>
      </div>

      <div
        aria-label="Success"
        className="kc-prose__callout"
        data-tone="success"
        role="note"
      >
        <div>
          <p className="kc-prose__callout-title">Verified</p>
          <p>
            Every surface reflows at 320 CSS pixels with no horizontal page
            scroll. This is checked in the browser matrix, not asserted.
          </p>
        </div>
      </div>

      <div
        aria-label="Warning"
        className="kc-prose__callout"
        data-tone="warning"
        role="note"
      >
        <div>
          <p className="kc-prose__callout-title">Pre-1.0</p>
          <p>
            Both packages share a version below <code>1.0.0</code>, so the public
            API can still change between minor releases.
          </p>
        </div>
      </div>

      <div
        aria-label="Danger"
        className="kc-prose__callout"
        data-tone="danger"
        role="note"
      >
        <div>
          <p className="kc-prose__callout-title">Do not pin the optical axis</p>
          <p>
            Setting <code>font-variation-settings</code> on Piazzolla fixes{" "}
            <code>opsz</code> to one value and throws away the small-size drawing
            that makes the Title role work.
          </p>
        </div>
      </div>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each tone is a separate note with its own accessible name, because the
    // icon shape is decorative and cannot be the only thing distinguishing them.
    expect(canvas.getAllByRole("note")).toHaveLength(4);
  },
};

/**
 * A callout holds blocks, not just a sentence. The first and last children lose
 * their outer margins so the padding stays the padding.
 */
export const WithBlocks: Story = {
  render: () => (
    <Prose>
      <div
        aria-label="Warning"
        className="kc-prose__callout"
        data-tone="warning"
        role="note"
      >
        <div>
          <p className="kc-prose__callout-title">
            Three things break the press
          </p>
          <ul>
            <li>Animating the box height instead of transforming it.</li>
            <li>Changing travel without changing the edge compression.</li>
            <li>
              Putting the ring inside the object, where the edge stops being
              readable.
            </li>
          </ul>
          <p>
            All three produce something that still moves and no longer reads as a
            key hitting a plate.
          </p>
        </div>
      </div>
    </Prose>
  ),
};
