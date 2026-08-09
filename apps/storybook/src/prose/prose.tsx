import { useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * The prose container every story on this page renders into.
 *
 * `measure` writes `--kc-prose-measure` rather than `max-inline-size`, because
 * that is the override point the stylesheet documents — a surface that needs a
 * wider column for a table sets the property and everything inside keeps
 * deriving from it. Setting the width directly would work here and teach the
 * wrong thing.
 */
export function Prose({
  as: Element = "article",
  children,
  measure,
  ...rest
}: {
  as?: "article" | "div" | "section";
  children: ReactNode;
  measure?: string;
} & { "aria-labelledby"?: string }) {
  return (
    <Element
      className="kc-prose"
      style={
        measure ? ({ "--kc-prose-measure": measure } as CSSProperties) : undefined
      }
      {...rest}
    >
      {children}
    </Element>
  );
}

/**
 * A code block with the copy control the stylesheet styles. The button is a real
 * one — `.kc-prose__copy` is presentation only, and a stylesheet cannot put text
 * on a clipboard — so this is the small amount of script a consuming app owns.
 *
 * The label is swapped rather than announced through a live region: the button
 * is what the reader just activated, so its own accessible name changing is the
 * feedback, and it needs no second channel.
 */
export function CopyableCode({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // A denied clipboard leaves the label alone rather than claiming success.
    }
  }

  return (
    <div className="kc-prose__code">
      <button
        className="kc-prose__copy"
        data-copied={copied ? "" : undefined}
        onClick={copy}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
        <span className="kc-sr-only"> {lang ?? "code"} sample</span>
      </button>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
