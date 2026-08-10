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
import { ChevronDownIcon } from "../icons.js";
import { cx } from "../utils.js";

/** One entry in a Select. Options are data, not children — Keycaps owns the markup. */
export interface SelectOption {
  /** Secondary line under the label. Add one only when the label alone is ambiguous. */
  description?: string;
  /** Stable identity. This is the value reported by `onSelectionChange` and matched by `selectedKey`. */
  id: string | number;
  /** Renders the option unselectable while keeping it visible and announced. */
  isDisabled?: boolean;
  /** The visible option text, and the string used for typeahead. */
  label: string;
}

export interface SelectProps
  extends Omit<AriaSelectProps<SelectOption>, "children" | "className"> {
  /** Extra class names appended to `kc-select`. */
  className?: string;
  /** Guidance rendered between the label and the trigger. */
  description?: ReactNode;
  /**
   * The validation message, rendered below the trigger. Pair it with
   * `isInvalid` — unlike Field, Select does not infer invalidity from this prop.
   */
  errorMessage?: ReactNode;
  /** The visible label. Required. */
  label: ReactNode;
  /** The choices, in the order they should be read. */
  options: SelectOption[];
  /**
   * Trigger text before a choice is made. Keep it an instruction, not a value.
   *
   * @default "Select an option"
   */
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
