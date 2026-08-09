import type { Meta, StoryObj } from "@storybook/react-vite";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Quotes & asides",
  parameters: {
    docs: {
      description: {
        component: [
          "Two editorial devices that should not look alike, distinguished by form rather than by spending a second color on the difference.",
          "",
          "A `blockquote` takes a leading rule and no fill: it is part of the argument, running in the same column. An `aside` takes a fill and no rule: it is beside the argument, floated out of the column and set one size down in muted ink.",
          "",
          "The floated aside is the one thing in this stylesheet intrinsic sizing cannot solve, so it is the single place the system's `30rem` breakpoint appears — below it, the aside linearizes rather than leaving the article two words wide beside it.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blockquote: Story = {
  render: () => (
    <Prose>
      <h2>Quoting a source</h2>
      <blockquote>
        <p>
          If everything moved, the press would mean nothing.
        </p>
        <cite>DESIGN.md, "The Quiet Plate"</cite>
      </blockquote>
      <p>
        The rule is <code>--kc-color-border</code> rather than an accent. Coral
        marks a commitment and mint means yes; a quotation is neither, and
        spending a semantic color on editorial furniture is exactly the dilution
        the Tone Trio Rule exists to prevent.
      </p>
      <blockquote>
        <p>A quotation can contain another one.</p>
        <blockquote>
          <p>
            The nested rule drops to the divider color, so depth is visible
            without a second device.
          </p>
        </blockquote>
      </blockquote>
    </Prose>
  ),
};

export const FloatedAside: Story = {
  render: () => (
    <Prose measure="42rem">
      <h2>Depth is physical in light and tonal in dark</h2>
      <aside>
        <p>
          A shadow on a dark ground reads as grime; a lighter surface reads as
          closer. The asymmetry is the point.
        </p>
      </aside>
      <p>
        In light mode a card casts a two-layer shadow — a 1px contact shadow at
        6 percent under a 28px ambient at 10 percent, both tinted with the
        graphite ink rather than black. In dark mode that shadow becomes{" "}
        <code>none</code> entirely, and depth is carried by the surface ladder
        instead.
      </p>
      <p>
        Overlays are the exception, because a popover is genuinely detached from
        the plate rather than resting on it, and detachment has to be legible in
        both physics.
      </p>
      <p>
        Narrow the canvas below 480 pixels and the aside stops floating. It has
        no intrinsic minimum, so at the 320px floor it would otherwise leave this
        column two words wide.
      </p>
    </Prose>
  ),
};
