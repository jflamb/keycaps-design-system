import {
  useId,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cx } from "../utils.js";

/**
 * The accessible-name contract for the scroll region, enforced by the type.
 *
 * The wrapper is a focusable `role="region"`, because a region that scrolls and
 * cannot be reached from the keyboard is a 2.1.1 failure — the Prose Markup
 * Rule. Making it focusable without also naming it trades that violation for a
 * 4.1.2 one, so the name is not optional.
 *
 * A `caption` satisfies the contract on its own: it names the table natively and
 * the region points at it, which is strictly better than the arrangement
 * `retirement-dashboard` has today, where the caption text is passed a second
 * time as the wrapper's `aria-label` and the two are free to drift. Without a
 * caption the caller supplies `aria-label` or `aria-labelledby` — the seven
 * `retirement-dashboard` tables whose panel heading already says what they are.
 * Omitting all three is a type error at the call site rather than an axe
 * violation in someone's product, the same construction `Button` uses for its
 * icon-only name.
 */
type TableNameContract =
  | { caption: ReactNode; "aria-label"?: string; "aria-labelledby"?: string }
  | { caption?: never; "aria-label": string; "aria-labelledby"?: string }
  | { caption?: never; "aria-label"?: string; "aria-labelledby": string };

interface DataTableOwnProps {
  /**
   * Shades alternating rows.
   *
   * Opt-in, and deliberately: the row rules already separate the rows, so on a
   * table short enough to scan a second separator is noise on top of the first.
   * It exists because `prose.css` already offers it as `data-zebra`, and the
   * component and the article table are meant to be one object rather than two
   * that mostly agree.
   */
  zebra?: boolean;
}

export type DataTableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby"
> &
  DataTableOwnProps &
  TableNameContract;

/**
 * A table of data, inside the scroll container it needs to survive 320px.
 *
 * `retirement-dashboard` renders 17 of them behind eight class names, four of
 * which are near-verbatim copies of each other — `.conversion-table` is
 * `.now-table` with three declarations dropped, and one of the three is the
 * `text-align: left` that keeps its Year column from inheriting a global
 * `td { text-align: right }`. That is a live rendering bug produced entirely by
 * copying a class. This repo's own Storybook holds eleven more tables,
 * hand-authored against a `.kc-table` the package did not ship.
 *
 * **It is deliberately the same table `prose.css` styles**, down to the values:
 * the raised header band with its weighted rule, the divider between rows, the
 * `data-zebra` opt-in, tabular figures on numeric columns. A table of numbers in
 * a dashboard and a table of numbers in an article are the same object, and a
 * reader should not have to notice which page they are on. A unit test asserts
 * the two treatments still agree rather than leaving it to review.
 *
 * **What the component adds is the half CSS cannot do.** A stylesheet cannot put
 * `tabindex="0"` on a scroll container, cannot give it a role or a name, and
 * cannot put `scope` on a header cell. Those three decide whether a data table
 * is usable by a keyboard and a screen reader, and all three arrive here by
 * construction — `scope` is not a prop, and the region's name is a type error to
 * omit.
 *
 * **It has no interactive state, and that is a decision rather than an
 * omission.** Rows do not light up under the pointer. The survey found no hover
 * treatment on a real table in any consumer, a highlight on a row that does
 * nothing is a false affordance, and expressing a genuine hover state would mean
 * routing rows through React Aria's collection components, which need a client
 * runtime. A table is the most obviously static thing in the system, so the
 * trade is a hover for Mode 1 eligibility and Mode 1 wins. `styles.css`
 * therefore gains no pseudo-class here and `static.css` gains no entry; the
 * focus ring on the scroll container comes from `base.css`, which every delivery
 * mode loads.
 *
 * Sorting, selection, pagination, filtering, density, and sticky headers are all
 * out of scope, each because the survey found nothing to migrate. See the story
 * for the counts.
 */
