# ADR 0004: Email is a generated token projection, not a third component delivery mode

- Status: Accepted
- Date: 2026-08-16

## Context

Assistant Workbench sends mail from Python, and email clients cannot consume the
React component runtime or be trusted to preserve Keycaps custom properties.
Copying colors, fonts, spacing, and radii into its templates already allowed the
mail surface to retain Fraunces and Nunito Sans after Keycaps moved to Piazzolla
and Sofia Sans.

## Decision

Keycaps publishes `email-theme.json`, a flattened and digested projection of its
required light semantic tokens. The token build resolves aliases and fails when
a required semantic token disappears. The artifact ships in
`@jflamb/keycaps-tokens` and at the Keycaps Pages origin so installed mail
runtimes can refresh it without embedding Node or React. Email renderers accept
only this appearance data and own their semantic content schemas, escaping, MIME
output, caching, and offline fallback.

This is not Mode 1: no React component is rendered, and no Keycaps class contract
is exposed. The email's physical layout is intentionally constrained by the
artifact, while its HTML is disposable transport output.

## Consequences

Token edits propagate into the artifact automatically and a missing required
token breaks the Keycaps build. Consumers may cache the last schema-valid copy
and carry a bundled fallback, but they must record the theme version and digest
in generated mail so a delivered message can be traced to its appearance input.
