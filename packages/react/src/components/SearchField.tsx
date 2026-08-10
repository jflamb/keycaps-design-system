import type { ReactNode } from "react";
import {
  Button as AriaButton,
  FieldError,
  Input,
  Label,
  SearchField as AriaSearchField,
  Text,
  type InputProps,
  type SearchFieldProps as AriaSearchFieldProps,
} from "react-aria-components";
import { Icon } from "../icons.js";
import { cx } from "../utils.js";

export interface SearchFieldProps
  extends Omit<AriaSearchFieldProps, "children" | "className"> {
  /** Extra class names appended to `kc-field kc-search-field`. */
  className?: string;
  /**
   * Accessible name for the clear control. It is rendered only when the field
   * has a value, so it never announces an action that would do nothing.
   *
   * @default "Clear search"
   */
  clearLabel?: string;
  /** Guidance rendered between the label and the control. */
  description?: ReactNode;
  /** The validation message. Collapses when empty rather than reserving space. */
  errorMessage?: ReactNode;
  /** Props forwarded to the underlying `input`. */
  inputProps?: Omit<InputProps, "className" | "type"> & { className?: string };
  /**
   * The visible label. Required. Pass `isLabelHidden` to render it to assistive
   * technology only — a search box in a header often has no room for a visible
   * label, and a placeholder is not a label.
   */
  label: ReactNode;
  /** Renders the label as `.kc-sr-only`. The label itself is still required. */
  isLabelHidden?: boolean;
}

/**
 * A search field, which is a Field with three things a Field does not have: the
 * `searchbox` role, Escape-to-clear, and a clear control.
 *
 * All three come from React Aria's `SearchField` rather than from this file.
 * `knowledge` hand-rolls the same shape as `.search-field` plus
 * `.search-field__clear`, and hand-rolled clear buttons are where the Escape
 * key quietly goes missing.
 *
 * The magnifier and the clear control are positioned over the input rather than
 * beside it in a wrapper. That is a deliberate structural choice: the border,
 * fill, and focus ring stay on the input itself, so the field reuses
 * `.kc-field__input`'s existing `[data-hovered]` and `[data-focus-visible]`
 * rules exactly. A wrapper would have needed its own state selectors, and the
 * only non-data-attribute way to write them is `:focus-within` — which would put
 * a live interactive selector into `styles.css` and weaken the guarantee that
 * hand-authored markup stays inert.
 *
 * The clear control is absent from the DOM while the field is empty rather than
 * present and hidden by CSS. Hiding it visually would leave a "Clear search"
 * button in the accessibility tree that does nothing when activated — an
 * announced control with no effect is worse than no control, and it is exactly
 * the kind of thing that survives a visual review.
 */
export function SearchField({
  className,
  clearLabel = "Clear search",
  description,
  errorMessage,
  inputProps,
  isLabelHidden,
  label,
  ...props
}: SearchFieldProps) {
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};
  const isInvalid = props.isInvalid ?? (errorMessage != null || undefined);

  return (
    <AriaSearchField
      {...props}
      className={cx("kc-field kc-search-field", className)}
      isInvalid={isInvalid}
    >
      {({ isEmpty }) => (
        <>
          <Label className={cx("kc-field__label", isLabelHidden && "kc-sr-only")}>
            {label}
          </Label>
          {description ? (
            <Text slot="description" className="kc-field__description">
              {description}
            </Text>
          ) : null}
          <div className="kc-search-field__control">
            <Icon className="kc-search-field__icon" name="magnifying-glass" />
            <Input
              {...restInputProps}
              className={cx("kc-field__input", inputClassName)}
            />
            {isEmpty ? null : (
              <AriaButton
                className="kc-button kc-search-field__clear"
                data-icon-only={true}
                data-size="small"
                data-variant="quiet"
                aria-label={clearLabel}
              >
                <Icon className="kc-search-field__clear-glyph" name="x" />
              </AriaButton>
            )}
          </div>
          <FieldError className="kc-field__error">{errorMessage}</FieldError>
        </>
      )}
    </AriaSearchField>
  );
}
