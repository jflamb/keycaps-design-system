import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Article",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Everything in the prose stylesheet on one page, in the proportions a real document uses them.",
          "",
          "The individual stories show each element clean. This one shows whether they hold together — whether the callout, the table, the disclosure, and the aside read as four devices from one system rather than four decisions made separately. That is the failure this page is for, and it is not visible in any story that shows one element at a time.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
  render: () => (
    <Prose aria-labelledby="article-title" measure="46rem">
      <h1 id="article-title">Adopting Keycaps in an existing application</h1>
      <p className="kc-prose__lead">
        What the token layer changes on day one, what it leaves alone, and the
        three contracts a consuming app has to honor for the rest to work.
      </p>

      <nav aria-label="On this page" className="kc-prose__toc">
        <p className="kc-prose__toc-title">On this page</p>
        <ul>
          <li>
            <a href="#article-install">Installing the layers</a>
          </li>
          <li>
            <a href="#article-contracts">The three contracts</a>
          </li>
          <li>
            <a href="#article-cost">What it costs</a>
          </li>
          <li>
            <a href="#article-questions">Common questions</a>
          </li>
        </ul>
      </nav>

      <div aria-label="Note" className="kc-prose__callout" role="note">
        <div>
          <p>
            This page is a layout specimen. The commands and figures in it are
            illustrative — the authoritative versions live in the repository's{" "}
            <code>README</code> and <code>CHANGELOG</code>.
          </p>
        </div>
      </div>

      <h2 id="article-install">Installing the layers</h2>
      <p>
        Keycaps ships as two packages. The token package has no framework
        dependency, so the visual system is usable without React at all; the
        component package depends on it and adds the owned React surface.
      </p>

      <pre tabIndex={0}>
        <code>pnpm add @jflamb/keycaps-tokens @jflamb/keycaps-react</code>
      </pre>

      <p>
        Import the token layer once, near the application root. Component CSS is
        intentionally separate so a non-React consumer can take the tokens
        without it, and the prose stylesheet is separate again because a product
        surface that renders no articles should not pay for it.
      </p>

      <aside>
        <p>
          Nothing is fetched at runtime — fonts, styles, or glyphs. Every asset
          ships inside the package, which is also why the callout icons on this
          page are drawn in CSS rather than loaded.
        </p>
      </aside>

      <h2 id="article-contracts">The three contracts</h2>
      <p>
        Almost everything the system promises is carried by tokens rather than by
        component code, which is what lets a consuming app opt into the behavior
        without implementing any of it.
      </p>

      <dl>
        <dt>Theme</dt>
        <dd>
          The system color scheme by default; <code>data-theme</code> on the root
          element for an explicit choice. Keycaps writes no cookies and no
          browser storage — persisting a preference is the app's job.
        </dd>
        <dt>Motion</dt>
        <dd>
          The <code>prefers-reduced-motion</code> preference is authoritative,
          and <code>data-kc-motion</code> is the in-product override. Every value
          the substitution touches is a token, so no component implements it and
          none can forget it.
        </dd>
        <dt>Forced colors</dt>
        <dd>
          Every semantic token remaps to a system color, so a new component
          inherits high-contrast support by using tokens rather than by adding a
          media query.
        </dd>
      </dl>

      <h3>What changes visibly on day one</h3>

      <div
        aria-label="Visible changes on adoption"
        className="kc-prose__table-wrap"
        role="region"
        tabIndex={0}
      >
        <table>
          <caption>Measured against the pre-adoption defaults.</caption>
          <thead>
            <tr>
              <th scope="col">Surface</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
              <th className="kc-prose__numeric" scope="col">
                Δ payload
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Body face</th>
              <td>System stack</td>
              <td>Sofia Sans, variable</td>
              <td className="kc-prose__numeric">+44 KB</td>
            </tr>
            <tr>
              <th scope="row">Headings</th>
              <td>Same as body</td>
              <td>Piazzolla on h1 and h2</td>
              <td className="kc-prose__numeric">+51 KB</td>
            </tr>
            <tr>
              <th scope="row">Focus ring</th>
              <td>UA default</td>
              <td>3px coral at 3px offset</td>
              <td className="kc-prose__numeric">0 KB</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td />
              <td />
              <td className="kc-prose__numeric">+95 KB</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h2 id="article-cost">What it costs</h2>
      <p>
        The honest answer is two fonts and a reset. The reset uses{" "}
        <code>:where()</code> throughout, at zero specificity, so an existing
        stylesheet keeps winning wherever it already had an opinion
        <sup>
          <a href="#article-fn-1" id="article-fnref-1" role="doc-noteref">
            1
          </a>
        </sup>
        .
      </p>

      <div
        aria-label="Warning"
        className="kc-prose__callout"
        data-tone="warning"
        role="note"
      >
        <div>
          <p className="kc-prose__callout-title">
            One thing does change underneath you
          </p>
          <p>
            <code>font-synthesis: none</code> is on, so the browser never fakes a
            weight or a slant. A surface reaching for a weight the face does not
            ship fails silently rather than approximating — which is the intended
            cost, and occasionally a surprise.
          </p>
        </div>
      </div>

      <blockquote>
        <p>
          Reach for something the system does not ship and it fails silently,
          which is the intended cost.
        </p>
        <cite>DESIGN.md, "The No Faux Type Rule"</cite>
      </blockquote>

      <h2 id="article-questions">Common questions</h2>

      <details>
        <summary>Can we adopt the tokens without the components?</summary>
        <p>
          Yes, and it is the expected first step. Import{" "}
          <code>@jflamb/keycaps-tokens</code> alone and build against the custom
          properties; the components can follow a release later or never.
        </p>
      </details>

      <details>
        <summary>What about an app already using unprefixed variables?</summary>
        <p>
          <code>legacy.css</code> maps the older names onto the canonical{" "}
          <code>--kc-*</code> tokens, so the retrofit lands in one commit and the
          call sites rename over time. It is a migration path, not an API.
        </p>
      </details>

      <hr />

      <div
        aria-label="Success"
        className="kc-prose__callout"
        data-tone="success"
        role="note"
      >
        <div>
          <p>
            Every component is <strong>beta</strong>. A component becomes stable
            only after API review, automated interaction and accessibility
            checks, responsive and forced-color verification, and manual
            assistive-technology coverage recorded in the release record.
          </p>
        </div>
      </div>

      <section
        aria-labelledby="article-notes"
        className="kc-prose__footnotes"
        role="doc-endnotes"
      >
        <h2 id="article-notes">Notes</h2>
        <ol>
          <li id="article-fn-1">
            The two exceptions are <code>box-sizing</code> and the 320px minimum
            width, both of which are set unconditionally.{" "}
            <a href="#article-fnref-1" role="doc-backlink">
              ↩<span className="kc-sr-only"> Back to reference 1</span>
            </a>
          </li>
        </ol>
      </section>

      <p className="kc-prose__back-to-top">
        <a href="#article-title">Back to top</a>
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The outline is the thing this page is easiest to get wrong: one h1, then
    // h2s — including the notes section, which looks like a label and is still a
    // top-level section — with the only h3 nested under one of them.
    expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(5);
    expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  },
};
