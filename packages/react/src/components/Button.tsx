import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cx } from "../utils";

export type ButtonVariant = "primary" | "secondary" | "quiet";
export type ButtonSize = "small" | "medium";

export interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "medium",
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx("kc-button", className)}
      data-size={size}
      data-variant={variant}
    />
  );
}