export function DataTable({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  caption,
  children,
  className,
  zebra,
  ...props
}: DataTableProps) {
  const captionId = useId();
  const namedByCaption = caption != null && !ariaLabel && !ariaLabelledBy;

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={namedByCaption ? captionId : ariaLabelledBy}
      className={cx("kc-table-scroll", className)}
      role="region"
      // Always focusable, even when the table happens to fit.
      //
      // `retirement-dashboard` adds the attribute at runtime and only while the
      // container actually overflows, which is a better tab order and a worse
      // floor: it needs a client runtime, so on a Mode 1 page the region would
      // scroll and no keyboard could reach it. An accessibility floor that
      // depends on which delivery mode a page happened to use is not a floor —
      // the same reasoning that keeps the focus ring in `base.css`. `CodeBlock`
      // already made this call for its `pre`.
      tabIndex={0}
    >
      <table
        // The caption names the table natively. Without one the region's name is
        // repeated here, so the table still announces itself to a reader who
        // jumps straight to it with a table shortcut instead of tabbing in.
        aria-label={caption == null ? ariaLabel : undefined}
        aria-labelledby={caption == null ? ariaLabelledBy : undefined}
        className="kc-table"
        {...(zebra ? { "data-zebra": true } : null)}
      >
        {caption != null ? <caption id={captionId}>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

/*
 * The section, row, and cell parts carry no class of their own — `styles.css`
 * reaches them by tag inside `.kc-table`, exactly as `prose.css` reaches an
 * article's table, so the two stylesheets stay comparable line for line.
 *
 * They exist anyway, for two reasons. A table written with this component is one
 * vocabulary rather than shipped cells dropped into bare `<thead>` elements. And
 * the two header cells supply the `scope` a caller would otherwise be free to
 * forget — which the survey found already happening, in `.conversion-table` and
 * in `knowledge`'s markdown tables, where no header cell carries one.
 */

/** The header row group. */
export function DataTableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

/** The data row group. */
export function DataTableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

/**
 * The totals row group.
 *
 * `tfoot` rather than a last row in the body, because a total is not another
 * datum — it summarizes the ones above it, and the element is the only thing
 * that says so. No consumer uses `tfoot` today; the two totals rows in the set
 * are `tbody` rows wearing a `.total` class, which is a row of data claiming to
 * be a summary. `prose.css` already styles `tfoot`, so this is the treatment
 * arriving where it was already defined rather than a new one.
 */
export function DataTableFoot(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />;
}

/** One row. */
export function DataTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

interface NumericProp {
  /**
   * Aligns to the end edge with tabular figures, and stops the value breaking
   * across lines.
   *
   * Set it on the header cell as well as the body cells, or the column's label
   * hangs off the opposite edge from its own numbers.
   *
   * Per-cell rather than per-column because CSS offers no per-column hook:
   * `text-align` does not inherit through a `<col>`, and the `:nth-child()`
   * alternative breaks the first time a cell spans two columns.
   * `retirement-dashboard`'s dominant convention is already exactly this — a
   * `.num` class on both the `th` and the `td` — and it is the one of its three
   * contradictory alignment models that survives contact with a shared
   * component. The other two invert the default and opt the label column back
   * out, which cannot work in a stylesheet that does not know which column is
   * the label.
   */
  numeric?: boolean;
}

export type DataTableColumnHeaderProps = ThHTMLAttributes<HTMLTableCellElement> & NumericProp;

/** A column heading. Carries `scope="col"` by construction. */
export function DataTableColumnHeader({ numeric, ...props }: DataTableColumnHeaderProps) {
  return <th scope="col" {...props} {...(numeric ? { "data-numeric": true } : null)} />;
}

export type DataTableRowHeaderProps = ThHTMLAttributes<HTMLTableCellElement> & NumericProp;

/**
 * The cell that names its row. Carries `scope="row"` by construction.
 *
 * Worth reaching for on the first column of anything read across rather than
 * down: it is what makes a screen reader announce "Piazzolla, payload, 51 KB"
 * rather than "51 KB".
 */
export function DataTableRowHeader({ numeric, ...props }: DataTableRowHeaderProps) {
  return <th scope="row" {...props} {...(numeric ? { "data-numeric": true } : null)} />;
}

export type DataTableCellProps = TdHTMLAttributes<HTMLTableCellElement> & NumericProp;

/** A data cell. */
export function DataTableCell({ numeric, ...props }: DataTableCellProps) {
  return <td {...props} {...(numeric ? { "data-numeric": true } : null)} />;
}
