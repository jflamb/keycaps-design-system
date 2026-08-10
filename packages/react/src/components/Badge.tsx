import type { HTMLAttributes, ReactNode } from "react";
import { StatusIcon, type StatusTone } from "../icons.js";
import { cx } from "../utils.js";

/** Status tone. Badge is not a control, so the tone carries no role or behavior. */
export type BadgeTone = "neutral" | StatusTone;

/**
 * Corner treatment.
 *
 * `default` is the system's seated 6px badge. `pill` is the 999px radius that
 * `DESIGN.md` describes as available and unused — deliberately, because "a pill
 * reads as a floating token rather than a seated object."
 *
 * That reading is exactly why it is offered here rather than left out. Two of
 * the five consumers use a pill for a *live* status that changes underneath the
 * reader — `assistant-workbench`'s `.status-pill` and `retirement-dashboard`'s
 * `.now-chip` — beside seated badges that label something fixed. Floating is the
 * right connotation for the first and the wrong one for the second, so the
 * shape is carrying a real distinction rather than a preference. The seated
 * badge stays the default; reach for the pill only when the thing it labels is
 * genuinely in motion.
 */
export type BadgeShape = "default" | "pill";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The tone's own icon, or a glyph of your own.
   *
   * Pass `true` to render the shape that belongs to this tone — a circle for
   * info, a check for success, a triangle for warning, an octagon for danger.
   * That is the Tone Trio Rule's second carrier, and selecting it by tone rather
   * than accepting an arbitrary node is what keeps a warning from being able to
   * wear a check.
   *
   * `neutral` has no shape of its own, so `true` renders nothing there. Pass a
   * node to put a glyph on a neutral badge.
   */
  icon?: boolean | ReactNode;
  /**
   * Corner treatment. `pill` for a status that changes under the reader,
   * `default` for a label that does not.
   *
   * @default "default"
   */
  shape?: BadgeShape;
  /**
   * Sets surface, border, and text together. The words carry the meaning —
   * a badge whose tone is its only signal is a defect.
   *
   * @default "neutral"
   */
  tone?: BadgeTone;
}

export function Badge({
  children,
  className,
  icon,
  shape = "default",
  tone = "neutral",
  ...props
}: BadgeProps) {
  const glyph =
    icon === true
      ? tone === "neutral"
        ? null
        : <StatusIcon className="kc-badge__icon" tone={tone} />
      : icon === false
        ? null
        : icon;

  return (
    <span
      {...props}
      className={cx("kc-badge", className)}
      data-shape={shape}
      data-tone={tone}
    >
      {glyph}
      {children}
    </span>
  );
}
