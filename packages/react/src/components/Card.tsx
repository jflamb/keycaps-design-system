import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils";

/** The element a Card renders. Choose by document semantics, not by appearance. */
export type CardElement = "article" | "section" | "div";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /**
   * The rendered element. `article` for self-contained content, `section` for a
   * named part of a larger whole (give it `aria-labelledby`), `div` when the
   * grouping is purely visual and carries no outline meaning.
   *
   * @default "article"
   */
  as?: CardElement;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as = "article", className, ...props },
  ref,
) {
  return createElement(as, {
    ...props,
    className: cx("kc-card", className),
    ref,
  });
});

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
