import type { SVGProps } from "react";
import { ICON_VIEW_BOX, iconData, type KeycapsIconName } from "./icons/icon-data.js";

export type { KeycapsIconName };

/**
 * Every glyph the package ships, in manifest order. Exported for stories and
 * tests rather than for callers — a caller naming an icon gets the union.
 */
export const iconNames = Object.keys(iconData) as KeycapsIconName[];

/**
 * The registry is closed, and that is a decision rather than an omission.
 *
 * The reference implementation this pattern comes from exposes a `register()`
 * so an application can add its own glyphs. Keycaps does not, because a
 * consumer registering its own vocabulary is the divergence the adoption
 * program exists to remove — it would move the seam rather than close it. A
 * glyph Keycaps lacks is one line in `scripts/icons/vendor-icons.mjs` and a
 * release, and Phase 2 wired the dependency updates that make that cheap.
 *
 * Two things follow from the set being closed. An unknown name is a compile
 * error rather than a render-time miss, because the union is generated from the
 * same data. And the geometry is checked when it is vendored rather than when
 * it is registered, so nothing ships a sanitizer or an XML parser to a browser.
 */
export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, "children" | "dangerouslySetInnerHTML"> {
  /** Which glyph to draw. Unknown names do not compile. */
  name: KeycapsIconName;
  /**
   * The accessible name. Omit it for decoration — an icon beside its own label
   * is decoration, and naming it twice is worse than not naming it at all.
   */
  label?: string;
}

/**
 * A vendored Phosphor glyph, drawn inline.
 *
 * `dangerouslySetInnerHTML` carries build-time data, not caller input: the
 * shapes come from `icon-data.ts`, which only `pnpm icons:vendor` writes, and
 * every one is checked against an element and attribute allowlist before it is
 * written. `pnpm icons:verify` fails the build if that file stops matching what
 * the manifest produces, so hand-edited geometry cannot reach a render either.
 *
 * The glyph paints with `currentColor` and takes its size from the box the
 * caller gives it, so it inherits ink from the component it sits in and needs
 * no stylesheet to become visible. That is what lets it survive statically
 * rendered markup and forced colors alike.
 */
export function Icon({ name, label, ...props }: IconProps) {
  return (
    <svg
      {...props}
      viewBox={ICON_VIEW_BOX}
      fill="currentColor"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      dangerouslySetInnerHTML={{ __html: iconData[name] }}
    />
  );
}

/** The four status tones that have an icon. `neutral` deliberately has none. */
export type StatusTone = "info" | "success" | "warning" | "danger";

/**
 * The Tone Trio Rule says a status expressed by color alone is a defect, and
 * that each tone needs a distinct icon *shape* — not the same shape in a
 * different color — so the distinction survives forced colors, monochrome
 * printing, and color vision deficiency.
 *
 * A circle carrying an i, a circle carrying a check, a triangle, an octagon.
 * These are the same four glyphs `prose.css` masks for its callouts, from the
 * same vendoring run, so a warning in an article and a warning on a `Badge` are
 * one shape by construction rather than by review.
 */
const statusShapes = {
  info: "info",
  success: "check-circle",
  warning: "warning",
  danger: "warning-octagon",
} satisfies Record<StatusTone, KeycapsIconName>;

export interface StatusIconProps extends Omit<IconProps, "name"> {
  /** Which shape to draw. Each tone is a different shape, never a recolor. */
  tone: StatusTone;
}

/**
 * The tone's own shape, selected by tone rather than chosen by the caller.
 * Passing the wrong glyph for a tone is the one way to break the Tone Trio Rule
 * while appearing to follow it, so the component does not offer the option.
 */
export function StatusIcon({ tone, ...props }: StatusIconProps) {
  return <Icon {...props} name={statusShapes[tone]} />;
}
