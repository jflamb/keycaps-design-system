/**
 * Theme preference and pre-hydration helpers for Mode 2 consumers.
 *
 * The bootstrap is returned as source because it must run synchronously in the
 * document head. Importing a client module after hydration is already too late:
 * the browser may have painted the system theme before a stored override lands.
 */

/** What the reader chose, distinct from the light or dark theme they currently see. */
export type ThemePreference = "system" | "light" | "dark";

/**
 * Browser-chrome colors paired with the token layer's surface in each theme.
 * A unit test pins these values to `--kc-color-surface`, so the bootstrap and
 * the CSS cannot drift independently.
 */
export const KEYCAPS_THEME_COLORS = Object.freeze({
  light: "#f5f5f3",
  dark: "#15181d",
});

export interface ThemeBootstrapOptions {
  /**
   * Cookie/localStorage key read before the first frame. Cookies win so a
   * parent-domain preference can be shared across jflamb.com surfaces. Pass
   * `false` to ignore storage and follow the system.
   *
   * @default "jflamb-theme"
   */
  storageKey?: string | false;
  /**
   * The theme-color meta element to keep synchronized. Pass `false` when the
   * document intentionally has no browser-chrome color.
   *
   * @default 'meta[name="theme-color"]'
   */
  themeColorSelector?: string | false;
}

interface ResolvedThemeBootstrapOptions {
  colors: typeof KEYCAPS_THEME_COLORS;
  storageKey: string | null;
  themeColorSelector: string | null;
}

/*
 * Keep this function self-contained. `createThemeBootstrapScript` serializes it
 * into a blocking head script, so a reference to a module-level helper would be
 * undefined in the consuming document.
 */
function runThemeBootstrap(config: ResolvedThemeBootstrapOptions): void {
  var root = document.documentElement;
  var darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
  var forcedColors = window.matchMedia("(forced-colors: active)");

  function storedPreference(): "light" | "dark" | null {
    if (!config.storageKey) return null;

    var key = config.storageKey;
    var escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
    var raw: string | null = null;

    if (match) {
      try {
        raw = decodeURIComponent(match[1] || "");
      } catch (_error) {
        raw = null;
      }
    }

    if (raw !== "light" && raw !== "dark") {
      try {
        raw = window.localStorage.getItem(key);
      } catch (_error) {
        raw = null;
      }
    }

    return raw === "light" || raw === "dark" ? raw : null;
  }

  function activeTheme(): "light" | "dark" {
    var explicit = root.dataset.theme;
    if (explicit === "light" || explicit === "dark") return explicit;
    return darkMedia.matches ? "dark" : "light";
  }

  function syncThemeColor(): void {
    if (!config.themeColorSelector) return;

    var meta: HTMLMetaElement | null = null;
    try {
      meta = document.querySelector(config.themeColorSelector);
    } catch (_error) {
      return;
    }
    if (!meta) return;

    var theme = activeTheme();
    var color: string = config.colors[theme];

    // Once CSS exists, a consumer-approved semantic-token override should
    // reach browser chrome too. Forced colors intentionally keeps the canonical
    // hex fallback; system color keywords such as Canvas are not portable meta
    // theme-color values.
    if (document.readyState !== "loading" && !forcedColors.matches) {
      var computed = window
        .getComputedStyle(root)
        .getPropertyValue("--kc-color-surface")
        .trim();
      if (computed) color = computed;
    }

    meta.setAttribute("content", color);
  }

  var stored = storedPreference();
  if (stored) root.dataset.theme = stored;
  else delete root.dataset.theme;

  // This assignment is the pre-first-frame path. It cannot wait for CSS, so it
  // uses the package-owned color paired with the token contract.
  syncThemeColor();

  var observer = new MutationObserver(syncThemeColor);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  darkMedia.addEventListener("change", syncThemeColor);
  forcedColors.addEventListener("change", syncThemeColor);
  window.addEventListener("DOMContentLoaded", syncThemeColor, { once: true });

  // Re-running the artifact (for example during a development hot reload)
  // replaces its global listeners instead of accumulating another set.
  var marker = Symbol.for("@jflamb/keycaps/theme-bootstrap");
  var target = window as unknown as Window & {
    [key: symbol]: (() => void) | undefined;
  };
  var previous = target[marker];
  if (typeof previous === "function") previous();
  target[marker] = function cleanup() {
    observer.disconnect();
    darkMedia.removeEventListener("change", syncThemeColor);
    forcedColors.removeEventListener("change", syncThemeColor);
    window.removeEventListener("DOMContentLoaded", syncThemeColor);
  };
}

function escapeInlineScript(value: string): string {
  return value.replace(/[<>&\u2028\u2029]/g, (character) => {
    const code = character.charCodeAt(0).toString(16).padStart(4, "0");
    return `\\u${code}`;
  });
}

/**
 * Return a blocking, self-contained head script for hydrated React consumers.
 *
 * Put the selected `<meta name="theme-color">` before this script and the
 * stylesheet after it. The script reads a valid cookie first, falls back to
 * localStorage, applies an explicit `data-theme` before paint, and keeps the
 * meta color synchronized after root-attribute and operating-system changes.
 */
export function createThemeBootstrapScript({
  storageKey = "jflamb-theme",
  themeColorSelector = 'meta[name="theme-color"]',
}: ThemeBootstrapOptions = {}): string {
  const config: ResolvedThemeBootstrapOptions = {
    colors: KEYCAPS_THEME_COLORS,
    storageKey: storageKey === false ? null : storageKey,
    themeColorSelector: themeColorSelector === false ? null : themeColorSelector,
  };

  return `(${runThemeBootstrap.toString()})(${escapeInlineScript(JSON.stringify(config))})`;
}
