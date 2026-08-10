import type { DetailsHTMLAttributes, ReactNode } from "react";
import { Icon } from "../icons.js";
import { cx } from "../utils.js";

export interface DisclosureProps
  extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "open"> {
  /** The key's label — the question, or the name of what is behind it. */
  summary: ReactNode;
  /**
   * A second line under the label, for what the reader needs in order to decide
   * whether to open it.
   *
   * A slot rather than a variant, because two consumer repos invented exactly
   * this shape without coordinating — a `<span>` label and a `<small>` beside
   * it — which is the strongest evidence a component API can get. It renders as
   * a `<small>`, so an article writing the same two-slot summary by hand gets
   * the same treatment from the same rule.
   */
  description?: ReactNode;
  /**
   * Whether the disclosure starts open.
   *
   * There is no controlled `open` prop, and that is the native model rather than
   * a gap: `<details>` owns its own state, which is exactly what lets it work on
   * a page with no JavaScript. Every use of it across the three consumer repos
   * is an initial state too. Listen with `onToggle` if the app needs to know.
   */
  defaultOpen?: boolean;
  /**
   * Groups sibling disclosures into an exclusive accordion: opening one closes
   * the others sharing the name.
   *
   * A pass-through to the native `name` attribute, so the behavior costs no
   * runtime. `retirement-dashboard` already groups four of its assumption
   * sections this way. If more than one member sets `defaultOpen`, the browser
   * keeps the last — a group has one open panel by definition.
   */
  name?: string;
}

/**
 * A summary you can press, and the content it was hiding.
 *
 * **It is a native `<details>`, and that decides most of what follows.** React
 * Aria ships a `Disclosure`, and taking it would have meant a `<button
 * aria-expanded>` whose state lives in a client runtime — which is the one thing
 * this component could not afford. The disclosure is the only remaining Tier 2
 * entry the two Mode 1 repos could ever use, so a version that renders a dead
 * key into static markup would be worse than no version at all. The platform
 * element brings the press, the keyboard, the announcement, and `name`-based
 * exclusive grouping with no JavaScript attached to any of it.
 *
 * **Its treatment lives in the tokens package, not in `styles.css`.** That is
 * the second time this has happened — `SkipLink` was the first — and it is the
 * same reason both times. `styles.css` is data-attribute-only so that
 * hand-authored `.kc-` markup is visibly inert (ADR 0002), and a `<details>`
 * breaks that rule's premise rather than the rule: its press belongs to the
 * browser, so hand-authored disclosure markup genuinely works and there is
 * nothing to be inert about. The states are therefore real pseudo-classes in
 * `base.css`, which every delivery mode loads. `styles.css` gains nothing here
 * and `static.css` gains nothing either, because there is no state for a
 * prerender path to restore.
 *
 * **It is the same disclosure `prose.css` styles — the same rule, not a
 * matching one.** Every selector in that block names both `.kc-prose summary`
 * and `.kc-disclosure > summary`, so an article's disclosure and a product's are
 * one declaration block and cannot drift. The survey is the argument for going
 * that far: `retirement-dashboard` alone ships five disclosure treatments behind
 * five class names, with four different ways of drawing the chevron, and every
 * one of them started as a copy of another.
 *
 * **All three consumers ship zero press and zero edge**, so this is not Keycaps
 * choosing between three looks. `DESIGN.md` decided this element by name under
 * the Pressable Edge Rule — a summary takes input, so it owes travel and a wall
 * — and published the answer to a surface that could not reach it.
 *
 * What the component adds is the half a stylesheet cannot reach: the chevron as
 * a real glyph from the icon registry rather than a rotated border box or a
 * `›`, and the two-slot summary as markup rather than as something each caller
 * remembers to write.
 */
export function Disclosure({
  children,
  className,
  defaultOpen,
  description,
  summary,
  ...props
}: DisclosureProps) {
  return (
    <details {...props} className={cx("kc-disclosure", className)} open={defaultOpen}>
      <summary>
        {/* Wrapped rather than interpolated. The summary is a flex row with a
            column gap, so a fragment of text and an element would arrive as two
            flex items with a gap opened between them. Both repos that built this
            shape wrap it too. */}
        <span>{summary}</span>
        {description == null ? null : <small>{description}</small>}
        {/* `caret-down` from the registry, which is the same path `prose.css`
            masks onto its pseudo-element — one vendoring run feeds both, and a
            unit test compares the mask against this drawing. Decorative: the
            summary's own label already says what pressing it does. */}
        <Icon className="kc-disclosure__caret" name="caret-down" />
      </summary>
      {/* One wrapper, so the body's inline padding lands on something whatever
          the caller passes. An article emits element siblings a stylesheet can
          reach; `<Disclosure>Some sentence.</Disclosure>` emits a text node it
          cannot, and the misalignment would be the caller's to discover. The
          shared rule reaches this the same way it reaches an article's
          paragraph — `> *:not(summary)`. */}
      <div>{children}</div>
    </details>
  );
}
