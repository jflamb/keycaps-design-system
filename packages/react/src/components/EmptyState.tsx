import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What to do about it. One action, occasionally two. */
  actions?: ReactNode;
  /** Why it is empty and what would fill it. Muted, one or two sentences. */
  description?: ReactNode;
  /** A glyph above the heading. Decorative — the words carry the meaning. */
  icon?: ReactNode;
  /**
   * Heading level. Match the surrounding outline; an empty state inside a card
   * whose title is an `h2` takes 3.
   *
   * @default 3
   */
  level?: 2 | 3 | 4 | 5;
  /** What is absent. State it plainly: "No approvals waiting", not "Nothing here". */
  title: ReactNode;
}

/**
 * The panel that says nothing is here yet.
 *
 * Four of the five consumers have one — `.empty-state`, `.legacy-gift-empty`,
 * `.now-fallback`, `.browse-workspace__empty`, `.chat-empty`, `.empty-copy` —
 * which is six implementations across four repos.
 *
 * It is a recess, not a raised object: it takes the page ground rather than the
 * plate, inside a `divider` border at the plate radius. A card is a thing on the
 * plate and reads as content; an empty state is the absence of content, and a
 * well reads as the shape that content would fill. Nothing is dissolved into
 * the page — the border and the radius still make it an object, which is the
 * anti-reference this system is built against.
 */
export function EmptyState({
  actions,
  className,
  description,
  icon,
  level = 3,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={cx("kc-empty-state", className)}>
      {icon ? (
        <span className="kc-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {createElement(
        `h${level}`,
        { className: "kc-empty-state__title" },
        title,
      )}
      {description ? (
        <p className="kc-empty-state__description">{description}</p>
      ) : null}
      {actions ? <div className="kc-empty-state__actions">{actions}</div> : null}
    </div>
  );
}
