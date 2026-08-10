import type { AnchorHTMLAttributes } from "react";
import { cx } from "../utils.js";

export interface SkipLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /**
   * The `id` of the element the link jumps to, without the `#`. It must exist,
   * and it should be the element wrapping the page's main content.
   *
   * @default "kc-main"
   */
  targetId?: string;
}

/**
 * The first focusable thing in the document, and the only Keycaps component
 * whose styling lives in the tokens package rather than in `styles.css`.
 *
 * That placement is not an accident. `.kc-skip-link` is defined in `base.css`
 * because a skip link has to work in *any* consumer, including a page that
 * loads no component stylesheet at all, and because it is the one control whose
 * entire behavior is a `:focus` rule — the data-attribute discipline that keeps
 * the rest of `styles.css` inert cannot express "visible only while focused."
 * A skip link that needed React to appear would be useless in exactly the
 * situations it exists for.
 *
 * The consequence worth knowing: this component needs no entry in `static.css`.
 * It already works in every delivery mode.
 *
 * Three of the five consumer repos hand-roll a `.skip-link`; two have none at
 * all. `AppShell` renders one by default so the two that have none get it
 * without anyone having to remember.
 */
export function SkipLink({
  children = "Skip to main content",
  className,
  targetId = "kc-main",
  ...props
}: SkipLinkProps) {
  return (
    <a {...props} className={cx("kc-skip-link", className)} href={`#${targetId}`}>
      {children}
    </a>
  );
}
