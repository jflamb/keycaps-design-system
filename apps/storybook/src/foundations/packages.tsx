import { useState } from "react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
} from "@jflamb/keycaps-react";
import reactPackage from "../../../../packages/react/package.json";
import tokensPackage from "../../../../packages/tokens/package.json";

const PURPOSE: Record<string, string> = {
  "@jflamb/keycaps-tokens": "Everything below, in one import. Start here.",
  "@jflamb/keycaps-tokens/tokens.css":
    "The custom properties alone: primitives, both semantic themes, and the forced-colors mapping. No reset, no fonts.",
  "@jflamb/keycaps-tokens/fonts.css":
    "The @font-face declarations for Piazzolla, Sofia Sans and Lilex. Local WOFF2; nothing is fetched at runtime.",
  "@jflamb/keycaps-tokens/base.css":
    "Box sizing, the 320px floor, body type, heading face, link color, focus ring, .kc-sr-only, .kc-skip-link, and the reduced-motion guard. Zero-specificity :where() selectors, so your own styles win.",
  "@jflamb/keycaps-tokens/prose.css":
    "Long-form content styling for the elements a CMS or markdown pipeline emits, scoped to .kc-prose. Opt-in and not part of the default import, because a product surface that renders no articles should not pay for it.",
  "@jflamb/keycaps-tokens/legacy.css":
    "Opt-in unprefixed aliases for retrofitting an existing jflamb app. New projects should not import this.",
  "@jflamb/keycaps-tokens/fonts/*":
    "The WOFF2 files themselves, for preloading or for a build that copies assets by path.",
  "@jflamb/keycaps-react": "The components.",
  "@jflamb/keycaps-react/styles.css":
    "Component styling. Required — the components ship no inline styles. Every interactive state is a React Aria data attribute, so this file alone is inert on hover, press, and focus.",
  "@jflamb/keycaps-react/static":
    "renderStatic and renderStaticDocument, for rendering components to HTML at build time. A separate bundle, because it pulls in react-dom/server.",
  "@jflamb/keycaps-react/theme":
    "createThemeBootstrapScript and KEYCAPS_THEME_COLORS, for pre-first-frame Mode 2 theme application and browser-chrome synchronization without importing React.",
  "@jflamb/keycaps-react/static.css":
    "The :hover, :active, and :focus-visible rules that mirror those data attributes, for a page that ships no client React. Import it only from a prerender path — loading it in a React app is harmless but pointless, and loading it nowhere is what makes hand-authored markup visibly inert.",
};

function exportRows(name: string, exportsField: Record<string, unknown>) {
  return Object.keys(exportsField).map((subpath) => {
    const specifier = subpath === "." ? name : `${name}${subpath.slice(1)}`;
    return { specifier, purpose: PURPOSE[specifier] ?? "—" };
  });
}

/**
 * Every subpath the two packages publish, enumerated from their `exports`
 * fields. A new export shows up here with an em dash until someone says what it
 * is for, rather than staying invisible.
 */
export function PackageExports() {
  const [rows] = useState(() => [
    ...exportRows(tokensPackage.name, tokensPackage.exports),
    ...exportRows(reactPackage.name, reactPackage.exports),
  ]);

  return (
    <DataTable
      caption={
        <>
          Read from the two <code>package.json</code> <code>exports</code> fields.
        </>
      }
      className="kc-docs-table sb-unstyled"
    >
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Import</DataTableColumnHeader>
          <DataTableColumnHeader>What it gives you</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.specifier}>
            <DataTableRowHeader>
              <code>{row.specifier}</code>
            </DataTableRowHeader>
            <DataTableCell>{row.purpose}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

/**
 * The declared license of each published package, read from its manifest. The
 * tokens package declares `MIT AND OFL-1.1` because it redistributes font
 * binaries that MIT cannot cover.
 */
export function PackageLicenses() {
  const [rows] = useState(() =>
    [tokensPackage, reactPackage].map((manifest) => ({
      name: manifest.name,
      license: manifest.license,
      ships: manifest.name.endsWith("tokens")
        ? "Tokens, base styles, and the Piazzolla, Sofia Sans and Lilex WOFF2 binaries."
        : "Component code and styling. No font binaries.",
    })),
  );

  return (
    <DataTable
      caption={
        <>
          Read from the two <code>package.json</code> <code>license</code> fields,
          so this page cannot disagree with what npm publishes.
        </>
      }
      className="kc-docs-table sb-unstyled"
    >
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Package</DataTableColumnHeader>
          <DataTableColumnHeader>Declared license</DataTableColumnHeader>
          <DataTableColumnHeader>What it redistributes</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.name}>
            <DataTableRowHeader>
              <code>{row.name}</code>
            </DataTableRowHeader>
            <DataTableCell>
              <code>{row.license}</code>
            </DataTableCell>
            <DataTableCell>{row.ships}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

/**
 * Where the project lives and what version this site documents. An adopter's
 * real question is "how likely is this to break under me," and the answer starts
 * with being able to find the repository, the issues, and the changelog.
 */
export function ProjectLinks() {
  const [meta] = useState(() => {
    const repo = reactPackage.repository.url
      .replace(/^git\+/, "")
      .replace(/\.git$/, "");
    return {
      version: reactPackage.version,
      repo,
      issues: reactPackage.bugs.url,
      changelog: `${repo}/blob/main/CHANGELOG.md`,
      contributing: `${repo}/blob/main/docs/contributing/components.md`,
    };
  });

  return (
    <DataTable
      caption={
        <>
          Read from <code>{reactPackage.name}</code>'s manifest. Both packages
          share a version, and Storybook documents whatever that version is.
        </>
      }
      className="kc-docs-table sb-unstyled"
    >
      <DataTableBody>
        <DataTableRow>
          <DataTableRowHeader>Version</DataTableRowHeader>
          <DataTableCell>
            <code>{meta.version}</code> — pre-1.0, so the API can still change.
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Source</DataTableRowHeader>
          <DataTableCell>
            <a href={meta.repo} rel="noreferrer" target="_blank">
              {meta.repo.replace("https://", "")}
            </a>
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Issues</DataTableRowHeader>
          <DataTableCell>
            <a href={meta.issues} rel="noreferrer" target="_blank">
              Report a problem or ask a question
            </a>
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Changelog</DataTableRowHeader>
          <DataTableCell>
            <a href={meta.changelog} rel="noreferrer" target="_blank">
              CHANGELOG.md
            </a>
          </DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableRowHeader>Contributing</DataTableRowHeader>
          <DataTableCell>
            <a href={meta.contributing} rel="noreferrer" target="_blank">
              The component contract
            </a>{" "}
            — including the manual assistive-technology verification that{" "}
            <code>stable</code> is waiting on.
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  );
}

/** The peer range, read from the React package's own manifest. */
export function PeerRange() {
  const [rows] = useState(() =>
    Object.entries(reactPackage.peerDependencies as Record<string, string>),
  );

  return (
    <DataTable
      caption={
        <>
          Peer dependencies of <code>{reactPackage.name}</code>, version{" "}
          <code>{reactPackage.version}</code>.
        </>
      }
      className="kc-docs-table sb-unstyled"
    >
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Package</DataTableColumnHeader>
          <DataTableColumnHeader>Accepted range</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map(([name, range]) => (
          <DataTableRow key={name}>
            <DataTableRowHeader>
              <code>{name}</code>
            </DataTableRowHeader>
            <DataTableCell>
              <code>{range}</code>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
