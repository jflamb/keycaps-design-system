/**
 * The Mode 1 entry point: render the real Keycaps components to HTML at build
 * time and ship no client React.
 *
 * This is a separate bundle from the package root on purpose. It pulls in
 * `react-dom/server`, which has no business in a browser bundle, and importing
 * it is the moment a consumer declares it is on the static path.
 *
 *   import { renderStaticDocument } from "@jflamb/keycaps-react/static";
 *
 * A Mode 1 page must load `@jflamb/keycaps-react/static.css` alongside
 * `styles.css`. Without it the page renders correctly at rest and is completely
 * inert on hover, press, and focus — which is the same failure the whole
 * delivery decision exists to prevent, arriving through the front door.
 */

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Thrown when a static render contains a component that cannot degrade to CSS. */
export class StaticRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaticRenderError";
  }
}

/**
 * Components excluded from Mode 1 by ADR 0002, and the class each one leaves in
 * the markup. A listbox that cannot open is not a degraded Select, it is a
 * broken one.
 */
const modeTwoOnly = [
  [
    "kc-select__trigger",
    "Select needs a client runtime to open its listbox. A page that needs one is a Mode 2 page.",
  ],
  [
    "kc-popover",
    "Popover needs a client runtime to open, trap focus, and return it. A page that needs one is a Mode 2 page.",
  ],
  [
    "kc-theme-toggle",
    "ThemeToggle needs a client runtime to change the theme. A Mode 1 page carries the no-flash bootstrap and lets `prefers-color-scheme` decide, which is the whole of its theming.",
  ],
] as const;

export interface RenderStaticOptions {
  /**
   * Skips the Mode 1 eligibility check.
   *
   * There is one honest reason to reach for this: rendering a fragment you will
   * hydrate later, where the interactive components are the point. If you are
   * setting it to get a Select onto a page that ships no JavaScript, the check
   * is right and the page is wrong.
   */
  allowInteractive?: boolean;
}

/**
 * Render a component tree to HTML.
 *
 * Throws when the output contains a component whose behavior cannot degrade to
 * CSS, so the Mode 1 exclusion is a build failure rather than a line in a
 * document that someone reads later.
 *
 * The check has one blind spot worth stating: a `PopoverTrigger` renders only
 * its trigger button until it opens, so a statically rendered trigger with no
 * popover markup beside it passes here and ships a key that does nothing. Do not
 * put a `PopoverTrigger` on a Mode 1 page.
 */
export function renderStatic(
  element: ReactNode,
  options: RenderStaticOptions = {},
): string {
  const markup = renderToStaticMarkup(element);

  if (!options.allowInteractive) {
    for (const [marker, reason] of modeTwoOnly) {
      if (markup.includes(marker)) {
        throw new StaticRenderError(`${reason} (found \`${marker}\` in the rendered markup)`);
      }
    }
  }

  return markup;
}

const escapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => escapes[character] ?? character);
}

/**
 * The no-flash theme bootstrap.
 *
 * It has to be blocking and in the head, because the alternative is a white
 * frame before the dark theme lands. It reads a cookie first and then
 * `localStorage`, which is the existing jflamb theme-preference contract that
 * ADR 0001 committed to preserving — a cookie scoped to the parent domain is
 * what lets two jflamb.com surfaces agree about the reader's choice.
 *
 * When nothing is stored it writes nothing, and `prefers-color-scheme` in the
 * token layer decides. That is deliberate: the system preference is the default
 * and an explicit `data-theme` is an override, never the other way round.
 */
function themeBootstrap(storageKey: string): string {
  return (
    `(function(){try{` +
    `var k=${JSON.stringify(storageKey)};` +
    `var m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"));` +
    `var t=m?decodeURIComponent(m[1]):localStorage.getItem(k);` +
    `if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;` +
    `}catch(e){}})()`
  );
}

export interface RenderStaticDocumentOptions extends RenderStaticOptions {
  /** The page. Usually an `AppShell`. */
  children: ReactNode;
  /** Extra classes on `<body>`. */
  bodyClassName?: string;
  /** The `<meta name="description">`. Write it; a page without one is a bad link preview. */
  description?: string;
  /**
   * Raw markup appended to `<head>` — Open Graph tags, a favicon link, a
   * canonical URL. Not escaped, because it is markup; do not interpolate
   * anything a reader controls into it.
   */
  head?: string;
  /**
   * Stylesheet text inlined into a `<style>` element.
   *
   * The right choice when the page has nowhere to put a file — `mcp-dnsimple`
   * compiles its whole site into one module and its Dockerfile copies only
   * `src/`, so a separate `.css` would silently vanish from the image.
   */
  inlineStyles?: readonly string[];
  /**
   * Document language. Sets `<html lang>`, which decides hyphenation, quotation
   * marks, and which voice a screen reader uses.
   *
   * @default "en"
   */
  lang?: string;
  /**
   * `<link rel="stylesheet">` hrefs, in order. A Mode 1 page needs three: the
   * token layer, `styles.css`, and `static.css`.
   */
  stylesheets?: readonly string[];
  /**
   * Where the reader's theme choice is stored, shared across jflamb surfaces.
   * Pass `false` to omit the bootstrap entirely, leaving `prefers-color-scheme`
   * to decide.
   *
   * @default "jflamb-theme"
   */
  themeStorageKey?: string | false;
  /** The `<title>`. */
  title: string;
}

/**
 * Render a whole HTML document around a component tree.
 *
 * The two static-render consumers each need the same head: a charset, a
 * viewport, the theme bootstrap, the three stylesheets, and a `theme-color` that
 * follows the theme. Producing that here rather than in each repo is the
 * difference between one implementation and two — which is the entire point of
 * ADR 0002, applied to the document as well as to the components.
 *
 * `theme-color` ships as a pair with `media` attributes rather than a single
 * value. A single one is what makes a phone's browser chrome stay pale while the
 * page under it is dark.
 */
export function renderStaticDocument({
  allowInteractive,
  bodyClassName,
  children,
  description,
  head = "",
  inlineStyles = [],
  lang = "en",
  stylesheets = [],
  themeStorageKey = "jflamb-theme",
  title,
}: RenderStaticDocumentOptions): string {
  const parts = [
    "<!doctype html>",
    `<html lang="${escapeHtml(lang)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
  ];

  if (description) {
    parts.push(`<meta name="description" content="${escapeHtml(description)}">`);
  }

  parts.push(
    '<meta name="theme-color" content="#f5f5f3" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#15181d" media="(prefers-color-scheme: dark)">',
  );

  if (themeStorageKey !== false) {
    parts.push(`<script>${themeBootstrap(themeStorageKey)}</script>`);
  }

  for (const href of stylesheets) {
    parts.push(`<link rel="stylesheet" href="${escapeHtml(href)}">`);
  }

  for (const css of inlineStyles) {
    parts.push(`<style>${css}</style>`);
  }

  parts.push(
    head,
    "</head>",
    bodyClassName ? `<body class="${escapeHtml(bodyClassName)}">` : "<body>",
    renderStatic(children, { allowInteractive }),
    "</body>",
    "</html>",
  );

  return parts.join("");
}
