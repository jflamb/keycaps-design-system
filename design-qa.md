# AppShell draft design QA

- Scope: `AssistantWorkbenchSidebarDraft` and `RetirementDashboardSidebarDraft`
- References: the current Assistant Workbench and retirement-dashboard desktop and mobile captures in `app-shell-audit/`
- Implementations: matching desktop and 390 x 844 compact captures in `app-shell-drafts/`
- Comparison method: each reference and implementation was combined side by side at the same viewport and reviewed as one image.

## Comparison history

1. The first pass confirmed that the retirement dashboard's left-rail hierarchy transferred cleanly, and that both existing compact horizontal navigations clipped destinations.
2. The first draft rail was visibly wider than the retirement reference. It was narrowed to an intrinsic 13 to 14 rem measure.
3. The header pass restored the Workbench protection status and the retirement sign-out action, then verified wrapping at 390 px.
4. The final pass found no cropped content, unintended horizontal scrolling, misleading positional decoration, broken typography, spacing, border, or radius defects.
5. The persistent desktop rail was tightened to 36 px per destination, matching the retirement-dashboard precedent, while the mobile drawer retained the 44 px control floor.

## Interaction and accessibility checks

- Desktop and compact navigation update `aria-current` and the visible page state.
- The compact `Sections` control opens a named start-side dialog containing every destination.
- Persistent desktop rail destinations measure 36 px; the same destinations measure 44 px in the compact drawer.
- Choosing a drawer destination closes the dialog and updates the page heading.
- Workbench `Review approvals` and retirement `Open plan` update the visible story state.
- Both stories retain working theme controls, skip navigation, real header utilities, and realistic status data.
- Browser console review found no warnings or errors on the final stories.
- TypeScript, Storybook production build, package/unit tests, Pages verification, consumer build, and all 47 Playwright tests passed.
- The high-severity audit gate passed. The separate low-severity readback is a dev-only Windows esbuild development-server advisory; this preview runs on macOS and does not change the shipped package runtime.

final result: passed
