import { useState } from "react";
import {
  Badge,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
} from "@jflamb/keycaps-react";
import componentStatusDoc from "../../../../docs/component-status.md?raw";
import contributingDoc from "../../../../docs/contributing/components.md?raw";

function cells(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * The *first* table in the document, and only it.
 *
 * This used to filter for every line starting with `|` across the whole file,
 * which silently concatenated the status matrix with the delivery-modes table
 * below it — one table on screen holding the rows of two, under headings that
 * belong to only one of them. It showed up as a duplicate-key warning wherever a
 * name appeared in both, which by then was the second symptom rather than the
 * first. Reading one contiguous run of rows is the fix, and it means adding a
 * component to either table no longer disturbs the other.
 */
function parseTable(markdown: string): { headers: string[]; rows: string[][] } {
  const all = markdown.split("\n").map((line) => line.trim());
  const start = all.findIndex((line) => line.startsWith("|"));
  const end = all.findIndex((line, index) => index > start && !line.startsWith("|"));
  const lines = all.slice(start, end === -1 ? undefined : end);
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
    <DataTable
      caption={
        <>
          Source: <code>docs/component-status.md</code>. No component has reached
          stable.
        </>
      }
      className="kc-docs-table sb-unstyled"
    >
      <DataTableHead>
        <DataTableRow>
          {table.headers.map((header) => (
            <DataTableColumnHeader key={header}>{header}</DataTableColumnHeader>
          ))}
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {table.rows.map((row) => (
          <DataTableRow key={row[0]}>
            <DataTableRowHeader>{row[0]}</DataTableRowHeader>
            {row.slice(1).map((cell, index) => (
              // eslint-disable-next-line react/no-array-index-key -- cells have no identity
              <DataTableCell key={index}>
                {/^(experimental|beta|stable|deprecated)$/i.test(cell) ? (
                  <Badge tone={cell.toLowerCase() === "stable" ? "success" : "warning"}>
                    {cell}
                  </Badge>
                ) : (
                  cell
                )}
              </DataTableCell>
            ))}
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
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
