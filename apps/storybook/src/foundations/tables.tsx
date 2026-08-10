import { useState, type ReactNode } from "react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
} from "@jflamb/keycaps-react";
import {
  darkDeclarations,
  lightDeclarations,
  referencedPrimitive,
  resolveInBothThemes,
  semanticTokenNames,
} from "./tokens";

interface TokenRow {
  name: string;
  lightAuthored: string;
  darkAuthored: string;
  light: string;
  dark: string;
}

function useTokenRows(include: (name: string) => boolean): TokenRow[] {
  const [rows] = useState<TokenRow[]>(() => {
    const light = lightDeclarations();
    const dark = darkDeclarations();
    const names = [...light.keys()].filter(include);
    const resolved = resolveInBothThemes(names);

    return names.map((name) => ({
      name,
      lightAuthored: light.get(name) ?? "",
      darkAuthored: dark.get(name) ?? light.get(name) ?? "",
      light: resolved.light[name] ?? "",
      dark: resolved.dark[name] ?? "",
    }));
  });

  return rows;
}

function Source({ authored }: { authored: string }) {
  const primitive = referencedPrimitive(authored);
  return (
    <span className="kc-swatch__source">
      {primitive ? primitive : "literal"}
    </span>
  );
}

function ColorCell({ authored, value }: { authored: string; value: string }) {
  return (
    <div className="kc-swatch">
      <span aria-hidden="true" className="kc-swatch__chip" style={{ background: value }} />
      <span className="kc-swatch__values">
        <code>{value}</code>
        <Source authored={authored} />
      </span>
    </div>
  );
}

function TokenGrid({ caption, rows }: { caption: ReactNode; rows: TokenRow[] }) {
  if (rows.length === 0) return null;
  return (
    <DataTable caption={caption} className="kc-docs-table sb-unstyled">
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Token</DataTableColumnHeader>
          <DataTableColumnHeader>Light</DataTableColumnHeader>
          <DataTableColumnHeader>Dark</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.name}>
            <DataTableRowHeader>
              <code>{row.name}</code>
            </DataTableRowHeader>
            <DataTableCell>
              <ColorCell authored={row.lightAuthored} value={row.light} />
            </DataTableCell>
            <DataTableCell>
              <ColorCell authored={row.darkAuthored} value={row.dark} />
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

const SEMANTIC_GROUPS: Array<{ title: string; test: RegExp }> = [
  { title: "Ground and ink", test: /^--kc-color-(surface|text|border|divider)/ },
  { title: "The key", test: /^--kc-color-(key-|on-key|focus)/ },
  { title: "Wayfinding", test: /^--kc-color-(link|accent-)/ },
  { title: "Status tones", test: /^--kc-color-(success|warning|danger|info)-/ },
];

/**
 * Every `--kc-color-*` token in the loaded stylesheet, resolved in both themes.
 * Nothing here is transcribed: the names, the order, the light/dark split, and
 * the semantic-versus-primitive division all come from the CSS.
 */
export function ColorTokens() {
  const restatedInDark = useState(() => semanticTokenNames())[0];
  const rows = useTokenRows((name) => name.startsWith("--kc-color-"));

  // A token is semantic if the dark theme restates it, or if it resolves to a
  // different value per theme because it points at something that does. A
  // primitive names a pigment and is the same in both.
  const isSemantic = (row: TokenRow) =>
    restatedInDark.has(row.name) || row.light !== row.dark;

  const semanticRows = rows.filter(isSemantic);
  const primitiveRows = rows.filter((row) => !isSemantic(row));
  const grouped = SEMANTIC_GROUPS.map((group) => ({
    ...group,
    rows: semanticRows.filter((row) => group.test.test(row.name)),
  }));
  const ungrouped = semanticRows.filter(
    (row) => !SEMANTIC_GROUPS.some((group) => group.test.test(row.name)),
  );

  return (
    <>
      {grouped.map((group) => (
        <TokenGrid caption={group.title} key={group.title} rows={group.rows} />
      ))}
      <TokenGrid caption="Other semantic colors" rows={ungrouped} />
      <TokenGrid
        caption="Brand primitives — the palette's source, not its interface. Reach for a semantic token in component CSS."
        rows={primitiveRows}
      />
    </>
  );
}

/** Name and resolved value in both themes, for tokens that are not colors. */
export function ValueTable({
  caption,
  prefix,
  sample,
}: {
  caption: ReactNode;
  prefix: string | string[];
  sample?: (row: { name: string; light: string; dark: string }) => ReactNode;
}) {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  const rows = useTokenRows((name) => prefixes.some((one) => name.startsWith(one)));
  if (rows.length === 0) return null;

  const identical = rows.every((row) => row.light === row.dark);

  return (
    <DataTable caption={caption} className="kc-docs-table sb-unstyled">
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Token</DataTableColumnHeader>
          <DataTableColumnHeader>{identical ? "Value" : "Light"}</DataTableColumnHeader>
          {identical ? null : <DataTableColumnHeader>Dark</DataTableColumnHeader>}
          {sample ? <DataTableColumnHeader>Sample</DataTableColumnHeader> : null}
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.name}>
            <DataTableRowHeader>
              <code>{row.name}</code>
            </DataTableRowHeader>
            <DataTableCell>
              <code>{row.light}</code>
            </DataTableCell>
            {identical ? null : (
              <DataTableCell>
                <code>{row.dark}</code>
              </DataTableCell>
            )}
            {sample ? <DataTableCell>{sample(row)}</DataTableCell> : null}
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
