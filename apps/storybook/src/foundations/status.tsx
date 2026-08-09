import { useState } from "react";
import { Badge } from "@jflamb/keycaps-react";
import componentStatusDoc from "../../../../docs/component-status.md?raw";
import contributingDoc from "../../../../docs/contributing/components.md?raw";

function cells(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseTable(markdown: string): { headers: string[]; rows: string[][] } {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  const [headerLine, , ...bodyLines] = lines;
  return {
    headers: headerLine ? cells(headerLine) : [],
    rows: bodyLines.map(cells),
  };
}

function parseSectionList(markdown: string, heading: string): Array<[string, string]> {
  const section = markdown.split(new RegExp(`^##\\s+${heading}\\s*$`, "m"))[1] ?? "";
  const body = section.split(/^##\s+/m)[0] ?? "";
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => {
      const text = line.slice(2);
      const separator = text.indexOf(": ");
      return separator === -1
        ? ([text, ""] as [string, string])
        : ([
            text.slice(0, separator).replace(/`/g, ""),
            text.slice(separator + 2),
          ] as [string, string]);
    });
}

/**
 * The per-component status matrix, read straight out of `docs/component-status.md`
 * so the site and the repository cannot disagree about what `beta` covers.
 */
export function ComponentStatusMatrix() {
  const [table] = useState(() => parseTable(componentStatusDoc));

  return (
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Source: <code>docs/component-status.md</code>. No component has reached
          stable.
        </caption>
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]}>
              <th scope="row">{row[0]}</th>
              {row.slice(1).map((cell, index) => (
                // eslint-disable-next-line react/no-array-index-key -- cells have no identity
                <td key={index}>
                  {/^(experimental|beta|stable|deprecated)$/i.test(cell) ? (
                    <Badge tone={cell.toLowerCase() === "stable" ? "success" : "warning"}>
                      {cell}
                    </Badge>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The four release statuses, read from `docs/contributing/components.md`. */
export function ReleaseLadder() {
  const [items] = useState(() => parseSectionList(contributingDoc, "Release status"));

  return (
    <dl className="kc-ladder-list">
      {items.map(([term, description]) => (
        <div className="kc-ladder-list__item" key={term}>
          <dt>
            <code>{term}</code>
          </dt>
          <dd>{description}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The component contract every component must satisfy before it ships as beta. */
export function ComponentContract() {
  const [items] = useState(() =>
    (contributingDoc.split(/^##\s+Component contract\s*$/m)[1] ?? "")
      .split(/^##\s+/m)[0]!
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\.\s/.test(line))
      .map((line) => line.replace(/^\d+\.\s/, "")),
  );

  return (
    <ol className="kc-contract">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
