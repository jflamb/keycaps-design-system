# Contributing components

## Component contract

Every component must:

1. Use semantic Keycaps tokens rather than raw colors in component CSS.
2. Keep accessible behavior in React Aria Components when a matching primitive exists — unless a platform element already provides the whole behavior with no runtime, in which case take the platform element and say why. `Disclosure` is the one component that has taken this exit: React Aria ships a `Disclosure`, and it would have put the open state in a client runtime and cost the component its Mode 1 eligibility. A native `<details>` brings the press, the keyboard, the announcement, and exclusive grouping for free. Reaching for this exit where React Aria's primitive genuinely does more — a listbox, a modal — is the mistake it exists to permit, not to encourage.
3. Preserve a visible focus indicator and a minimum 44-by-44 CSS-pixel interactive target where practical.
4. Work with system, explicit light, explicit dark, reduced-motion, and forced-color preferences.
5. Reflow without horizontal page scrolling at 320 CSS pixels.
6. Avoid third-party runtime requests.
7. Include API guidance, representative states, unit tests, an axe check, and browser interaction proof.

## Public APIs

Prefer small owned props over re-exporting every primitive part. Pass through native and React Aria props when doing so does not weaken the component contract. Breaking API changes require a major version after the first public release.

## Content

Use direct labels that describe the action or data requested. Error messages should state what happened and what the user can do next. Do not use color alone to convey status.

## Release status

- `experimental`: API and behavior are expected to change.
- `beta`: intended for product use with documented constraints; API may still change before 1.0.
- `stable`: automated and manual coverage is complete and the API follows semantic versioning.
- `deprecated`: supported temporarily with a named replacement and removal release.
