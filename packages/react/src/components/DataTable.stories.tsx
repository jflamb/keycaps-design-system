import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge.js";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableFoot,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
} from "./DataTable.js";
import { EmptyState } from "./EmptyState.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Data table",
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A table of data, inside the scroll container it needs to survive 320 CSS pixels.",
          "",
          "### Why it exists",
          "",
          "`retirement-dashboard` renders 17 tables behind eight class names, and four of those classes are near-verbatim copies of one another. `.conversion-table` is `.now-table` with three declarations dropped — and one of the three is the `text-align: left` that stops its Year and Ages columns inheriting a global `td { text-align: right }`. That is a live rendering bug produced entirely by copying a class, which is the argument for this component in one line. This repo's own Storybook held eleven more tables, hand-authored against a `.kc-table` the package did not ship.",
          "",
          "### It is the same table `prose.css` already styles",
          "",
          "Down to the values: the raised header band with its weighted rule, the divider between rows, the `data-zebra` opt-in, tabular figures on numeric columns. A table of numbers in a dashboard and a table of numbers in an article are the same object, and a reader should not have to notice which page they are on. A unit test compares the two stylesheets rather than leaving the claim to review.",
          "",
          "### What the component adds",
          "",
          "The half a stylesheet cannot do. CSS cannot put `tabindex=\"0\"` on a scroll container, cannot give it a role or a name, and cannot put `scope` on a header cell — and those three decide whether a data table is usable by a keyboard and a screen reader. All three arrive by construction here: `scope` is not a prop, and the region's name is a **type error** to omit rather than an axe violation someone finds later.",
          "",
          "### What it deliberately does not do",
          "",
          "The survey read all three consumer repos from `origin/main`. Sorting, `aria-sort`, row selection, pagination, sticky headers, and column `min-width` appear in **none** of them, so each would be net-new surface with nothing to migrate. Density is not a prop either: the repos differ on cell padding six ways for one concept, and where repos differ only visually Keycaps picks one and the repos change.",
          "",
          "Filtering, totals rows, and semantic row colouring each appear exactly once, in one repo. The last of those is worth naming: `retirement-dashboard` paints a delta cell green or red by `data-drift-direction`, with no second carrier, which is a Tone Trio Rule defect. The system's answer is already in the box — put a `Badge` in the cell, where the tone comes with a word and a shape.",
          "",
          "### No hover, and no `static.css` entry",
          "",
          "Rows do not light up under the pointer. No consumer has a hover on a real table; a highlight on a row that does nothing is a false affordance; and a genuine hover state would mean routing rows through React Aria's collection components, which need a client runtime. A table is the most obviously static thing in the system, so the trade is a hover for Mode 1 eligibility and Mode 1 wins. The scroll container's focus ring comes from `base.css`, which every delivery mode loads.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    caption: {
      description:
        "Names the table natively, and the scroll region points at it. Supply this or `aria-label`; the type will not let you omit both.",
      control: "text",
    },
    zebra: {
      description:
        "Shades alternating rows. Reach for it when the eye has to track across many columns; the row rules are enough on a short table.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The `retirement-dashboard` `.now-table` shape, which is ten of its seventeen
 * tables: a caption, `scope="col"` headers, a label column, and figures aligned
 * on their end edge.
 *
 * `numeric` goes on the header cell as well as the body cells. Leave it off the
 * header and the column's label hangs off the opposite edge from its own
 * numbers, which is the single most common way a numeric column is got wrong.
 */
export const Default: Story = {
  args: { caption: "Balance by account group" },
  render: (args) => (
    <DataTable {...args}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Group</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Accounts</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Balance</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableCell>Taxable brokerage</DataTableCell>
          <DataTableCell numeric>3</DataTableCell>
          <DataTableCell numeric>$412,880</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell>Tax-deferred</DataTableCell>
          <DataTableCell numeric>4</DataTableCell>
          <DataTableCell numeric>$1,004,120</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell>Roth</DataTableCell>
          <DataTableCell numeric>2</DataTableCell>
          <DataTableCell numeric>$188,410</DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The two halves CSS cannot supply. A scroll region a keyboard cannot reach
    // is a 2.1.1 failure; one without a name is a 4.1.2 failure.
    const region = canvas.getByRole("region", { name: "Balance by account group" });
    await expect(region).toHaveAttribute("tabindex", "0");
    // `scope` arrives by construction rather than by remembering.
    await expect(canvas.getByRole("columnheader", { name: "Group" })).toHaveAttribute(
      "scope",
      "col",
    );
  },
};

/**
 * A row header turns a grid of values into a set of labelled rows: a screen
 * reader announces "Federal withholding, per period, $412.18" rather than
 * "$412.18". This is `retirement-dashboard`'s payroll reference table, which
 * needed a whole modifier class to undo the uppercase micro-label treatment its
 * base class put on every `th`. Here the two header cells are different
 * components, so there is nothing to undo.
 */
export const RowHeaders: Story = {
  args: { caption: "Observed payroll deductions" },
  render: (args) => (
    <DataTable {...args}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Deduction</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Per period</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Year to date</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableRowHeader>Federal withholding</DataTableRowHeader>
          <DataTableCell numeric>$412.18</DataTableCell>
          <DataTableCell numeric>$9,480.14</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Social Security</DataTableRowHeader>
          <DataTableCell numeric>$186.00</DataTableCell>
          <DataTableCell numeric>$4,278.00</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>401(k) pre-tax</DataTableRowHeader>
          <DataTableCell numeric>$923.07</DataTableCell>
          <DataTableCell numeric>$21,230.61</DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("rowheader", { name: "Social Security" })).toHaveAttribute(
      "scope",
      "row",
    );
  },
};

