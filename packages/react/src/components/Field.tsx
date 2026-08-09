import type { ReactNode } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
  type InputProps,
  type TextFieldProps,
} from "react-aria-components";
import { cx } from "../utils";

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
   * itself, not here.
   */
  inputProps?: Omit<InputProps, "className"> & { className?: string };
  /** The visible label. Required — Keycaps has no placeholder-only field. */
  label: ReactNode;
}

export function Field({
  className,
  description,
  errorMessage,
  inputProps,
  label,
  ...props
}: FieldProps) {
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};

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
      <Input
        {...restInputProps}
        className={cx("kc-field__input", inputClassName)}
      />
      <FieldError className="kc-field__error">{errorMessage}</FieldError>
    </TextField>
  );
}
