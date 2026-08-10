/**
 * Proof that the published declarations carry real types.
 *
 * `main.tsx` proves the package *builds* and renders. It cannot prove the props
 * it passes were checked against anything, and in 0.1.2 they were not: sixteen
 * unresolvable relative specifiers in `dist/*.d.ts` meant every root export
 * resolved to `any` under the `skipLibCheck: true` that every consumer sets.
 * The fixture compiled, the bundle ran, the page rendered — and
 * `<Button variant="nonsense">` would have compiled just as happily.
 *
 * So this file asserts the thing the render cannot. It is types-only, never
 * imported, and never reaches the Vite bundle; `tsc` picks it up through
 * `include: ["src"]` under both configs.
 *
 * Two guards, because degradation has two shapes and neither guard catches both:
 *
 * 1. `@ts-expect-error` on a genuinely invalid value. When an export degrades,
 *    the assignment stops being an error and the directive itself becomes one
 *    ("unused '@ts-expect-error'"). This is the guard that survives an
 *    *unresolvable* import — the 0.1.2 failure. Verified: against the broken
 *    declarations, under `Node16` with `skipLibCheck: true`, all three fire.
 * 2. `IsAny` on the type directly, for an export that resolves but is genuinely
 *    typed `any`. It cannot catch case 1 — an unresolved import becomes
 *    TypeScript's error type, which satisfies any constraint silently — so it
 *    is not a redundant spelling of the first guard, it is the other half.
 *
 * `tsconfig.node16.json` catches the resolution failure itself, and is the
 * primary check. These catch the damage that failure does when someone
 * suppresses it with `skipLibCheck` — which is what every consumer already has
 * switched on, and what made 0.1.2 look healthy for a full release cycle.
 */

import type {
  BadgeTone,
  BannerTone,
  ButtonProps,
  ButtonVariant,
  SelectProps,
  StatusTone,
} from "@jflamb/keycaps-react";
import type { renderStaticDocument } from "@jflamb/keycaps-react/static";

/** True only when `T` is `any`. `1 & any` is `any`, and `0 extends any` holds. */
type IsAny<T> = 0 extends 1 & T ? true : false;

/** Compiles only while `T` is `false` — that is, while `T` is not `any`. */
type Resolved<T extends false> = T;

// The package root, across a component union, a re-exported icon union, a prop
// type, and a nested prop — each a separate path through the barrel.
type _ButtonVariantResolves = Resolved<IsAny<ButtonVariant>>;
type _BannerToneResolves = Resolved<IsAny<BannerTone>>;
type _StatusToneResolves = Resolved<IsAny<StatusTone>>;
type _BadgeToneResolves = Resolved<IsAny<BadgeTone>>;
type _ButtonPropsResolve = Resolved<IsAny<ButtonProps>>;
type _ButtonSizePropResolves = Resolved<IsAny<ButtonProps["size"]>>;
type _SelectOptionsPropResolves = Resolved<IsAny<SelectProps["options"]>>;

// The `./static` subpath is a separate entry point with its own declaration
// file, so it needs its own proof.
type _StaticEntryResolves = Resolved<IsAny<typeof renderStaticDocument>>;

// @ts-expect-error "ghost" is not a ButtonVariant. If this stops erroring, the
// union has collapsed to `any` and every variant prop in every consumer is
// unchecked.
const invalidVariant: ButtonVariant = "ghost";

// @ts-expect-error `size` is "small" | "medium"; a number is not assignable.
const invalidSize: ButtonProps["size"] = 12;

// @ts-expect-error BadgeTone reaches across two files — Badge re-exports
// StatusTone from ../icons. That second hop had its own TS2834 in 0.1.2.
const invalidBadgeTone: BadgeTone = "critical";

// Referenced so the declarations above are not merely parsed but resolved.
export type Probes = [
  typeof invalidVariant,
  typeof invalidSize,
  typeof invalidBadgeTone,
];
