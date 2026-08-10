import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils.js";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Controls sitting opposite the title. Wraps below it under about 34rem. */
  actions?: ReactNode;
  /** Metadata under the description — badges, a timestamp, a breadcrumb trail. */
  children?: ReactNode;
  /** Separates the header from the content below it with a divider rule. */
  divided?: boolean;
  /** A short label above the title. Set in the Micro role. Not a heading. */
  eyebrow?: ReactNode;
  /**
   * Heading level. A page has one `h1`; a header opening a section inside a page
   * takes the level that keeps the outline intact.
   *
   * @default 1
   */
  level?: 1 | 2 | 3;
  /** The heading text. */
  title: ReactNode;
  /** One or two sentences under the title. Muted. */
  description?: ReactNode;
}

/**
 * The band at the top of a page: what this is, what it is for, and what you can
 * do to it.
 *
 * All five consumer repos have one and no two agree — `.page-header`, `.hero`,
 * `.knowledge-header`, a bare `h1`.
 *
 * The heading's own margins are zeroed here and the header owns the rhythm
 * instead. That is not a violation of the Heading Rhythm Rule but its
 * consequence: the rule says more space above than below, and a heading that is
 * the first thing in its container has nothing above it to separate from —
 * which `base.css` already encodes with `:first-child`. What the header adds is
 * the space *below itself*, which belongs to the header as a block rather than
 * to the heading as a line.
 */
export function PageHeader({
  actions,
  children,
  className,
  description,
  divided,
  eyebrow,
  level = 1,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header
      {...props}
      className={cx("kc-page-header", className)}
      {...(divided ? { "data-divided": true } : null)}
    >
      <div className="kc-page-header__lead">
        {eyebrow ? <p className="kc-page-header__eyebrow">{eyebrow}</p> : null}
        {createElement(
          `h${level}`,
          { className: "kc-page-header__title" },
          title,
        )}
        {description ? (
          <p className="kc-page-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="kc-page-header__actions">{actions}</div> : null}
      {children ? <div className="kc-page-header__meta">{children}</div> : null}
    </header>
  );
}
