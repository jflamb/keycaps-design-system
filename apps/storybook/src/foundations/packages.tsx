import { useState } from "react";
import reactPackage from "../../../../packages/react/package.json";
import tokensPackage from "../../../../packages/tokens/package.json";

const PURPOSE: Record<string, string> = {
  "@jflamb/keycaps-tokens": "Everything below, in one import. Start here.",
  "@jflamb/keycaps-tokens/tokens.css":
    "The custom properties alone: primitives, both semantic themes, and the forced-colors mapping. No reset, no fonts.",
  "@jflamb/keycaps-tokens/fonts.css":
    "The @font-face declarations for Fraunces Variable and Nunito Sans. Local WOFF2; nothing is fetched at runtime.",
  "@jflamb/keycaps-tokens/base.css":
    "Box sizing, the 320px floor, body type, heading face, link color, focus ring, .kc-sr-only, and the reduced-motion guard. Zero-specificity :where() selectors, so your own styles win.",
  "@jflamb/keycaps-tokens/legacy.css":
    "Opt-in unprefixed aliases for retrofitting an existing jflamb app. New projects should not import this.",
  "@jflamb/keycaps-tokens/fonts/*":
    "The WOFF2 files themselves, for preloading or for a build that copies assets by path.",
  "@jflamb/keycaps-react": "The components.",
  "@jflamb/keycaps-react/styles.css":
    "Component styling. Required — the components ship no inline styles.",
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
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Read from the two <code>package.json</code> <code>exports</code> fields.
        </caption>
        <thead>
          <tr>
            <th scope="col">Import</th>
            <th scope="col">What it gives you</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.specifier}>
              <th scope="row">
                <code>{row.specifier}</code>
              </th>
              <td>{row.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
        ? "Tokens, base styles, and the Fraunces and Nunito Sans WOFF2 binaries."
        : "Component code and styling. No font binaries.",
    })),
  );

  return (
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Read from the two <code>package.json</code> <code>license</code>{" "}
          fields, so this page cannot disagree with what npm publishes.
        </caption>
        <thead>
          <tr>
            <th scope="col">Package</th>
            <th scope="col">Declared license</th>
            <th scope="col">What it redistributes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <code>{row.license}</code>
              </td>
              <td>{row.ships}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Read from <code>{reactPackage.name}</code>'s manifest. Both packages
          share a version, and Storybook documents whatever that version is.
        </caption>
        <tbody>
          <tr>
            <th scope="row">Version</th>
            <td>
              <code>{meta.version}</code> — pre-1.0, so the API can still change.
            </td>
          </tr>
          <tr>
            <th scope="row">Source</th>
            <td>
              <a href={meta.repo} rel="noreferrer" target="_blank">
                {meta.repo.replace("https://", "")}
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Issues</th>
            <td>
              <a href={meta.issues} rel="noreferrer" target="_blank">
                Report a problem or ask a question
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Changelog</th>
            <td>
              <a href={meta.changelog} rel="noreferrer" target="_blank">
                CHANGELOG.md
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Contributing</th>
            <td>
              <a href={meta.contributing} rel="noreferrer" target="_blank">
                The component contract
              </a>{" "}
              — including the manual assistive-technology verification that{" "}
              <code>stable</code> is waiting on.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** The peer range, read from the React package's own manifest. */
export function PeerRange() {
  const [rows] = useState(() =>
    Object.entries(reactPackage.peerDependencies as Record<string, string>),
  );

  return (
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Peer dependencies of <code>{reactPackage.name}</code>, version{" "}
          <code>{reactPackage.version}</code>.
        </caption>
        <thead>
          <tr>
            <th scope="col">Package</th>
            <th scope="col">Accepted range</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, range]) => (
            <tr key={name}>
              <th scope="row">
                <code>{name}</code>
              </th>
              <td>
                <code>{range}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
