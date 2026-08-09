import {
  Button as AriaButton,
  Link as AriaLink,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
} from "react-aria-components";
import { cx } from "../utils";

/**
 * Emphasis level.
 *
 * - `primary` is the committing action and wears the coral key face.
 * - `secondary` is the alternative: a raised plate key.
 * - `quiet` is low emphasis: no surface, no borders, still a key.
 * - `danger` destroys something. It is an outlined key in the danger tone
 *   rather than a filled one, because a filled danger key and a filled coral
 *   key differ only in one color channel and would be indistinguishable side by
 *   side. See `--kc-color-key-face-danger` in the tokens package.
 * - `link` is not a key at all — an inline run of text inside a sentence. It has
 *   no control height, no wall, and does not travel.
 */
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "link";

/** Control height. `small` is the one documented exception to the 44×44 minimum target. */
export type ButtonSize = "small" | "medium";

interface ButtonOwnProps {
  /** Extra class names appended to `kc-button`. Keycaps never removes its own class. */
  className?: string;
  /**
   * Emphasis level. Choose `primary` once per decision area for the action that
   * commits, `secondary` for the alternative, `quiet` for low-emphasis actions,
   * `danger` for one that destroys, and `link` for an action that reads as a
   * word inside a sentence. Coral marks a kind of action, not a rank.
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

/**
 * The accessible-name contract for an icon-only button, enforced by the type
 * rather than documented and hoped for.
 *
 * A button whose only child is a glyph has no accessible name at all — the SVG
 * is `aria-hidden` and there is nothing else to compute one from. The inventory
 * found this pattern in four of five consumer repos (`.icon-button`,
 * `.icon-control`, `.star-control`, `.drawer-trigger-icon`), which is four
 * chances to ship a nameless control. Setting `iconOnly` therefore requires one
 * of the two attributes that can supply a name, and omitting both is a type
 * error at the call site rather than an axe violation in someone's product.
 */
type IconOnlyContract =
  | { iconOnly: true; "aria-label": string; "aria-labelledby"?: string }
  | { iconOnly: true; "aria-label"?: string; "aria-labelledby": string }
  | { iconOnly?: false };

export type ButtonProps = Omit<AriaButtonProps, "className"> &
  ButtonOwnProps &
  IconOnlyContract;

/**
 * The shared bit of both a Button and a LinkButton: a `.kc-button` carrying its
 * variant, size, and icon-only shape as data attributes. Split out so the two
 * cannot drift — the whole point of this package is that there is one key.
 */
function keyAttributes({
  className,
  variant = "primary",
  size = "medium",
  iconOnly,
}: ButtonOwnProps & { iconOnly?: boolean }) {
  return {
    className: cx("kc-button", className),
    "data-size": size,
    "data-variant": variant,
    ...(iconOnly ? { "data-icon-only": true } : null),
  };
}

export function Button({
  className,
  variant = "primary",
  size = "medium",
  ...props
}: ButtonProps) {
  const { iconOnly, ...rest } = props as { iconOnly?: boolean } & AriaButtonProps;
  return (
    <AriaButton {...rest} {...keyAttributes({ className, variant, size, iconOnly })} />
  );
}

export type LinkButtonProps = Omit<AriaLinkProps, "className"> &
  ButtonOwnProps &
  IconOnlyContract;

/**
 * A destination that wears the key.
 *
 * `Button` renders a `<button>` and always will — React Aria's Button is built
 * on `usePress`, and a `<button>` is what an action is. But a marketing page's
 * call to action is a *link*, and under ADR 0002's Mode 1 that page ships no
 * client React at all: a statically rendered `<button>` there is a control that
 * cannot do anything. Both static-render consumers lead with a CTA row of
 * anchors, so without this the static path has no working call to action.
 *
 * It is React Aria's `Link` underneath, so it carries the same
 * `data-hovered`/`data-pressed`/`data-focus-visible` states the Button does and
 * `styles.css` needs no second set of selectors for it.
 *
 * Choose by what happens, not by how it should look: navigating is a link,
 * doing is a button. `variant="link"` on a `Button` is the mirror case — an
 * action that reads as a word in a sentence.
 */
export function LinkButton({
  className,
  variant = "primary",
  size = "medium",
  ...props
}: LinkButtonProps) {
  const { iconOnly, ...rest } = props as { iconOnly?: boolean } & AriaLinkProps;
  return (
    <AriaLink {...rest} {...keyAttributes({ className, variant, size, iconOnly })} />
  );
}
