import type { ReactElement, SVGProps } from "react";

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m5.5 5.5 9 9m0-9-9 9" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.7 12.7 3.8 3.8" />
    </svg>
  );
}

/**
 * The status shapes, and the reason they exist.
 *
 * The Tone Trio Rule says a status expressed by color alone is a defect, and
 * that each tone needs a distinct icon *shape* — not the same shape in a
 * different color — so the distinction survives forced colors, monochrome
 * printing, and color vision deficiency. Until now that obligation had no
 * implementation on the component side: the package shipped two icons, neither
 * of them a status.
 *
 * These are the same four paths `prose.css` already masks for its callouts, at
 * the same 20×20 grid and the same stroke weights. A reader should not have to
 * learn that a warning in an article and a warning on a badge are the same
 * thing, so they are one glyph rather than two drawings of one idea.
 *
 * Stroke and fill are baked in rather than left to CSS. These are painted at
 * whatever size their container gives them, including inside statically
 * rendered markup with no component stylesheet in scope, and a status carrier
 * that depends on a second file to become visible is not a carrier.
 */
function statusIconProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/** A circle carrying an i. Information. */
export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...statusIconProps(props)}>
      <circle cx="10" cy="10" r="8.2" strokeWidth="1.6" />
      <path d="M10 9.1v5.1" strokeWidth="1.8" />
      <circle cx="10" cy="5.9" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A circle carrying a check. Affirmation. */
export function SuccessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...statusIconProps(props)}>
      <circle cx="10" cy="10" r="8.2" strokeWidth="1.6" />
      <path d="m6.1 10.3 2.7 2.7 5.1-5.6" strokeWidth="1.8" />
    </svg>
  );
}

/** A triangle carrying a bang. Caution. */
export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...statusIconProps(props)}>
      <path d="M10 2.4 19 17.6H1z" strokeWidth="1.6" />
      <path d="M10 8v3.9" strokeWidth="1.8" />
      <circle cx="10" cy="14.7" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** An octagon carrying a bang. Stop. */
export function DangerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...statusIconProps(props)}>
      <path d="M6.9 1.7h6.2l4.2 4.2v6.2l-4.2 4.2H6.9l-4.2-4.2V5.9z" strokeWidth="1.6" />
      <path d="M10 5.9v4.6" strokeWidth="1.8" />
      <circle cx="10" cy="13.6" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The four status tones that have an icon. `neutral` deliberately has none. */
export type StatusTone = "info" | "success" | "warning" | "danger";

const statusIcons = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
} satisfies Record<StatusTone, (props: SVGProps<SVGSVGElement>) => ReactElement>;

export interface StatusIconProps extends SVGProps<SVGSVGElement> {
  /** Which shape to draw. Each tone is a different shape, never a recolor. */
  tone: StatusTone;
}

/**
 * The tone's own shape, selected by tone rather than chosen by the caller.
 * Passing the wrong glyph for a tone is the one way to break the Tone Trio Rule
 * while appearing to follow it, so the component does not offer the option.
 */
export function StatusIcon({ tone, ...props }: StatusIconProps) {
  const Icon = statusIcons[tone];
  return <Icon {...props} />;
}
