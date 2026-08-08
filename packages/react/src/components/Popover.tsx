import type { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  type DialogTriggerProps,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { cx } from "../utils";

export interface PopoverProps
  extends Omit<AriaPopoverProps, "children" | "className"> {
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export function PopoverTrigger(props: DialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

export function Popover({
  "aria-label": ariaLabel,
  className,
  children,
  ...props
}: PopoverProps) {
  return (
    <AriaPopover {...props} className={cx("kc-popover", className)}>
      <Dialog aria-label={ariaLabel} className="kc-popover__dialog">
        {children}
      </Dialog>
    </AriaPopover>
  );
}
