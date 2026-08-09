import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Table",
  parameters: {
    docs: {
      description: {
        component: [
          "Data inside an article, and the scroll container it needs to survive a 320px viewport.",
          "",
          "The header is a raised surface with a weighted rule beneath it rather than a band of brand color. Coral marks a commitment, and a table header commits to nothing; the raised tone is the same device a Card uses to sit above the plate, and it inverts correctly in dark without a second declaration.",
          "",
          "`.kc-prose__table-wrap` needs `tabindex=\"0\"`, a `role`, and an accessible name in the markup. A scrollable region a keyboard cannot reach is a 2.1.1 failure; one without a name is a 4.1.2 failure. The stylesheet gives it the focus ring — it cannot give it the attributes.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Prose measure="44rem">
      <h2>Font payload by face</h2>
      <div
        aria-label="Font payload by face"
        className="kc-prose__table-wrap"
        role="region"
        tabIndex={0}
      >
        <table>
          <caption>Shipped WOFF2 assets, Latin subset.</caption>
          <thead>
            <tr>
              <th scope="col">Face</th>
              <th scope="col">Axis range</th>
              <th className="kc-prose__numeric" scope="col">
                Files
              </th>
              <th className="kc-prose__numeric" scope="col">
                Payload
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Piazzolla</th>
              <td>
                <code>opsz</code> 8–30
              </td>
              <td className="kc-prose__numeric">1</td>
              <td className="kc-prose__numeric">51 KB</td>
            </tr>
            <tr>
              <th scope="row">Sofia Sans</th>
              <td>
                <code>wght</code> 1–1000
              </td>
              <td className="kc-prose__numeric">2</td>
              <td className="kc-prose__numeric">44 KB</td>
            </tr>
            <tr>
              <th scope="row">System mono</th>
              <td>—</td>
              <td className="kc-prose__numeric">0</td>
              <td className="kc-prose__numeric">0 KB</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td />
              <td className="kc-prose__numeric">3</td>
              <td className="kc-prose__numeric">95 KB</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p>
        Numeric columns take <code>.kc-prose__numeric</code>, which aligns them
        on the end edge and switches to tabular figures so digits line up by
        position rather than by shape.
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Font payload by face" });
    // The keyboard has to be able to reach a container that scrolls.
    expect(region).toHaveAttribute("tabindex", "0");
  },
};

/**
 * Row rules already separate the rows, so striping is opt-in through
 * `data-zebra`. Two separators doing one job is noise on a table short enough to
 * scan, and worth it on one that is not.
 */
export const Zebra: Story = {
  render: () => (
    <Prose measure="44rem">
      <h2>Radii and what each one is for</h2>
      <div
        aria-label="Radius tokens"
        className="kc-prose__table-wrap"
        role="region"
        tabIndex={0}
      >
        <table data-zebra>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th className="kc-prose__numeric" scope="col">
                Value
              </th>
              <th scope="col">Belongs to</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <code>--kc-radius-sm</code>
              </th>
              <td className="kc-prose__numeric">6px</td>
              <td>Banners and badges — the tone carriers.</td>
            </tr>
            <tr>
              <th scope="row">
                <code>--kc-radius-key</code>
              </th>
              <td className="kc-prose__numeric">10px</td>
              <td>Buttons, inputs, popovers. The default.</td>
            </tr>
            <tr>
              <th scope="row">
                <code>--kc-radius-plate</code>
              </th>
              <td className="kc-prose__numeric">18px</td>
              <td>Cards, which read as the plate itself.</td>
            </tr>
            <tr>
              <th scope="row">
                <code>--kc-radius-pill</code>
              </th>
              <td className="kc-prose__numeric">999px</td>
              <td>Available and deliberately unused.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Prose>
  ),
};

/**
 * The measure is the constraint, not the table. At the default 58ch a wide table
 * scrolls inside its own container rather than taking the page horizontal with
 * it — which is what the 320 Rule requires of every surface in the system.
 */
export const NarrowMeasure: Story = {
  render: () => (
    <Prose>
      <h2>The same table at the default measure</h2>
      <p>
        Drag the canvas narrower. The article keeps its measure and the table
        scrolls inside the wrapper; the page never scrolls sideways.
      </p>
      <div
        aria-label="Press physics"
        className="kc-prose__table-wrap"
        role="region"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">At rest</th>
              <th scope="col">Pressed</th>
              <th scope="col">Reduced motion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Travel</th>
              <td>0px</td>
              <td>3px</td>
              <td>0px</td>
            </tr>
            <tr>
              <th scope="row">Edge width</th>
              <td>4px</td>
              <td>1px</td>
              <td>4px</td>
            </tr>
            <tr>
              <th scope="row">Face</th>
              <td>
                <code>coral-key</code>
              </td>
              <td>
                <code>coral-deep</code>
              </td>
              <td>
                <code>coral-edge</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Prose>
  ),
};
