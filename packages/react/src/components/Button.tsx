import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cx } from "../utils";

/** Emphasis level. `primary` is the committing action and wears the coral key face. */
export type ButtonVariant = "primary" | "secondary" | "quiet";

/** Control height. `small` is the one documented exception to the 44×44 minimum target. */
export type ButtonSize = "small" | "medium";

export interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  /** Extra class names appended to `kc-button`. Keycaps never removes its own class. */
  className?: string;
  /**
   * Emphasis level. Choose `primary` once per decision area for the action that
   * commits, `secondary` for the alternative, and `quiet` for low-emphasis
   * actions. Coral marks a kind of action, not a rank.
   *
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Control height. `medium` is 44px, meeting the minimum target size.
   * `small` is 36px and is the system's only documented exception — reserve it
   * for controls inside another already-labelled surface, such as a banner
   * dismiss, where the hit area is enlarged by other means.
   *
   * @default "medium"
   */
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
