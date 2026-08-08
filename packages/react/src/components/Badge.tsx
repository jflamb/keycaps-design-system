import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={cx("kc-badge", className)} data-tone={tone} />;
}
