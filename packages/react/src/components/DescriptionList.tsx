import type { HTMLAttributes } from "react";
import { cx } from "../utils";

/**
 * How a term and its value sit relative to each other.
 *
 * - `rows` (default): term at the inline start, value beside it. This is the
 *   detail-panel shape — `assistant-workbench`'s `.detail-list`,
 *   `mcp-unifi`'s `.diagnostic-row`. It stacks below 30rem on its own.
 * - `stacked`: term above value, always. For narrow columns and for cards.
 * - `grid`: stacked pairs flowing into as many columns as fit. The metadata and
 *   stat-strip shape — `knowledge`'s `.metadata-list`, `mcp-dnsimple`'s `.stat`.
 */
export type DescriptionListLayout = "rows" | "stacked" | "grid";

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /**
   * Draws a divider between items. Right for a ledger of many rows the reader
   * scans down; wrong for three pairs inside a card, where the rule is louder
   * than the content.
   */
  divided?: boolean;
  /** @default "rows" */
  layout?: DescriptionListLayout;
}

/**
 * A label-and-value list.
 *
 * Fifteen `<dl>` elements across all five consumer repos — the single most
 * repeated pattern in the set, and five separate implementations of it.
 *
 * Each pair is wrapped in a `DescriptionListItem`. HTML allows exactly that
 * (`dl` may contain `div` elements each holding its own `dt`/`dd` group), and it
 * is what makes all three layouts one stylesheet instead of three: the pair is a
 * box that can be laid out, rather than two siblings that have to be placed by
 * index.
 */
export function DescriptionList({
  className,
  divided,
  layout = "rows",
  ...props
}: DescriptionListProps) {
  return (
    <dl
      {...props}
      className={cx("kc-dl", className)}
      data-layout={layout}
      {...(divided ? { "data-divided": true } : null)}
    />
  );
}

/** One term-and-value pair. Wraps a `DescriptionTerm` and its `DescriptionDetails`. */
export function DescriptionListItem({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("kc-dl__item", className)} />;
}

/** The label. Set in the Label role, muted, because the value is the content. */
export function DescriptionTerm({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <dt {...props} className={cx("kc-dl__term", className)} />;
}

export interface DescriptionDetailsProps extends HTMLAttributes<HTMLElement> {
  /**
   * Aligns to the end edge with tabular figures. Use it when the column is
   * numbers being compared by digit position — the same reasoning as
   * `prose.css`'s `.kc-prose__numeric`.
   */
  numeric?: boolean;
}

/** The value. */
export function DescriptionDetails({
  className,
  numeric,
  ...props
}: DescriptionDetailsProps) {
  return (
    <dd
      {...props}
      className={cx("kc-dl__details", className)}
      {...(numeric ? { "data-numeric": true } : null)}
    />
  );
}
