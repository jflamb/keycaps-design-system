# Publishing Keycaps

Keycaps uses two separate publication boundaries:

- Storybook deploys to GitHub Pages after the `Keycaps checks` workflow succeeds on `main`.
- npm publication happens only when a GitHub Release is published with a tag that exactly matches both package versions.

## One-time GitHub setup

1. Create the repository as `jflamb/keycaps-design-system`, add it as `origin`, and push `main`.
2. In **Settings → Pages**, choose **GitHub Actions** as the source if GitHub does not select it automatically.
3. Create an `npm` environment in **Settings → Environments**. Add a required reviewer if releases should always pause for approval.

The expected Pages URL is `https://jflamb.github.io/keycaps-design-system/`.

## npm publication setup

Both packages exist on npm and use trusted publishing through the `npm` GitHub environment. No stored registry token is part of the current release path.

The workflow checks the tag, fixed package versions, token peer range, complete test gate, package builds, font/OFL/package-notice parity, packed contents, and provenance before publishing tokens first and React second.

## Move to npm trusted publishing

After each package exists on npm, configure a trusted publisher for both packages:

- Organization or user: `jflamb`
- Repository: `keycaps-design-system`
- Workflow: `publish-packages.yml`
- Environment: `npm`

Then delete the `NPM_TOKEN` secret. The workflow already grants `id-token: write`, so current npm clients can use OpenID Connect (OIDC) instead of a long-lived registry token.

## Prepare a later release

1. Run `pnpm version:set <version>` using the intended semantic version.
2. Update `CHANGELOG.md` and add or revise component-status notes.
3. Run `pnpm release:verify -- v<version>`.
4. Run `pnpm check` and `pnpm release:dry-run`.
5. Review and merge the exact validated head to `main`, then publish a GitHub Release tagged `v<version>` from that merged revision.

Both packages intentionally share one version until independent release cadence provides a clear benefit.
