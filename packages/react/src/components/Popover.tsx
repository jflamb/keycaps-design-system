import type { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  type DialogTriggerProps,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { useOverlayPortalContainer } from "../overlay-portal.js";
import { cx } from "../utils.js";

export interface PopoverProps
  extends Omit<AriaPopoverProps, "children" | "className"> {
  /** Extra class names appended to `kc-popover`. */
  className?: string;
  /** The popover body. Keep it brief — this is context, not a place for a task. */
  children: ReactNode;
  /**
   * Accessible name for the dialog. Supply one whenever the trigger's own label
   * does not describe the content, since the popover is announced separately.
   */
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
  /*
   * Inside a `Dialog` this is the `<dialog>` element, and portalling there is
   * what keeps the popover out of the inert half of the document and above the
   * scrim. Everywhere else it is `undefined` and React Aria's own default
   * stands. See `overlay-portal.ts`.
   */
  const portalContainer = useOverlayPortalContainer();

  return (
    <AriaPopover
      UNSTABLE_portalContainer={portalContainer}
      {...props}
      className={cx("kc-popover", className)}
    >
      <Dialog aria-label={ariaLabel} className="kc-popover__dialog">
        {children}
      </Dialog>
    </AriaPopover>
  );
}
