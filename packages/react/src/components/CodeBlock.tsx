import { useState, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./Button";
import { cx } from "../utils";

/**
 * The syntax roles a code block understands.
 *
 * Four, where a highlighter offers thirty, and only two of them are colors. The
 * plate stays quiet because the system spends color almost nowhere, and a `pre`
 * carrying five hues is the loudest thing on any page it appears on. Comments
 * and punctuation recede to the muted ink; a string — usually the value a reader
 * is scanning for — takes the accent; a keyword is carried by weight. Coral
 * appears nowhere, because nothing in a code sample commits to anything.
 *
 * `mcp-dnsimple` hand-authors `.tk-brace`, `.tk-str`, `.tk-key`, and
 * `.tk-comment` spans today, which is exactly this set.
 */
export type CodeTokenKind = "comment" | "keyword" | "punctuation" | "string";

export interface CodeTokenProps extends HTMLAttributes<HTMLSpanElement> {
  kind: CodeTokenKind;
}

/** A highlighted run inside a `CodeBlock`. */
export function CodeToken({ className, kind, ...props }: CodeTokenProps) {
  return (
    <span {...props} className={cx("kc-code__token", className)} data-token={kind} />
  );
}

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  /** The code. A string, or spans built from `CodeToken`. */
  children: ReactNode;
  /**
   * Accessible name for the copy control.
   *
   * @default "Copy code"
   */
  copyLabel?: string;
  /**
   * Renders a copy control. Requires a client runtime and the async Clipboard
   * API, so leave it off on a statically rendered page — a copy button with no
   * React attached is a control that silently does nothing.
   */
  copyable?: boolean;
  /**
   * The exact text the copy control writes. Supply it whenever `children` is
   * anything but a plain string; there is no DOM read here to fall back on.
   */
  copyText?: string;
  /** A filename or a language, shown above the block. */
  label?: ReactNode;
  /** Wraps long lines instead of scrolling them. */
  wrap?: boolean;
}

/**
 * A block of code.
 *
 * `prose.css` already styles `pre` inside an article, and this is deliberately
 * the same treatment — a code sample in a product surface and one in an article
 * are the same thing, and the reader should not have to notice which page they
 * are on. What the component adds is the two halves CSS cannot do on its own:
 * the `tabindex="0"` the Prose Markup Rule requires (a block that scrolls and
 * cannot be focused is a 2.1.1 failure, and long code lines scroll by default),
 * and a copy control whose visible state is real rather than a hover reveal.
 *
 * The control sits in a row above the block rather than floating over its
 * corner, for the reason `prose.css` records: a control revealed on hover is
 * invisible to touch and to the keyboard, and a control that is always present
 * and also overlaid is always covering the first line.
 */
export function CodeBlock({
  children,
  className,
  copyLabel = "Copy code",
  copyable,
  copyText,
  label,
  wrap,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const text = copyText ?? (typeof children === "string" ? children : undefined);

  async function copy() {
    if (text == null) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // A denied or absent Clipboard API leaves the label alone rather than
      // claiming a copy that did not happen.
      setCopied(false);
    }
  }

  return (
    <div {...props} className={cx("kc-code", className)}>
      {label || copyable ? (
        <div className="kc-code__bar">
          {label ? <span className="kc-code__label">{label}</span> : null}
          {copyable ? (
            <Button
              className="kc-code__copy"
              onPress={copy}
              size="small"
              variant="secondary"
              {...(copied ? { "data-copied": true } : null)}
            >
              {copied ? "Copied" : copyLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
      {/* Focusable because it scrolls. See the Prose Markup Rule. */}
      <pre className="kc-code__pre" tabIndex={0} {...(wrap ? { "data-wrap": true } : null)}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
