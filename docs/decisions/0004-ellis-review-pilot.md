# ADR 0004: Ellis pull-request review pilot

- Status: Accepted
- Date: 2026-08-10

## Decision

Keycaps uses the repository-neutral Ellis PR Reviewer GitHub App as a required
machine gate on `main`. The pilot installation is limited to this repository.
Assistant Workbench validates every qualifying pull-request head SHA in an
isolated, credential-free checkout and publishes the required `Ellis review`
Check Run.

GitHub's native auto-merge remains subject to the repository ruleset. Ellis may
enable it only for explicitly trusted authors and low-risk paths; sensitive
changes require Jaime's decision bound to the current head SHA.

## Consequences

- `verify` and `Ellis review` must both pass for the current head.
- Conversations must be resolved, and the branch must be current with `main`.
- Force pushes and deletion of `main` are blocked.
- The automated reviewer principal is separate from Ellis's normal GitHub user.
- Additional repositories may connect later through Assistant Workbench without
  changing the App's identity or the shared policy model.