/**
 * A totals row belongs in `tfoot`, because a total is not another datum — it
 * summarizes the ones above it, and the element is the only thing that says so.
 * No consumer uses `tfoot` today; the two totals rows in the set are `tbody`
 * rows wearing a class, which is a row of data claiming to be a summary.
 *
 * The status column is the answer to the one real feature this component turned
 * down. `retirement-dashboard` colours a delta cell green or red and stops
 * there, which is a status carried by colour alone — a defect under the Tone
 * Trio Rule. A `Badge` brings a word and a shape with the tone, and it needs no
 * table API at all.
 */
export const TotalsAndRichCells: Story = {
  args: { caption: "Allocation against target" },
  render: (args) => (
    <DataTable {...args}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Asset class</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Target</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Actual</DataTableColumnHeader>
          <DataTableColumnHeader>Drift</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableRowHeader>US equity</DataTableRowHeader>
          <DataTableCell numeric>60.0%</DataTableCell>
          <DataTableCell numeric>64.2%</DataTableCell>
          <DataTableCell>
            <Badge icon tone="warning">
              4.2 over
            </Badge>
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>International equity</DataTableRowHeader>
          <DataTableCell numeric>20.0%</DataTableCell>
          <DataTableCell numeric>19.6%</DataTableCell>
          <DataTableCell>
            <Badge icon tone="success">
              On target
            </Badge>
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Bonds</DataTableRowHeader>
          <DataTableCell numeric>20.0%</DataTableCell>
          <DataTableCell numeric>16.2%</DataTableCell>
          <DataTableCell>
            <Badge icon tone="danger">
              3.8 under
            </Badge>
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
      <DataTableFoot>
        <DataTableRow>
          <DataTableRowHeader>Total</DataTableRowHeader>
          <DataTableCell numeric>100.0%</DataTableCell>
          <DataTableCell numeric>100.0%</DataTableCell>
          <DataTableCell />
        </DataTableRow>
      </DataTableFoot>
    </DataTable>
  ),
};

/**
 * Striping is opt-in through `zebra`, because the row rules already separate the
 * rows and a second separator on top of the first is noise on a table short
 * enough to scan. It earns its place on a wide one, where the eye has to track
 * across several columns to stay on a row.
 *
 * No consumer stripes a table today. It ships because `prose.css` already offers
 * `data-zebra`, and the component and the article table are meant to be one
 * object rather than two that mostly agree.
 */
