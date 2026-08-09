import { create } from "storybook/theming/create";

/**
 * Storybook's manager is styled by an Emotion theme object, not by CSS custom
 * properties, so these values are the one place in the repository where Keycaps
 * primitives are restated outside `packages/tokens`. Every value below is a
 * literal copy of a `--kc-*` token; the comment names the token it mirrors.
 * `scripts/verify-pages-build.mjs` asserts the built manager still paints the
 * cloud ground, so a silent drift back to stock Storybook fails the gate.
 */

const fontBase =
  '"Sofia Sans", ui-sans-serif, system-ui, -apple-system, sans-serif';
const fontCode =
  '"Lilex", ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, monospace';

export const keycapsLight = create({
  base: "light",
  brandTitle: "Keycaps",
  brandUrl: "./",
  brandTarget: "_self",

  // Wayfinding is not a commitment, so it does not wear the key face. Storybook
  // derives selection, tab underlines and toolbar washes from `colorSecondary`;
  // handing it mint keeps coral for actual keys and matches the marker the
  // Select option already uses for "this one is selected".
  colorPrimary: "#1b6f5a", // --kc-color-mint-deep
  colorSecondary: "#1b6f5a", // --kc-color-mint-deep

  appBg: "#f5f5f3", // --kc-color-cloud
  appContentBg: "#fdfdfb", // --kc-color-plate
  appPreviewBg: "#f5f5f3", // --kc-color-cloud
  appHoverBg: "#f7f7f4", // --kc-color-surface-hover
  appBorderColor: "#e7e7e3", // --kc-color-divider
  appBorderRadius: 10, // --kc-radius-key

  fontBase,
  fontCode,

  textColor: "#3a3f47", // --kc-color-graphite
  textInverseColor: "#fdfdfb", // --kc-color-plate
  textMutedColor: "#5c6570", // --kc-color-slate

  barTextColor: "#5c6570", // --kc-color-slate
  barHoverColor: "#1b6f5a", // --kc-color-mint-deep
  barSelectedColor: "#1b6f5a", // --kc-color-mint-deep
  barBg: "#fdfdfb", // --kc-color-plate

  buttonBg: "#fdfdfb", // --kc-color-plate
  buttonBorder: "#c3c9d2", // --kc-color-fog
  booleanBg: "#f5f5f3", // --kc-color-cloud
  booleanSelectedBg: "#fdfdfb", // --kc-color-plate

  inputBg: "#fdfdfb", // --kc-color-plate
  inputBorder: "#c3c9d2", // --kc-color-fog
  inputTextColor: "#3a3f47", // --kc-color-graphite
  inputBorderRadius: 10, // --kc-radius-key

  gridCellSize: 8,
});

export const keycapsDark = create({
  base: "dark",
  brandTitle: "Keycaps",
  brandUrl: "./",
  brandTarget: "_self",

  colorPrimary: "#63d4b8", // --kc-color-mint-bright
  colorSecondary: "#63d4b8", // --kc-color-mint-bright

  appBg: "#15181d", // dark --kc-color-surface
  appContentBg: "#1e2228", // dark --kc-color-surface-raised
  appPreviewBg: "#15181d", // dark --kc-color-surface
  appHoverBg: "#262b33", // dark --kc-color-surface-hover
  appBorderColor: "#2a2f36", // dark --kc-color-divider
  appBorderRadius: 10, // --kc-radius-key

  fontBase,
  fontCode,

  textColor: "#edeff2", // dark --kc-color-text
  textInverseColor: "#15181d", // dark --kc-color-surface
  textMutedColor: "#a8b0bb", // dark --kc-color-text-muted

  barTextColor: "#a8b0bb", // dark --kc-color-text-muted
  barHoverColor: "#63d4b8", // --kc-color-mint-bright
  barSelectedColor: "#63d4b8", // --kc-color-mint-bright
  barBg: "#1e2228", // dark --kc-color-surface-raised

  buttonBg: "#1e2228", // dark --kc-color-surface-raised
  buttonBorder: "#4a515c", // dark --kc-color-border
  booleanBg: "#15181d", // dark --kc-color-surface
  booleanSelectedBg: "#1e2228", // dark --kc-color-surface-raised

  inputBg: "#1e2228", // dark --kc-color-surface-raised
  inputBorder: "#4a515c", // dark --kc-color-border
  inputTextColor: "#edeff2", // dark --kc-color-text
  inputBorderRadius: 10, // --kc-radius-key

  gridCellSize: 8,
});
