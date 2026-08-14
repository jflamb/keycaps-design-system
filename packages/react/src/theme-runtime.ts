import { KEYCAPS_THEME_COLORS, type ThemePreference } from "./theme.js";

export const DEFAULT_THEME_COLOR_SELECTOR = 'meta[name="theme-color"]';

function cookieValue(storageKey: string): string | null {
  const escaped = storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1] ?? "");
  } catch {
    return null;
  }
}

/*
 * `window.localStorage` rather than the bare global, deliberately. Node has its
 * own `localStorage` global now, unavailable unless the process was started
 * with `--localstorage-file`, and it shadows the one jsdom installs on `window`.
 */
export function readStoredThemePreference(storageKey: string): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const cookie = cookieValue(storageKey);
  let raw = cookie;
  if (raw !== "light" && raw !== "dark") {
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      raw = null;
    }
  }
  return raw === "light" || raw === "dark" ? raw : null;
}

export function storeThemePreference(
  storageKey: string,
  value: ThemePreference,
  cookieDomain?: string,
): void {
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
    // Storage can be blocked outright. The click still applies to this page.
  }
}

function activeTheme(): "light" | "dark" {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function syncThemeColor(
  themeColorSelector: string | false = DEFAULT_THEME_COLOR_SELECTOR,
): void {
  if (typeof document === "undefined" || themeColorSelector === false) return;
  let meta: HTMLMetaElement | null;
  try {
    meta = document.querySelector(themeColorSelector);
  } catch {
    return;
  }
  if (!meta) return;

  const theme = activeTheme();
  let color: string = KEYCAPS_THEME_COLORS[theme];
  if (!window.matchMedia("(forced-colors: active)").matches) {
    const computed = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--kc-color-surface")
      .trim();
    if (computed) color = computed;
  }
  meta.setAttribute("content", color);
}

export function applyThemePreference(
  value: ThemePreference,
  themeColorSelector: string | false = DEFAULT_THEME_COLOR_SELECTOR,
): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (value === "system") delete root.dataset.theme;
  else root.dataset.theme = value;
  syncThemeColor(themeColorSelector);
}

export function subscribeToSystemTheme(
  themeColorSelector: string | false = DEFAULT_THEME_COLOR_SELECTOR,
): () => void {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => syncThemeColor(themeColorSelector);
  media.addEventListener("change", sync);
  return () => media.removeEventListener("change", sync);
}
