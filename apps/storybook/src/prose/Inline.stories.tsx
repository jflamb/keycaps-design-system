import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Inline elements",
  parameters: {
    docs: {
      description: {
        component: [
          "The semantic inline elements HTML already has, styled so an author never has to reach for a `span` and a class.",
          "",
          "Each one is given a treatment that survives losing color: `del` keeps its line-through, `ins` its underline, `abbr` its dotted rule, `samp` its leading edge. That is the Tone Trio Rule applied at the scale of a word — a status expressed by color alone is a defect, and half of these are statuses.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantics: Story = {
  render: () => (
    <Prose>
      <h2>Every inline element, in a sentence that needs it</h2>

      <p>
        The <dfn>optical size axis</dfn> is a variation axis that redraws a face
        for the size it is set at, rather than scaling one drawing. Piazzolla
        carries one from <var>8</var> to <var>30</var>, and Keycaps leaves it on{" "}
        <code>font-optical-sizing: auto</code>.
      </p>

      <p>
        Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the
        command palette, then run the build. It prints{" "}
        <samp>tokens: 51KB (display), 44KB (body)</samp> and exits.
      </p>

      <p>
        The <abbr title="Design System">DS</abbr> team measured the pairing on{" "}
        <time dateTime="2026-08-08" title="8 August 2026">
          8 August
        </time>
        : x-heights within 1.2 percent, which is why they hold together where
        they meet. <mark>That measurement is the reason for the pairing</mark>,
        not the other way around.
      </p>

      <p>
        Copy under review: <del>the button animates its height on press</del>{" "}
        <ins>the button translates and compresses its edge on press</ins>. The
        first version relayouts every frame; the second is transform-only.
      </p>

      <p>
        A reviewer asked, <q>does the edge have to be four pixels?</q> It does —
        travel and edge width are one coupled pair. The current total is{" "}
        <output>3px down, 4px → 1px</output>, and changing either alone breaks
        the physics.
      </p>

      <p>
        Coverage is measured at 95<sup>th</sup> percentile viewport width, with
        the floor at 320<sub>px</sub>.{" "}
        <small>
          Verified in the browser matrix rather than asserted in a guideline.
        </small>
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The dotted rule is the abbreviation's only carrier once color is gone, so
    // a regression that drops it is worth failing the build over.
    const abbr = canvas.getByTitle("Design System");
    expect(getComputedStyle(abbr).textDecorationStyle).toBe("dotted");
  },
};

/**
 * The one place the system is most tempted to break its own rule. A keycap
 * design system rendering `<kbd>` as an actual keycap — bottom edge and all — is
 * the obvious move, and the Pressable Edge Rule forbids it.
 */
export const KeyboardKeys: Story = {
  render: () => (
    <Prose>
      <h2>Why these keys do not have a bottom edge</h2>
      <p>
        <kbd>Tab</kbd>, <kbd>Enter</kbd>, and <kbd>Esc</kbd> get the keycap
        radius, the seated <code>plate</code> surface, and a border on all four
        sides. What they do not get is the weighted{" "}
        <code>border-block-end</code> that a Button wears.
      </p>
      <p>
        The edge is a promise that the object travels when you activate it, and a{" "}
        <code>kbd</code> never travels — it is a picture of a key on a different
        device. This is the same reasoning that denies the Badge an edge, and it
        costs the system its most obvious joke.
      </p>
    </Prose>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Compare with `Prose/Details`, where `summary` is a real control and therefore does earn the edge — and travels on press to keep the promise.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const kbd = canvasElement.querySelector("kbd");
    expect(kbd).not.toBeNull();
    const style = getComputedStyle(kbd!);
    // Uniform border on all four sides. If the bottom ever gets heavier, the
    // element is making a promise it cannot keep.
    expect(style.borderBottomWidth).toBe(style.borderTopWidth);
  },
};
