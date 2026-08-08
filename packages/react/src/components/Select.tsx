import type { ReactNode } from "react";
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectValue,
  Text,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import { ChevronDownIcon } from "../icons";
import { cx } from "../utils";

export interface SelectOption {
  description?: string;
  id: string | number;
  isDisabled?: boolean;
  label: string;
}

export interface SelectProps
  extends Omit<AriaSelectProps<SelectOption>, "children" | "className"> {
  className?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  label: ReactNode;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  className,
  description,
  errorMessage,
  label,
  options,
  placeholder = "Select an option",
  ...props
}: SelectProps) {
  return (
    <AriaSelect<SelectOption>
      {...props}
      className={cx("kc-select", className)}
      placeholder={placeholder}
    >
      <Label className="kc-field__label">{label}</Label>
      {description ? (
        <Text slot="description" className="kc-field__description">
          {description}
        </Text>
      ) : null}
      <AriaButton className="kc-select__trigger">
        <SelectValue className="kc-select__value" />
        <ChevronDownIcon className="kc-select__chevron" />
      </AriaButton>
      <FieldError className="kc-field__error">{errorMessage}</FieldError>
      <AriaPopover className="kc-select__popover">
        <ListBox<SelectOption> className="kc-select__listbox" items={options}>
          {(item) => (
            <ListBoxItem
              className="kc-select__option"
              id={item.id}
              textValue={item.label}
              isDisabled={item.isDisabled}
            >
              <Text slot="label">{item.label}</Text>
              {item.description ? (
                <Text slot="description">{item.description}</Text>
              ) : null}
            </ListBoxItem>
          )}
        </ListBox>
      </AriaPopover>
    </AriaSelect>
  );
}
