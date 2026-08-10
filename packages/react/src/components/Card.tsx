import {
  createElement,
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";
import { cx } from "../utils.js";

/** The element a Card renders. Choose by document semantics, not by appearance. */
export type CardElement = "article" | "section" | "div" | "a";

export interface CardProps
  extends HTMLAttributes<HTMLElement>,
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "rel" | "target" | "download"> {
  /**
   * The rendered element. `article` for self-contained content, `section` for a
   * named part of a larger whole (give it `aria-labelledby`), `div` when the
   * grouping is purely visual and carries no outline meaning, `a` when the whole
   * card navigates and its content is short enough to be one link name.
   *
   * @default "article"
   */
  as?: CardElement;
  /**
   * Marks the card as the target of a `CardLink` inside it. Sets the hover and
   * focus treatment on the card while the link keeps the accessible name.
   *
   * Set this only for the `CardLink` pattern; `as="a"` implies it.
   */
  isLinked?: boolean;
}

/**
 * Two ways to make a card navigate, and they are not interchangeable.
 *
 * `as="a"` puts the whole card in one anchor. The accessible name is everything
 * inside it, which is right for a short row — `retirement-dashboard`'s
 * `.hub-card-link`, `knowledge`'s `.home-update` — and wrong for a card with a
 * title, a description, and a metadata line, where a screen reader announces the
 * whole paragraph as the link text.
 *
 * `CardLink` inside a card with `isLinked` is the other shape: the anchor wraps
 * only the title, so the name is the title, and a covering pseudo-element makes
 * the rest of the card clickable. The cost is real and worth stating — the
 * overlay sits above the card's text, so body copy inside a linked card cannot
 * be selected. A card whose content the reader needs to copy should use an
 * ordinary link and no overlay.
 *
 * Both are React Aria's `Link`, so the hover, press, and focus states arrive as
 * data attributes and `styles.css` stays free of real interactive selectors.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as = "article", className, isLinked, ...props },
  ref,
) {
  const linked = isLinked || as === "a";
  const shared = {
    ...props,
    className: cx("kc-card", className),
    ...(linked ? { "data-linked": true } : null),
  };

  if (as === "a") {
    return <AriaLink {...(shared as AriaLinkProps)} ref={ref as Ref<HTMLAnchorElement>} />;
  }

  return createElement(as, { ...shared, ref });
});

export interface CardLinkProps extends Omit<AriaLinkProps, "className"> {
  className?: string;
}

/**
 * The link inside a linked card. Put it around the title; the card it sits in
 * needs `isLinked`.
 */
export function CardLink({ className, ...props }: CardLinkProps) {
  return <AriaLink {...props} className={cx("kc-card__link", className)} />;
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("kc-card__header", props.className)} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level rendered, `h2` through `h4`. Set it to whatever preserves
   * the surrounding page outline — the card's visual weight is fixed and does
   * not change with the level.
   *
   * @default 2
   */
  level?: 2 | 3 | 4;
}

export function CardTitle({ level = 2, className, ...props }: CardTitleProps) {
  return createElement(`h${level}`, {
    ...props,
    className: cx("kc-card__title", className),
  });
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx("kc-card__description", className)} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("kc-card__body", className)} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("kc-card__footer", className)} />;
}

export type CardContent = ReactNode;
