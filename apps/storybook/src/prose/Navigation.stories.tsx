import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Navigation",
  parameters: {
    docs: {
      description: {
        component: [
          "The furniture a long document needs to be navigable: a table of contents, footnotes with backlinks, a return to the top, and the skip link that has to come before all of it.",
          "",
          "All four are markup patterns rather than components. The stylesheet gives them their treatment; the document has to supply the roles, the names, and the `id`s they point at.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The title is a paragraph, not a heading. A list of destinations should not
 * appear in the document outline as a section of the article — the Micro role is
 * what makes it read as a label anyway.
 */
export const TableOfContents: Story = {
  render: () => (
    <Prose>
      <nav aria-label="On this page" className="kc-prose__toc">
        <p className="kc-prose__toc-title">On this page</p>
        <ul>
          <li>
            <a href="#nav-press">The press</a>
          </li>
          <li>
            <a href="#nav-edge">The bottom edge</a>
            <ul>
              <li>
                <a href="#nav-edge-badge">Why a badge has none</a>
              </li>
            </ul>
          </li>
          <li>
            <a href="#nav-motion">The motion contract</a>
          </li>
        </ul>
      </nav>

      <h2 id="nav-press">The press</h2>
      <p>
        The cap descends exactly as far as its wall shrinks, so the object's
        lower boundary never moves.
      </p>

      <h2 id="nav-edge">The bottom edge</h2>
      <p>
        A weighted <code>border-block-end</code> is the keycap's side wall, and
        the thing that makes a button read as an object with height.
      </p>

      <h3 id="nav-edge-badge">Why a badge has none</h3>
      <p>
        A badge never receives input, so under the Pressable Edge Rule it must
        not wear the edge that promises travel.
      </p>

      <h2 id="nav-motion">The motion contract</h2>
      <p>
        The system preference is authoritative and{" "}
        <code>data-kc-motion</code> on the root is the explicit override,
        mirroring <code>data-theme</code>.
      </p>

      <p className="kc-prose__back-to-top">
        <a href="#nav-press">Back to top</a>
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The nav needs its own name: a page with more than one navigation landmark
    // is unnavigable without them, and a docs page usually has several.
    expect(canvas.getByRole("navigation", { name: "On this page" })).toBeVisible();
  },
};

export const Footnotes: Story = {
  render: () => (
    <Prose aria-labelledby="footnotes-title">
      <h2 id="footnotes-title">Measuring the pairing</h2>
      <p>
        The two faces were chosen on measurement as well as voice: at a common
        size their x-heights sit within 1.2 percent of each other
        <sup>
          <a href="#fn-1" id="fnref-1" role="doc-noteref">
            1
          </a>
        </sup>
        , which is why they hold together where they actually meet — a card title
        above its description.
      </p>
      <p>
        Both are continuously variable, so every role weight is a real weight in
        both voices rather than a nearest match
        <sup>
          <a href="#fn-2" id="fnref-2" role="doc-noteref">
            2
          </a>
        </sup>
        .
      </p>

      <section
        aria-labelledby="footnotes-heading"
        className="kc-prose__footnotes"
        role="doc-endnotes"
      >
        <h2 id="footnotes-heading">Notes</h2>
        <ol>
          <li id="fn-1">
            0.482em against 0.488em, measured at 1rem.{" "}
            <a href="#fnref-1" role="doc-backlink">
              ↩
              <span className="kc-sr-only"> Back to reference 1</span>
            </a>
          </li>
          <li id="fn-2">
            Piazzolla 100–900, Sofia Sans 1–1000.{" "}
            <a href="#fnref-2" role="doc-backlink">
              ↩
              <span className="kc-sr-only"> Back to reference 2</span>
            </a>
          </li>
        </ol>
      </section>
    </Prose>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The backlink glyph carries a `.kc-sr-only` label. An arrow alone is an unnamed link, and two of them on a page are two links with the same non-name.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Queried as `doc-backlink`, not `link`. The DPUB role is explicit on the
    // anchor and overrides the implicit one, which is the whole point — and a
    // detail worth having a test encode, because it is the kind of thing that
    // quietly breaks a query written the obvious way.
    expect(
      canvas.getByRole("doc-backlink", { name: /back to reference 1/i }),
    ).toBeVisible();
  },
};

/**
 * The skip link ships in `base.css` rather than here, because it is a
 * `.kc-sr-only` element that stops hiding once focused and belongs to the page
 * rather than to the article. It has to be the first focusable thing in the
 * document to be worth anything.
 */
export const SkipLink: Story = {
  render: () => (
    <div>
      <a className="kc-skip-link" href="#skip-target">
        Skip to main content
      </a>
      <Prose>
        <h2>Press Tab</h2>
        <p>
          The link above is invisible until it takes focus, at which point it
          pins to the top-left corner as a seated key at the 44px control floor.
        </p>
        <p id="skip-target">
          This paragraph is what it skips to. In a real page the target is the
          main landmark, and everything between the two is the repeated
          navigation the reader is escaping.
        </p>
      </Prose>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: /skip to main content/i });
    // Hidden until focused: it is clipped to a 1px box, not display:none, so it
    // stays in the accessibility tree and stays focusable.
    expect(getComputedStyle(link).position).toBe("absolute");
  },
};
