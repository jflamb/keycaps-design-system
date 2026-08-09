import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Typography",
  parameters: {
    docs: {
      description: {
        component: [
          "The heading ladder and running text inside `.kc-prose`.",
          "",
          "Sizes live in this stylesheet and nowhere else. The token package deliberately ships no heading sizes — the surface decides how large a heading is, the face does not — so `--kc-prose-h1` through `--kc-prose-h6` are declared on `.kc-prose` and are the override point.",
          "",
          "`h1` and `h2` are Piazzolla; `h3` through `h5` are Sofia Sans; `h6` is not a rung on the ladder at all but the Micro role, because a document six levels deep is naming a field rather than opening a section.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every level, in order, with nothing skipped. The play function reads the
 * rendered faces back off the elements, so the Two Voice Rule is verified rather
 * than asserted in prose.
 */
export const HeadingLadder: Story = {
  render: () => (
    <Prose aria-labelledby="ladder-title">
      <h1 id="ladder-title">Writing documentation that survives a rewrite</h1>
      <p className="kc-prose__lead">
        A lead paragraph carries the article's claim at one step up from body
        size, in muted ink, so the eye lands on it before the first section.
      </p>

      <h2>Sections take the display face</h2>
      <p>
        Page-level sections use <code>h2</code>, which stays in Piazzolla with a
        hairline beneath it. The rule is part of the heading rather than a
        separator between blocks — it sits inside the box on padding, so the
        tight space above it belongs to the heading and the margin below
        separates the section it opens.
      </p>

      <h3>Subsections return to the body voice</h3>
      <p>
        Third-level headings and below are Sofia Sans. Piazzolla is reserved for
        page headings and card titles, and letting it drift further down the
        ladder is what makes a system stop reading as one.
      </p>

      <h4>Procedural detail</h4>
      <p>
        Fourth-level headings suit exceptions, nested requirements, and the parts
        of a procedure a reader will scan for rather than read through.
      </p>

      <h5>Reference material</h5>
      <p>
        Fifth-level headings should be rare. If a document needs them often, the
        document wants splitting rather than another rung.
      </p>

      <h6>Field label</h6>
      <p>
        The sixth level is uppercase Micro — a label, not a heading with a
        section under it. At this size weight is the only hierarchy signal left,
        which is why the role carries 760.
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const h2 = canvas.getByRole("heading", { level: 2 });
      const h3 = canvas.getByRole("heading", { level: 3 });
      expect(getComputedStyle(h2).fontFamily).toContain("Piazzolla");
      expect(getComputedStyle(h3).fontFamily).toContain("Sofia Sans");
    });
  },
};

/**
 * Rhythm is the whole point of this story: more space above a heading than
 * below, so the heading binds to the section it opens. Every gap here comes from
 * `--kc-space-heading-above` and `--kc-space-heading-below`, expressed in `em`
 * so the ratio survives at 2.5rem and at body size alike.
 */
export const Rhythm: Story = {
  render: () => (
    <Prose>
      <h2>Before the change</h2>
      <p>
        The paragraph closing a section sits nearer to the section it belongs to
        than to the heading that follows. That asymmetry is the hierarchy —
        the size ramp steps by a constant 0.125rem, so between adjacent levels it
        is below the ratio at which a size change reads as a role change on its
        own.
      </p>
      <p>
        A second paragraph separates by one blank line's worth of space, which is
        the <code>--kc-prose-flow</code> value and the smallest gap in the
        article.
      </p>
      <h3>After the change</h3>
      <p>
        The gap above this heading is larger than the gap below it by roughly
        2.67 to 1. Flow elements carry bottom margins only, so the two never
        collapse into one another and the heading's own value is what governs
        the space under it.
      </p>
    </Prose>
  ),
};
