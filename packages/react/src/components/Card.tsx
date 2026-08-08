import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils";

export type CardElement = "article" | "section" | "div";

export interface CardProps extends HTMLAttributes<HTMLElement> {
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
