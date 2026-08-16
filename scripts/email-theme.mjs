import { createHash } from "node:crypto";

export const EMAIL_THEME_SCHEMA =
  "https://jflamb.github.io/keycaps-design-system/email-theme-v1.schema.json";
export const EMAIL_THEME_ID = "keycaps-email-theme/v1";

const REQUIRED_TOKENS = {
  colors: {
    surface: "--kc-color-surface",
    surfaceRaised: "--kc-color-surface-raised",
    text: "--kc-color-text",
    textMuted: "--kc-color-text-muted",
    border: "--kc-color-border",
    divider: "--kc-color-divider",
    link: "--kc-color-link",
    keyFace: "--kc-color-key-face",
    keyEdge: "--kc-color-key-edge",
    onKey: "--kc-color-on-key",
    accentSurface: "--kc-color-accent-surface",
    accentText: "--kc-color-accent-text",
    accentBorder: "--kc-color-accent-border",
    successSurface: "--kc-color-success-surface",
    successText: "--kc-color-success-text",
    successBorder: "--kc-color-success-border",
    warningSurface: "--kc-color-warning-surface",
    warningText: "--kc-color-warning-text",
    warningBorder: "--kc-color-warning-border",
    dangerSurface: "--kc-color-danger-surface",
    dangerText: "--kc-color-danger-text",
    dangerBorder: "--kc-color-danger-border",
    infoSurface: "--kc-color-info-surface",
    infoText: "--kc-color-info-text",
    infoBorder: "--kc-color-info-border",
  },
  fonts: {
    display: "--kc-font-display",
    body: "--kc-font-body",
    mono: "--kc-font-mono",
  },
  fontSizes: {
    xs: "--kc-font-size-xs",
    sm: "--kc-font-size-sm",
    md: "--kc-font-size-md",
    lg: "--kc-font-size-lg",
    xl: "--kc-font-size-xl",
    caps: "--kc-font-size-caps",
  },
  lineHeights: {
    body: "--kc-line-height-body",
    heading: "--kc-line-height-heading",
    label: "--kc-line-height-label",
  },
  fontWeights: {
    body: "--kc-font-weight-body",
    display: "--kc-font-weight-display",
    title: "--kc-font-weight-title",
    label: "--kc-font-weight-label",
    emphasis: "--kc-font-weight-emphasis",
    bold: "--kc-font-weight-bold",
  },
  space: {
    "1": "--kc-space-1",
    "2": "--kc-space-2",
    "3": "--kc-space-3",
    "4": "--kc-space-4",
    "5": "--kc-space-5",
    "6": "--kc-space-6",
    "8": "--kc-space-8",
    "10": "--kc-space-10",
  },
  radii: {
    sm: "--kc-radius-sm",
    key: "--kc-radius-key",
    plate: "--kc-radius-plate",
    pill: "--kc-radius-pill",
  },
  dimensions: {
    keyEdge: "--kc-key-edge-width",
    controlMin: "--kc-control-min-size",
  },
};

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function themeDigest(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function extractRootTokens(css) {
  const root = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1];
  if (!root) throw new Error("tokens.css has no root token block");
  const declarations = new Map();
  const uncommented = root.replace(/\/\*[\s\S]*?\*\//g, "");
  const declaration = /(--kc-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  for (const match of uncommented.matchAll(declaration)) {
    declarations.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return declarations;
}

function resolveToken(name, declarations, stack = []) {
  if (stack.includes(name)) {
    throw new Error(`circular Keycaps token reference: ${[...stack, name].join(" -> ")}`);
  }
  const raw = declarations.get(name);
  if (raw === undefined) throw new Error(`email theme requires missing token ${name}`);
  const resolved = raw.replace(/var\((--kc-[a-z0-9-]+)\)/g, (_, dependency) =>
    resolveToken(dependency, declarations, [...stack, name]),
  );
  const integerCalculation = /^calc\(\s*(-?\d+)\s*\+\s*(-?\d+)\s*\)$/.exec(resolved);
  return integerCalculation
    ? String(Number(integerCalculation[1]) + Number(integerCalculation[2]))
    : resolved;
}

function resolveGroup(group, declarations) {
  return Object.fromEntries(
    Object.entries(group).map(([key, token]) => [key, resolveToken(token, declarations)]),
  );
}

export function createEmailTheme({ css, packageVersion }) {
  const declarations = extractRootTokens(css);
  const tokens = Object.fromEntries(
    Object.entries(REQUIRED_TOKENS).map(([group, names]) => [
      group,
      resolveGroup(names, declarations),
    ]),
  );
  const payload = {
    $schema: EMAIL_THEME_SCHEMA,
    schema: EMAIL_THEME_ID,
    keycapsVersion: packageVersion,
    tokensSha256: createHash("sha256").update(css).digest("hex"),
    tokens,
    email: {
      maxWidth: "680px",
      outerPaddingBlock: tokens.space["8"],
      outerPaddingInline: tokens.space["3"],
      contentPaddingBlockStart: tokens.space["8"],
      contentPaddingInline: tokens.space["8"],
      contentPaddingBlockEnd: tokens.space["8"],
      titleSize: "30px",
      messageTitleSize: "27px",
      sectionTitleSize: "22px",
      leadSize: "18px",
      itemTitleSize: "17px",
      brandTitleSize: "21px",
      brandKeyWidth: "34px",
      brandKeyHeight: "31px",
    },
  };
  return { ...payload, digest: themeDigest(payload) };
}

export function serializeEmailTheme(theme) {
  return `${JSON.stringify(theme, null, 2)}\n`;
}
