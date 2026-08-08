import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";
import { CloseIcon } from "../icons";
import { cx } from "../utils";

export type BannerTone = "info" | "success" | "warning" | "danger";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  dismissLabel?: string;
  onDismiss?: () => void;
  title?: ReactNode;
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
          <CloseIcon />
        </Button>
      ) : null}
    </div>
  );
}
