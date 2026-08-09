import { useState, type ReactNode } from "react";
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
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Light</th>
            <th scope="col">Dark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <ColorCell authored={row.lightAuthored} value={row.light} />
              </td>
              <td>
                <ColorCell authored={row.darkAuthored} value={row.dark} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">{identical ? "Value" : "Light"}</th>
            {identical ? null : <th scope="col">Dark</th>}
            {sample ? <th scope="col">Sample</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <code>{row.light}</code>
              </td>
              {identical ? null : (
                <td>
                  <code>{row.dark}</code>
                </td>
              )}
              {sample ? <td>{sample(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
