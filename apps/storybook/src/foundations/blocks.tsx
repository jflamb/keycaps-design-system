import { useState, type CSSProperties, type ReactNode } from "react";
import {
  darkDeclarations,
  declarationsToStyle,
  forcedColorsDeclarations,
  lightDeclarations,
  reducedMotionDeclarations,
  type ThemeName,
} from "./tokens";

/**
 * A Named Rule from DESIGN.md, stated as a rule on the page that owns it.
 * These are the parts of the system that have teeth; prose paraphrases of them
 * are how a design system quietly stops being enforceable.
 */
export function Rule({
  children,
  name,
  tone = "rule",
}: {
  children: ReactNode;
  name: string;
  tone?: "rule" | "dont";
}) {
  return (
    <aside className="kc-rule" data-tone={tone}>
      <p className="kc-rule__name">{tone === "dont" ? "Don't" : "Rule"}</p>
      <div className="kc-rule__body">
        <strong>{name}</strong> {children}
      </div>
    </aside>
  );
}

/**
 * Keycaps' theme contract is deliberately root-scoped: `data-theme` belongs on
 * the document element and nowhere else. To show both themes on one page
 * without breaking that contract, this reads the authored declarations of the
 * target theme and applies them as inline custom properties, so real components
 * render in the other theme's physics inside an ordinary element.
 */
export function ThemeScope({
  children,
  label,
  theme,
}: {
  children: ReactNode;
  label?: ReactNode;
  theme: ThemeName;
}) {
  const [style] = useState<CSSProperties>(() => ({
    ...(declarationsToStyle(
      theme === "dark" ? darkDeclarations() : lightDeclarations(),
    ) as CSSProperties),
    colorScheme: theme,
  }));

  return (
    <div className="kc-scope sb-unstyled" data-scope-theme={theme} style={style}>
      {label ? <p className="kc-scope__label">{label}</p> : null}
      <div className="kc-scope__body">{children}</div>
    </div>
  );
}

/**
 * Applies the reduced-motion token substitution to a subtree, so the travelling
 * key and the material key can sit next to each other on one page. The values
 * are read from the `:root[data-kc-motion="reduce"]` rule itself.
 */
export function MotionScope({
  children,
  label,
  mode,
}: {
  children: ReactNode;
  label?: ReactNode;
  mode: "full" | "reduce";
}) {
  const [style] = useState<CSSProperties>(() =>
    mode === "reduce"
      ? (declarationsToStyle(reducedMotionDeclarations()) as CSSProperties)
      : {},
  );

  return (
    <div className="kc-scope sb-unstyled" data-scope-motion={mode} style={style}>
      {label ? <p className="kc-scope__label">{label}</p> : null}
      <div className="kc-scope__body">{children}</div>
    </div>
  );
}

/**
 * Applies the `forced-colors: active` token mapping. This previews the
 * substitution Keycaps makes; only the operating system can put the browser in
 * real forced-colors mode, which additionally overrides colors Keycaps does not
 * set.
 */
export function ForcedColorsScope({
  children,
  label,
}: {
  children: ReactNode;
  label?: ReactNode;
}) {
  const [style] = useState<CSSProperties>(
    () => declarationsToStyle(forcedColorsDeclarations()) as CSSProperties,
  );

  return (
    <div className="kc-scope sb-unstyled" data-scope-forced-colors="simulated" style={style}>
      {label ? <p className="kc-scope__label">{label}</p> : null}
      <div className="kc-scope__body">{children}</div>
    </div>
  );
}

/**
 * A link to another page of this Storybook. Docs render inside the preview
 * iframe, so a plain relative link would navigate the frame rather than the
 * site; `target="_top"` sends it to the manager, and `./` keeps it correct under
 * the GitHub Pages base path.
 */
export function DocLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <a className="kc-doclink" href={`./?path=/docs/${to}`} target="_top">
      {children}
    </a>
  );
}

/** A link to a single story rather than a docs page. */
export function StoryLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <a className="kc-doclink" href={`./?path=/story/${to}`} target="_top">
      {children}
    </a>
  );
}

/** A monospace token name or value, used everywhere a literal is quoted. */
export function Token({ children }: { children: ReactNode }) {
  return <code className="kc-token">{children}</code>;
}

/** Two panes side by side, wrapping to one column below the card breakpoint. */
export function SplitPanes({ children }: { children: ReactNode }) {
  return <div className="kc-panes">{children}</div>;
}
