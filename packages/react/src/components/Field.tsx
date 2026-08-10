import type { ReactNode } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
  TextField,
  type InputProps,
  type TextAreaProps,
  type TextFieldProps,
} from "react-aria-components";
import { cx } from "../utils.js";

export interface FieldProps extends Omit<TextFieldProps, "children" | "className"> {
  /** Extra class names appended to `kc-field`. */
  className?: string;
  /**
   * Guidance rendered between the label and the input. Put format, privacy, or
   * consequence information here — before the input, where it can still change
   * what the reader types.
   */
  description?: ReactNode;
  /**
   * The validation message. Supplying one marks the field invalid unless
   * `isInvalid` is set explicitly. Write it as a specific problem plus a
   * recovery step. The element collapses when empty rather than reserving space.
   */
  errorMessage?: ReactNode;
  /**
   * Props forwarded to the underlying `input`, including `type`, `placeholder`,
   * `autoComplete`, and `inputMode`. `value` and `onChange` belong on the Field
   * itself, not here. Ignored when the field is multiline.
   */
  inputProps?: Omit<InputProps, "className"> & { className?: string };
  /** The visible label. Required — Keycaps has no placeholder-only field. */
  label: ReactNode;
  /**
   * Renders a `textarea` instead of an `input`. Defaults to true when
   * `textareaProps` is supplied, which mirrors how `isInvalid` is derived from
   * `errorMessage` below: the caller states the thing they mean and the flag
   * follows.
   *
   * The control grows from a four-line floor and stays resizable in the block
   * direction only — a composer that can be dragged wider than the field it
   * lives in breaks the Intrinsic Maximum Rule from the inside.
   */
  multiline?: boolean;
  /** Props forwarded to the underlying `textarea`, including `rows`. */
  textareaProps?: Omit<TextAreaProps, "className"> & { className?: string };
}

export function Field({
  className,
  description,
  errorMessage,
  inputProps,
  label,
  multiline,
  textareaProps,
  ...props
}: FieldProps) {
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};
  const { className: textareaClassName, ...restTextareaProps } = textareaProps ?? {};
  const isMultiline = multiline ?? textareaProps != null;

  // Deriving `true` from `errorMessage` keeps a supplied message from being
  // silently dropped. Staying `undefined` otherwise is deliberate: an explicit
  // `isInvalid={false}` is a controlled valid state that suppresses React Aria's
  // native constraint validation (`isRequired`, `type`, `pattern`, server errors).
  const isInvalid = props.isInvalid ?? (errorMessage != null || undefined);

  return (
    <TextField
      {...props}
      className={cx("kc-field", className)}
      isInvalid={isInvalid}
    >
      <Label className="kc-field__label">{label}</Label>
      {description ? (
        <Text slot="description" className="kc-field__description">
          {description}
        </Text>
      ) : null}
      {isMultiline ? (
        <TextArea
          {...restTextareaProps}
          className={cx("kc-field__input", textareaClassName)}
          data-multiline={true}
        />
      ) : (
        <Input
          {...restInputProps}
          className={cx("kc-field__input", inputClassName)}
        />
      )}
      <FieldError className="kc-field__error">{errorMessage}</FieldError>
    </TextField>
  );
}
