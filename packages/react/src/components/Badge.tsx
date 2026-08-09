import type { HTMLAttributes } from "react";
import { cx } from "../utils";

/** Status tone. Badge is not a control, so the tone carries no role or behavior. */
export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Sets surface, border, and text together. The words carry the meaning —
   * a badge whose tone is its only signal is a defect.
   *
   * @default "neutral"
   */
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={cx("kc-badge", className)} data-tone={tone} />;
}
