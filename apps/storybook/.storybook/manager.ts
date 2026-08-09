import {
  GLOBALS_UPDATED,
  SET_GLOBALS,
  STORY_RENDERED,
} from "storybook/internal/core-events";
import { addons, type API } from "storybook/manager-api";
import { keycapsDark, keycapsLight } from "./keycaps-theme";

const ADDON_ID = "keycaps/chrome";
const A11Y_MANUAL_EVENT = "storybook/a11y/manual";

addons.setConfig({
  theme: keycapsLight,
  sidebar: {
    showRoots: true,
  },
});

function applyTheme(api: API, theme: unknown) {
  const resolved = theme === "dark" ? "dark" : "light";
  // The manager document also carries the Keycaps token contract, so anything
  // styled with `--kc-*` inside the manager (see `managerHead` in main.ts)
  // follows the same switch the preview does.
  document.documentElement.dataset.theme = resolved;
  api.setOptions({ theme: resolved === "dark" ? keycapsDark : keycapsLight });
}

addons.register(ADDON_ID, (api) => {
  applyTheme(api, api.getGlobals?.().theme);

  api.on(SET_GLOBALS, ({ globals }: { globals?: Record<string, unknown> }) => {
    applyTheme(api, globals?.theme);
  });
  api.on(GLOBALS_UPDATED, ({ globals }: { globals?: Record<string, unknown> }) => {
    applyTheme(api, globals?.theme);
  });

  // The accessibility panel subscribes to the channel after the preview has
  // already reported the first story, so on a cold load — every deep link, and
  // every visit to the deployed site — it never receives a result and sits on
  // "Preparing accessibility scan" forever. Asking for one scan explicitly after
  // the first render gives the panel a result it cannot miss. Later stories are
  // covered by the addon's own `afterEach`.
  let kicked = false;
  api.on(STORY_RENDERED, (storyId: string) => {
    if (kicked) return;
    kicked = true;
    api.emit(A11Y_MANUAL_EVENT, storyId, {});
  });
});
