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
  className?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  inputProps?: Omit<InputProps, "className"> & { className?: string };
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

  return (
    <TextField {...props} className={cx("kc-field", className)}>
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
