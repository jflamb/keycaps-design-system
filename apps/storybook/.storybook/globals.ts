import {
  GLOBALS_UPDATED,
  SET_GLOBALS,
  UPDATE_GLOBALS,
} from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import { forcedColorsDeclarations } from "../src/foundations/tokens";
import { installClipboardFallback } from "./clipboard";

export type ThemeName = "light" | "dark";

interface PreviewGlobals {
  theme?: string;
  motion?: string;
  forcedColors?: string;
}

const state = {
  theme: "light" as ThemeName,
  motion: "system",
  forcedColors: "off",
};

const listeners = new Set<(theme: ThemeName) => void>();
let appliedForcedColorTokens: string[] = [];

/**
 * Theme, motion, and forced colors are document modes, not canvas decorations,
 * so they are applied to the preview document's root element. A story decorator
 * cannot do this: pure MDX pages render no story, which is exactly where the
 * previous decorator silently stopped working and left the toolbar reporting a
 * theme the page was not in.
 */
function applyGlobals() {
  const root = document.documentElement;

  root.dataset.theme = state.theme;

  if (state.motion === "reduce") root.dataset.kcMotion = "reduce";
  else delete root.dataset.kcMotion;

  for (const name of appliedForcedColorTokens) root.style.removeProperty(name);
  appliedForcedColorTokens = [];

  if (state.forcedColors === "simulate") {
    for (const [name, value] of forcedColorsDeclarations()) {
      root.style.setProperty(name, value);
      appliedForcedColorTokens.push(name);
    }
    root.dataset.kcForcedColors = "simulated";
  } else {
    delete root.dataset.kcForcedColors;
  }

  for (const listener of listeners) listener(state.theme);
}

function merge(globals: PreviewGlobals | undefined) {
  if (!globals) return;
  if (globals.theme === "light" || globals.theme === "dark") {
    state.theme = globals.theme;
  }
  if (typeof globals.motion === "string") state.motion = globals.motion;
  if (typeof globals.forcedColors === "string") {
    state.forcedColors = globals.forcedColors;
  }
  applyGlobals();
}

// The iframe URL carries the globals on a cold load and on every deep link; the
// channel carries every change after that. Both are handled, so the document
// mode is right before first paint and stays right without a reload.
function readGlobalsFromUrl(): PreviewGlobals {
  const raw = new URLSearchParams(window.location.search).get("globals");
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(";").map((pair) => {
      const [key, value] = pair.split(":");
      return [key ?? "", value ?? ""];
    }),
  );
}

export function currentTheme(): ThemeName {
  return state.theme;
}

export function subscribeToTheme(listener: (theme: ThemeName) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

merge(readGlobalsFromUrl());
applyGlobals();
installClipboardFallback();

const channel = addons.getChannel();
for (const event of [GLOBALS_UPDATED, SET_GLOBALS, UPDATE_GLOBALS]) {
  channel.on(event, (payload: { globals?: PreviewGlobals } | undefined) =>
    merge(payload?.globals),
  );
}
