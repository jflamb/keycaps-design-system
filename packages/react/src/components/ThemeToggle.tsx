import { useCallback, useEffect, useState } from "react";
import { Button, type ButtonProps } from "./Button.js";
import { Icon } from "../icons.js";
import type { KeycapsIconName } from "../icons.js";

/**
 * What the reader has chosen, which is not the same as what they see.
 *
 * `"system"` is a real state rather than the absence of one. The token layer
 * resolves an unset `data-theme` through `prefers-color-scheme`, and the
 * bootstrap in `renderStaticDocument` writes nothing when nothing is stored —
 * so the system preference is the default and an explicit theme is an override,
 * never the other way round. A two-state control cannot express that: once it
 * writes a value there is no way back to following the system, and the reader
 * has silently lost the setting that tracks their evening.
 */
export type ThemePreference = "system" | "light" | "dark";

const ORDER: readonly ThemePreference[] = ["system", "light", "dark"];

const GLYPH = {
  system: "circle-half",
  light: "sun",
  dark: "moon",
} satisfies Record<ThemePreference, KeycapsIconName>;

const DESCRIPTION = {
  system: "following the system",
  light: "light",
  dark: "dark",
} satisfies Record<ThemePreference, string>;

/*
 * Deliberately not `Omit<ButtonProps, …>`: `ButtonProps` is a union carrying the
 * icon-only naming contract, and omitting across a union distributes into
 * something no caller can read. The toggle sets `iconOnly` and its own name, so
 * what is left to forward is presentation.
 */
type ForwardedButtonProps = Pick<ButtonProps, "variant" | "size" | "isDisabled">;

export interface ThemeToggleProps extends ForwardedButtonProps {
  /** Extra class names appended to `kc-button kc-theme-toggle`. */
  className?: string;
  /**
   * Where the choice is stored. It must match the key the page's no-flash
   * bootstrap reads, or the reader's choice survives the click and not the
   * reload.
   *
   * @default "jflamb-theme"
   */
  storageKey?: string;
  /**
   * Write a cookie on this domain instead of `localStorage`.
   *
   * This is the one place two consumers genuinely differ rather than merely
   * looking different: `assistant-workbench` shares a `jflamb-theme` cookie on
   * `.jflamb.com` with `enter.jflamb.com`, so a reader who picks dark on one
   * gets dark on the other, while `retirement-dashboard` is a single surface
   * and stores locally. A cross-application contract is a functional
   * difference, so it is a prop — and the component does not guess, because
   * writing a domain cookie where none was asked for would leak a preference
   * across surfaces that never agreed to share one.
   */
  cookieDomain?: string;
  /** The preference to start from before anything is read. @default "system" */
  defaultValue?: ThemePreference;
  /** Called after the choice changes, for an app with its own theme plumbing. */
  onChange?: (value: ThemePreference) => void;
}

/*
 * `window.localStorage` rather than the bare global, deliberately. Node has its
 * own `localStorage` global now, unavailable unless the process was started
 * with `--localstorage-file`, and it shadows the one jsdom installs on `window`.
 * Reaching through `window` gets the document's storage in a browser, jsdom's
 * under test, and nothing on a server — where the `document` guard has already
 * returned.
 */
function readStored(storageKey: string): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const pattern = new RegExp(`(?:^|; )${storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`);
  const cookie = pattern.exec(document.cookie);
  const raw = cookie
    ? decodeURIComponent(cookie[1]!)
    : ((): string | null => {
        try {
          return window.localStorage.getItem(storageKey);
        } catch {
          // Storage can throw outright when cookies are blocked. A theme
          // control is not worth taking the page down for.
          return null;
        }
      })();
  return raw === "light" || raw === "dark" ? raw : null;
}

function store(storageKey: string, value: ThemePreference, cookieDomain?: string): void {
  if (typeof document === "undefined") return;
  const clearing = value === "system";
  if (cookieDomain) {
    const domain = `; Domain=${cookieDomain}`;
    document.cookie = clearing
      ? `${storageKey}=; Max-Age=0; Path=/${domain}; SameSite=Lax`
      : `${storageKey}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/${domain}; SameSite=Lax`;
    return;
  }
  try {
    if (clearing) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, value);
  } catch {
    // Same reasoning as the read: the click still takes effect for this page.
  }
}

function apply(value: ThemePreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Removing the attribute is what hands control back to the media query.
  if (value === "system") delete root.dataset.theme;
  else root.dataset.theme = value;
}

/**
 * A key that cycles the reader between following the system, light, and dark.
 *
 * Keycaps has defined the `data-theme` contract since ADR 0001 and shipped no
 * control for it, so two consumers wrote their own and a third is about to.
 * This is that control, and the thing it standardizes is not the glyph — it is
 * that the three states stay three, and that an app's storage arrangement is a
 * prop rather than a fork.
 *
 * It is a Mode 2 component. `renderStatic` refuses it, because a theme key on a
 * page with no client runtime is a control that cannot do the one thing it is
 * for — and unlike a Banner whose dismiss is dead but whose message still
 * reads, there is nothing left of this one when the script is gone. Mode 1
 * pages carry the bootstrap and let `prefers-color-scheme` decide.
 */
export function ThemeToggle({
  storageKey = "jflamb-theme",
  cookieDomain,
  defaultValue = "system",
  onChange,
  className,
  ...props
}: ThemeToggleProps) {
  const [preference, setPreference] = useState<ThemePreference>(defaultValue);

  // Read after mount rather than during render: the server and the first client
  // frame have to agree, and the bootstrap has already put the right theme on
  // the document by now — this only catches the control up to it.
  useEffect(() => {
    setPreference(readStored(storageKey) ?? "system");
  }, [storageKey]);

  const advance = useCallback(() => {
    setPreference((current) => {
      const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;
      apply(next);
      store(storageKey, next, cookieDomain);
      onChange?.(next);
      return next;
    });
  }, [cookieDomain, onChange, storageKey]);

  const upcoming = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]!;

  return (
    <Button
      {...props}
      // The name carries both halves, because a control that cycles is one the
      // reader cannot predict from its glyph alone: where they are, and what
      // the next press does.
      aria-label={`Theme: ${DESCRIPTION[preference]}. Switch to ${DESCRIPTION[upcoming]}.`}
      className={["kc-theme-toggle", className].filter(Boolean).join(" ")}
      data-theme-preference={preference}
      iconOnly
      onPress={advance}
    >
      <Icon name={GLYPH[preference]} />
    </Button>
  );
}
