import type { HTMLAttributes, ReactNode } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";
import { SkipLink } from "./SkipLink";
import { cx } from "../utils";

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The `id` the skip link jumps to. Must match `AppShellMain`'s `id`, which
   * defaults to the same value.
   *
   * @default "kc-main"
   */
  mainId?: string;
  /** Text of the skip link. */
  skipLabel?: ReactNode;
  /**
   * Suppresses the built-in skip link. Only correct when the page already
   * renders one earlier in the document — never because the page "does not need
   * one."
   */
  skipLink?: false;
}

/**
 * The frame every application page sits in: a bar, a body, a footer, and a
 * skip link before all of them.
 *
 * All five consumer repos carry a bespoke one — `.topbar`/`.layout`,
 * `.app-shell`, `.knowledge-shell`, `.site-header`, `.topbar` — and no two are
 * alike. That is five repos routing around a hole rather than ignoring the
 * system, which is why the shell is a Tier 1 component rather than something
 * left to each app.
 *
 * The skip link is rendered by default and first in the DOM. Three of the five
 * consumers hand-roll one and two have none at all; making it the shell's
 * responsibility means the two that forgot get it by construction, which is the
 * only way an accessibility floor ever holds across five codebases.
 *
 * The shell is deliberately structural. It contributes no interactive element of
 * its own except `AppShellNavLink`, so it needs almost nothing in `static.css`
 * and composes with whatever router a consumer already has.
 */
export function AppShell({
  children,
  className,
  mainId = "kc-main",
  skipLabel = "Skip to main content",
  skipLink,
  ...props
}: AppShellProps) {
  return (
    <div {...props} className={cx("kc-app-shell", className)}>
      {/* Wrapped in its own landmark rather than left loose at the top of the
          document. A skip link *is* navigation, and page content outside every
          landmark is a finding axe raises and a real gap for anyone who moves
          through a page by landmark — the one control that exists to help them
          skip should not be the one thing they cannot reach that way. */}
      {skipLink === false ? null : (
        <nav aria-label="Skip links" className="kc-app-shell__skip">
          <SkipLink targetId={mainId}>{skipLabel}</SkipLink>
        </nav>
      )}
      {children}
    </div>
  );
}

export interface AppShellHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Controls at the trailing edge — account, theme toggle, primary action. */
  actions?: ReactNode;
  /** The wordmark. Set in the display face. */
  brand?: ReactNode;
  /** Usually an `AppShellNav`. */
  children?: ReactNode;
  /**
   * Pins the bar to the top of the viewport. Off by default: a sticky bar costs
   * vertical space on every scroll, and on a 320px viewport that is a real
   * fraction of the page.
   */
  isSticky?: boolean;
}

export function AppShellHeader({
  actions,
  brand,
  children,
  className,
  isSticky,
  ...props
}: AppShellHeaderProps) {
  return (
    <header
      {...props}
      className={cx("kc-app-shell__header", className)}
      {...(isSticky ? { "data-sticky": true } : null)}
    >
      {brand ? <div className="kc-app-shell__brand">{brand}</div> : null}
      {children}
      {actions ? <div className="kc-app-shell__actions">{actions}</div> : null}
    </header>
  );
}

export interface AppShellNavProps extends HTMLAttributes<HTMLElement> {
  /**
   * Accessible name for the navigation landmark. Required when a page has more
   * than one `nav`, which any page with a shell and a footer does.
   */
  label: string;
}

export function AppShellNav({ className, label, ...props }: AppShellNavProps) {
  return (
    <nav {...props} aria-label={label} className={cx("kc-app-shell__nav", className)} />
  );
}

export interface AppShellNavLinkProps extends Omit<AriaLinkProps, "className"> {
  className?: string;
  /** Marks the destination the reader is already on. Sets `aria-current="page"`. */
  isCurrent?: boolean;
}

/**
 * One destination in the shell's navigation.
 *
 * React Aria's `Link`, so hover, press, and focus arrive as data attributes and
 * no real interactive selector is needed in `styles.css`. The current page is
 * marked with `aria-current`, which is both the state hook the styling reads and
 * the thing a screen reader announces — one attribute doing both jobs, rather
 * than a class for the look and nothing for the name.
 */
export function AppShellNavLink({
  className,
  isCurrent,
  ...props
}: AppShellNavLinkProps) {
  return (
    <AriaLink
      {...props}
      className={cx("kc-app-shell__nav-link", className)}
      {...(isCurrent ? { "aria-current": "page" } : null)}
    />
  );
}

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Accessible name. Required when the sidebar is navigation. */
  label?: string;
  /**
   * The element rendered. `nav` when the sidebar is a set of destinations,
   * `aside` when it is complementary content.
   *
   * @default "nav"
   */
  as?: "nav" | "aside";
}

export function AppShellSidebar({
  as = "nav",
  className,
  label,
  ...props
}: AppShellSidebarProps) {
  const shared = {
    ...props,
    "aria-label": label,
    className: cx("kc-app-shell__sidebar", className),
  };
  return as === "aside" ? <aside {...shared} /> : <nav {...shared} />;
}

export interface AppShellMainProps extends HTMLAttributes<HTMLElement> {
  /**
   * Must match the shell's `mainId`, which is where the skip link points.
   *
   * @default "kc-main"
   */
  id?: string;
}

/**
 * The page's content region.
 *
 * It carries its own measure — `min(100%, 72rem)`, centered — per the Intrinsic
 * Maximum Rule, so a page needs no layout wrapper. Override
 * `--kc-app-shell-measure` on the element when a surface genuinely wants a
 * different one; do not constrain it from outside.
 */
export function AppShellMain({ className, id = "kc-main", ...props }: AppShellMainProps) {
  return <main {...props} className={cx("kc-app-shell__main", className)} id={id} />;
}

export function AppShellBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("kc-app-shell__body", className)} />;
}

export function AppShellFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer {...props} className={cx("kc-app-shell__footer", className)} />;
}
