import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button.js";
import { Icon } from "../icons.js";
import { cx } from "../utils.js";

/** Status tone. Also selects the ARIA live role — see {@link BannerProps.tone}. */
export type BannerTone = "info" | "success" | "warning" | "danger";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Accessible name for the dismiss control. Only rendered when `onDismiss` is set.
   *
   * @default "Dismiss message"
   */
  dismissLabel?: string;
  /**
   * Called when the dismiss control is activated. Banner is uncontrolled about
   * its own visibility: supplying this renders the ✕, and removing the banner
   * from the tree is the caller's job.
   */
  onDismiss?: () => void;
  /**
   * Explicit ARIA role, overriding the tone-derived default. Use this when the
   * banner is rendered before the event it describes, so no live announcement
   * should fire.
   */
  role?: string;
  /** Bold first line. State the consequence here; put the next step in `children`. */
  title?: ReactNode;
  /**
   * Sets surface, border, and text together, and selects the live-region role:
   * `warning` and `danger` announce immediately as `role="alert"`, `info` and
   * `success` announce politely as `role="status"`. Pass `role` to override.
   * Color never carries the meaning alone — keep the words.
   *
   * @default "info"
   */
  tone?: BannerTone;
}

export function Banner({
  children,
  className,
  dismissLabel = "Dismiss message",
  onDismiss,
  role,
  title,
  tone = "info",
  ...props
}: BannerProps) {
  return (
    <div
      {...props}
      className={cx("kc-banner", className)}
      data-tone={tone}
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
    >
      <div className="kc-banner__content">
        {title ? <strong className="kc-banner__title">{title}</strong> : null}
        <div className="kc-banner__body">{children}</div>
      </div>
      {onDismiss ? (
        <Button
          aria-label={dismissLabel}
          className="kc-banner__dismiss"
          onPress={onDismiss}
          size="small"
          variant="quiet"
        >
          <Icon name="x" />
        </Button>
      ) : null}
    </div>
  );
}
