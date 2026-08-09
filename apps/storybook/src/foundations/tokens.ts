/**
 * Reads the Keycaps token layer out of the stylesheets that are actually loaded
 * on the page. Every Foundations page renders from this, so a page cannot
 * describe a token that no longer exists, or print a value the CSS does not.
 */

const KC_PROPERTY = /^--kc-/;

export interface TokenRule {
  /** Normalized selector, e.g. `:root[data-theme=dark]`. */
  selector: string;
  /** The enclosing at-rule condition, e.g. `(forced-colors: active)`. */
  condition?: string;
  /** `--kc-*` declarations in authored order, with their authored values. */
  declarations: Array<[name: string, value: string]>;
}

function normalizeSelector(selector: string): string {
  return selector.replace(/["']/g, "").replace(/\s+/g, " ").trim();
}

function collect(rules: CSSRuleList, condition: string | undefined, out: TokenRule[]) {
  for (const rule of Array.from(rules)) {
    const grouping = rule as CSSGroupingRule & { conditionText?: string };
    if (grouping.cssRules && grouping.cssRules.length > 0) {
      collect(grouping.cssRules, grouping.conditionText ?? condition, out);
      continue;
    }

    const styleRule = rule as CSSStyleRule;
    if (!styleRule.selectorText || !styleRule.style) continue;

    const declarations: TokenRule["declarations"] = [];
    for (let index = 0; index < styleRule.style.length; index += 1) {
      const name = styleRule.style.item(index);
      if (KC_PROPERTY.test(name)) {
        declarations.push([name, styleRule.style.getPropertyValue(name).trim()]);
      }
    }

    if (declarations.length > 0) {
      for (const selector of styleRule.selectorText.split(",")) {
        out.push({ selector: normalizeSelector(selector), condition, declarations });
      }
    }
  }
}

/** Every rule in the document that declares at least one `--kc-*` property. */
export function tokenRules(): TokenRule[] {
  const out: TokenRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.cssRules) collect(sheet.cssRules, undefined, out);
    } catch {
      // A cross-origin sheet cannot be read. Keycaps loads none, so skipping is safe.
    }
  }
  return out;
}

function mergeDeclarations(rules: TokenRule[]): Map<string, string> {
  const merged = new Map<string, string>();
  for (const rule of rules) {
    for (const [name, value] of rule.declarations) merged.set(name, value);
  }
  return merged;
}

function matching(
  selector: string,
  condition?: (value: string | undefined) => boolean,
): TokenRule[] {
  return tokenRules().filter(
    (rule) =>
      rule.selector === selector &&
      (condition ? condition(rule.condition) : rule.condition === undefined),
  );
}

/** Authored declarations of the unconditional `:root` block — the light theme and every primitive. */
export function lightDeclarations(): Map<string, string> {
  return mergeDeclarations(matching(":root"));
}

/** Authored declarations of `:root[data-theme=dark]` — the explicit dark theme. */
export function darkDeclarations(): Map<string, string> {
  return mergeDeclarations(matching(":root[data-theme=dark]"));
}

/** Authored declarations of `:root[data-kc-motion=reduce]` — the reduced-motion substitution. */
export function reducedMotionDeclarations(): Map<string, string> {
  return mergeDeclarations(matching(":root[data-kc-motion=reduce]"));
}

/** Authored declarations from the `forced-colors: active` block — the system-color mapping. */
export function forcedColorsDeclarations(): Map<string, string> {
  return mergeDeclarations(
    matching(":root", (condition) => Boolean(condition?.includes("forced-colors"))),
  );
}

/** Token names that the dark theme restates. These are the semantic layer; everything else is a primitive. */
export function semanticTokenNames(): Set<string> {
  return new Set(darkDeclarations().keys());
}

export type ThemeName = "light" | "dark";

/**
 * Resolves `names` in both themes by stamping `data-theme` on the root, reading,
 * and restoring it. The three writes happen inside one task, so the browser
 * never paints an intermediate state.
 */
export function resolveInBothThemes(
  names: string[],
): Record<ThemeName, Record<string, string>> {
  const root = document.documentElement;
  const previous = root.getAttribute("data-theme");

  const readWith = (theme: ThemeName) => {
    root.setAttribute("data-theme", theme);
    const computed = getComputedStyle(root);
    const values: Record<string, string> = {};
    for (const name of names) values[name] = computed.getPropertyValue(name).trim();
    return values;
  };

  const light = readWith("light");
  const dark = readWith("dark");

  if (previous === null) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", previous);

  return { light, dark };
}

/** Turns authored declarations into an inline style object usable as a scoped override. */
export function declarationsToStyle(
  declarations: Map<string, string>,
): Record<string, string> {
  const style: Record<string, string> = {};
  for (const [name, value] of declarations) style[name] = value;
  return style;
}

/**
 * Reads the primitive a semantic token points at, e.g.
 * `var(--kc-color-coral-key)` → `coral-key`. Returns null for literal values.
 */
export function referencedPrimitive(value: string): string | null {
  const match = /^var\(\s*--kc-color-([a-z0-9-]+)\s*\)$/i.exec(value);
  return match?.[1] ?? null;
}

/**
 * The authored value of a plain property on a component rule, e.g. the
 * intrinsic measure `.kc-card` declares for itself. Returns the last match, so
 * a later override wins the way the cascade does.
 */
export function ruleValue(selector: string, property: string): string | null {
  let found: string | null = null;
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        const styleRule = rule as CSSStyleRule;
        if (!styleRule.selectorText || !styleRule.style) continue;
        if (
          !styleRule.selectorText.split(",").map(normalizeSelector).includes(selector)
        ) {
          continue;
        }
        const value = styleRule.style.getPropertyValue(property).trim();
        if (value) found = value;
      }
    } catch {
      // Unreadable sheet; see tokenRules().
    }
  }
  return found;
}