export const Zebra: Story = {
  args: { caption: "Planned conversion schedule", zebra: true },
  render: (args) => (
    <DataTable {...args}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Year</DataTableColumnHeader>
          <DataTableColumnHeader>Ages</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Conversion</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Marginal bracket</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Year&rsquo;s tax</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {[
          ["2031", "62 · 60", "$48,000", "22%", "$10,560"],
          ["2032", "63 · 61", "$52,000", "22%", "$11,440"],
          ["2033", "64 · 62", "$52,000", "22%", "$11,440"],
          ["2034", "65 · 63", "$44,000", "22%", "$9,680"],
        ].map(([year, ages, conversion, bracket, tax]) => (
          <DataTableRow key={year}>
            <DataTableCell>{year}</DataTableCell>
            <DataTableCell>{ages}</DataTableCell>
            <DataTableCell numeric>{conversion}</DataTableCell>
            <DataTableCell numeric>{bracket}</DataTableCell>
            <DataTableCell numeric>{tax}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  ),
};

/**
 * When a heading directly above the table already says what it is, a visible
 * caption says it twice. Pass `aria-label` instead and the region is still
 * named — the type accepts the table either way and rejects it with neither.
 *
 * This is seven of `retirement-dashboard`'s seventeen tables. Its wrapper takes
 * an `aria-label` that repeats the panel heading, and where it does use a
 * caption, the caption text is passed a *second* time as the wrapper's label.
 * Here the caption is the label, so the two cannot drift apart.
 */
export const NamedWithoutACaption: Story = {
  args: { "aria-label": "What the survivor would be left with", caption: undefined },
  render: (args) => (
    <section>
      <h3 style={{ margin: "0 0 0.75rem" }}>What the survivor would be left with</h3>
      <DataTable {...args}>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>If this happens</DataTableColumnHeader>
            <DataTableColumnHeader>Survivor&rsquo;s steady yearly income</DataTableColumnHeader>
            <DataTableColumnHeader>Does the money still last?</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          <DataTableRow>
            <DataTableRowHeader>Jaime dies before retirement (2029)</DataTableRowHeader>
            <DataTableCell>$96,400/yr</DataTableCell>
            <DataTableCell>Yes, to age 95</DataTableCell>
          </DataTableRow>
          <DataTableRow>
            <DataTableRowHeader>Janine dies before retirement (2029)</DataTableRowHeader>
            <DataTableCell>$88,100/yr</DataTableCell>
            <DataTableCell>Yes, to age 95</DataTableCell>
          </DataTableRow>
        </DataTableBody>
      </DataTable>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("region", { name: "What the survivor would be left with" }),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelector("caption")).toBeNull();
  },
};

/**
 * Wide enough to scroll, which is what the 320 Rule turns most real tables into.
 * The wrapper scrolls; the page never does. Tab to the region and the arrow keys
 * move it — that is the whole reason it is focusable, and it is why the
 * container needs a name as well as a tab stop.
 */
export const WideAndScrolling: Story = {
  args: { caption: "All positions, sorted by current value" },
  render: (args) => (
    <div style={{ maxInlineSize: "26rem" }}>
      <DataTable {...args}>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>Security</DataTableColumnHeader>
            <DataTableColumnHeader>Account</DataTableColumnHeader>
            <DataTableColumnHeader>Asset class</DataTableColumnHeader>
            <DataTableColumnHeader numeric>Shares</DataTableColumnHeader>
            <DataTableColumnHeader numeric>Value</DataTableColumnHeader>
            <DataTableColumnHeader numeric>Share of total</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {[
            ["VTSAX", "Vanguard taxable", "US equity", "1,842.114", "$204,318", "12.4%"],
            ["VTIAX", "Vanguard IRA", "International", "3,010.552", "$102,760", "6.2%"],
            ["VBTLX", "Fidelity 401(k)", "Bonds", "9,441.008", "$91,204", "5.5%"],
          ].map(([security, account, assetClass, shares, value, share]) => (
            <DataTableRow key={security}>
              <DataTableRowHeader>{security}</DataTableRowHeader>
              <DataTableCell>{account}</DataTableCell>
              <DataTableCell>{assetClass}</DataTableCell>
              <DataTableCell numeric>{shares}</DataTableCell>
              <DataTableCell numeric>{value}</DataTableCell>
              <DataTableCell numeric>{share}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  ),
};

/**
 * There is no empty-state prop, because both repos that have an empty state put
 * it beside the table rather than inside one — and where a table would have no
 * rows at all, `retirement-dashboard` renders nothing and drops the panel.
 *
 * `EmptyState` is already a component. Reach for it directly when the table
 * would be empty; put it in a spanning cell only when the table's own columns
 * are the context the reader needs.
 */
export const Empty: Story = {
  args: { caption: "Securities held in more than one account" },
  render: (args) => (
    <DataTable {...args}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Security</DataTableColumnHeader>
          <DataTableColumnHeader>Accounts</DataTableColumnHeader>
          <DataTableColumnHeader numeric>Value</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableCell colSpan={3}>
            <EmptyState
              level={3}
              title="No security is held twice"
              description="Every position sits in exactly one account, so there is nothing to consolidate."
            />
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  ),
};
