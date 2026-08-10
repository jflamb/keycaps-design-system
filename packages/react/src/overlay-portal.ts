import { createContext, useContext } from "react";

/**
 * Where a React Aria overlay inside this subtree should portal itself.
 *
 * `undefined` means "wherever React Aria would have put it", which is
 * `document.body`. Only `Dialog` ever sets it, and only while it is open.
 *
 * ## Why this exists
 *
 * A native `<dialog>` opened with `showModal()` enters the **top layer** and
 * makes every other element in the document `inert`. React Aria Components
 * portal their overlays to `document.body` by default, so a `Select` or a
 * `Popover` rendered inside a Keycaps `Dialog` lands *outside* it and fails
 * twice over: it paints underneath the scrim, because the portal target is not
 * in the top layer, and it cannot be opened at all, because it is inert.
 *
 * That is not a hypothetical. Both dialogs this component exists to replace hold
 * exactly that kind of content — `retirement-dashboard`'s Tiller picker is a
 * chooser, and `assistant-workbench`'s approval dialog carries a form.
 *
 * ## Why a context rather than a prop
 *
 * `Popover` and `Select` are Keycaps' own components, so the system can solve
 * this between its own parts instead of charging the caller for it. `Dialog`
 * publishes its element here; `Popover` and `Select` read it and hand it to
 * React Aria as `UNSTABLE_portalContainer`. A consumer writing
 * `<Dialog><Select …/></Dialog>` passes nothing and gets a working menu.
 *
 * The alternative was a prop on every nested overlay, and `DESIGN.md` has
 * already ruled on that shape: a carrier a caller can forget to pass is not a
 * carrier. The failure it would leak is a menu that silently cannot open.
 *
 * ## Why the deprecated API
 *
 * `UNSTABLE_portalContainer` is marked `@deprecated` in
 * `react-aria-components@1.20.0`, pointing at a `UNSAFE_PortalProvider` that
 * does the same job through context. That provider is **not reachable from this
 * package**: it is exported by `react-aria`, which is a transitive dependency of
 * `react-aria-components` rather than a direct one, and pnpm's strict linking
 * makes it unresolvable from `packages/react` (verified — `require.resolve` on
 * `react-aria` throws `MODULE_NOT_FOUND` here). Reaching it would mean taking a
 * second React Aria package as a direct dependency whose version has to track
 * RAC's exactly, to get an API whose stability marker is `UNSAFE_` rather than
 * `UNSTABLE_`. That trade is worse, and it is a dependency decision rather than
 * a design one.
 *
 * The deprecation redirects to a different spelling of the same capability, not
 * away from the capability. When it does move, this file and two call sites
 * change.
 */
export const OverlayPortalContext = createContext<Element | undefined>(undefined);

/**
 * The portal container for an overlay rendered at this point in the tree.
 *
 * Returns `undefined` outside a `Dialog`, which is what leaves React Aria's own
 * default in place.
 */
export function useOverlayPortalContainer(): Element | undefined {
  return useContext(OverlayPortalContext);
}
