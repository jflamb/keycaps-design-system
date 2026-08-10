import {
  useCallback,
  useEffect,
  useId,
  useState,
  type DialogHTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./Button.js";
import { Icon } from "../icons.js";
import { OverlayPortalContext } from "../overlay-portal.js";
import { cx } from "../utils.js";

/**
 * Where the dialog sits, which is the whole of the difference between a modal
 * and a drawer.
 *
 * - `center` is the modal: a plate that has detached, capped at its own measure.
 * - `inline-end` and `inline-start` are the drawer: the same dialog pinned to
 *   one edge at full height.
 */
export type DialogPlacement = "center" | "inline-end" | "inline-start";

export interface DialogProps
  extends Omit<
    DialogHTMLAttributes<HTMLDialogElement>,
    "open" | "title" | "onClose" | "onCancel"
  > {
  /** Extra class names appended to `kc-dialog`. */
  className?: string;
  /**
   * Accessible name for the close control.
   *
   * @default "Close dialog"
   */
  closeLabel?: string;
  /** A second line under the title, for what the reader needs in order to act. */
  description?: ReactNode;
  /**
   * Actions, rendered in a footer that does not scroll with the body. Put the
   * committing action here, not in the body.
   */
  footer?: ReactNode;
  /**
   * Whether Escape and a press on the scrim close the dialog.
   *
   * Set it to `false` for a dialog the reader must answer rather than dismiss —
   * a destructive confirmation. The close control stays, because a modal with no
   * way out is a trap; what changes is that leaving becomes deliberate.
   *
   * @default true
   */
  isDismissable?: boolean;
  /** Whether the dialog is open. */
  isOpen: boolean;
  /**
   * Called with the new open state.
   *
   * Required, and controlled rather than uncontrolled, which is the opposite
   * choice `Disclosure` made and for the opposite reason. A `<details>` owns its
   * own state, which is exactly what lets it work with no JavaScript. A
   * `<dialog>` opens only when something calls `showModal()`, so there is a
   * runtime either way — and a modal whose open state the app cannot read is a
   * modal the app cannot drive.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Where the dialog sits. `inline-end` is the drawer.
   *
   * @default "center"
   */
  placement?: DialogPlacement;
  /**
   * The dialog's name, rendered as its heading and used as its accessible name.
   * Required — an unnamed modal is announced as nothing at all.
   */
  title: ReactNode;
}

/**
 * Locks the page behind an open dialog, and hands back the undo.
 *
 * A native `<dialog>` does not do this. It takes the top layer, it makes the
 * rest of the document inert, and it still lets the page scroll under the
 * pointer — which is the modal defect users actually report and nobody writes
 * down.
 *
 * The gutter compensation is the part worth reading. Hiding the overflow removes
 * the scrollbar, and on any platform drawing a classic scrollbar the page then
 * jumps sideways by its width at the moment the dialog opens. Measuring the
 * difference between the viewport and the document element compensates exactly,
 * and only when a scrollbar was really there: on a short page, or on a platform
 * with overlay scrollbars, the measurement is zero and nothing is added. A
 * blanket `scrollbar-gutter: stable` would have shifted the short page instead.
 *
 * The counter is for stacked dialogs — the second to open must not restore the
 * page when it closes, and the last one out has to restore what the first one
 * saw rather than what it left behind.
 */
let scrollLockCount = 0;
let releaseScrollLock: (() => void) | undefined;

function lockPageScroll(): () => void {
  if (scrollLockCount === 0) {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPadding = root.style.paddingInlineEnd;
    const gutter = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingInlineEnd = `${gutter}px`;

    releaseScrollLock = () => {
      root.style.overflow = previousOverflow;
      root.style.paddingInlineEnd = previousPadding;
    };
  }

  scrollLockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;
    if (scrollLockCount === 0) {
      releaseScrollLock?.();
      releaseScrollLock = undefined;
    }
  };
}

/**
 * A modal, and the drawer is the same object at a different placement.
 *
 * **It is a native `<dialog>` opened with `showModal()`, and that is the design
 * decision rather than an implementation one.** The platform element is where
 * inertness, the focus trap, Escape, and top-layer stacking come from, and none
 * of those is a thing a component should be re-implementing.
 * `retirement-dashboard` already reached this conclusion — three `<dialog>`
 * elements, all opened with `showModal()`. `assistant-workbench` hand-rolls
 * `<div role="dialog" aria-modal="true">` over a hidden backdrop and
 * re-implements a strict subset: Escape and initial focus, with **no inertness
 * and no focus trap at all**. So this is not Keycaps choosing between two looks;
 * it is one repo having the platform and the other having a subset of it.
 *
 * This is also the reason `renderStatic` throws on it. `docs/contributing/components.md`
 * contract 2 carries an exception for a platform element that provides the whole
 * behavior with no runtime, and `Disclosure` took it — but a `<dialog>` needs a
 * `showModal()` call, so it cannot open without a runtime, and a modal that
 * cannot open is not a degraded dialog. The Mode 1 exclusion belongs in the
 * build rather than in a note.
 *
 * **The drawer is a `placement` prop, not a sibling component.** RD's
 * `.assumptions-drawer` is this same `<dialog>` pinned to the inline-end edge at
 * full height. That is geometry, not a second component, and a sibling `Drawer`
 * is "close to never correct" by the Premises.
 *
 * **The head does not scroll.** RD makes its head `position: sticky` because its
 * whole dialog scrolls; this one is a flex column whose *body* is the scroll
 * container, so the head and footer simply stay where they are. Same guarantee —
 * the close control is reachable at every scroll offset — carried by layout
 * rather than by a sticky offset that has to be kept clear of the radius. AW
 * scrolls the whole panel, header included, so its close button leaves the
 * viewport in a long dialog.
 *
 * **A `Select` or a `Popover` inside it works**, which took deliberate effort
 * rather than falling out. See `overlay-portal.ts` for what `showModal()` does
 * to a portalled overlay and how the system answers it between its own parts.
 */
export function Dialog({
  children,
  className,
  closeLabel = "Close dialog",
  description,
  footer,
  isDismissable = true,
  isOpen,
  onOpenChange,
  placement = "center",
  title,
  ...props
}: DialogProps) {
  /*
   * A callback ref in state rather than a `useRef`, because the portal container
   * published below is derived from the element and has to re-render the
   * subtree once the element exists. A ref would hold the node without telling
   * anyone it arrived.
   */
  const [node, setNode] = useState<HTMLDialogElement | null>(null);

  /*
   * The name and the description are wired rather than assumed. A `<dialog>`
   * computes no accessible name from its contents, so a heading inside one is
   * just a heading — the association has to be explicit, and it is the component
   * that owns both ends of it.
   */
  const titleId = useId();
  const descriptionId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!node) return;

    if (isOpen) {
      if (!node.open) node.showModal();
      return lockPageScroll();
    }

    if (node.open) node.close();
    return undefined;
  }, [isOpen, node]);

  useEffect(() => {
    if (!node) return undefined;

    /*
     * `close` fires for every route out — the close key, Escape, a press on the
     * scrim, and our own `node.close()` above. Reporting unconditionally is what
     * keeps the prop and the element in step; when the element closed because
     * `isOpen` already went false, setting it false again is a no-op.
     */
    const onClose = () => close();

    /* Escape arrives as `cancel` before `close`, so this is where refusing it
       has to happen. */
    const onCancel = (event: Event) => {
      if (!isDismissable) event.preventDefault();
    };

    /*
     * A press on the scrim is reported against the `<dialog>` itself, because
     * the scrim is the element's own `::backdrop` and has no node of its own.
     * Comparing the target is most of the check; the rect comparison covers the
     * dialog's own box, and anything portalled into it — a Select's listbox —
     * is a descendant and never matches the target test at all.
     */
    const onPointerDown = (event: MouseEvent) => {
      if (!isDismissable || event.target !== node) return;
      const rect = node.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) close();
    };

    node.addEventListener("close", onClose);
    node.addEventListener("cancel", onCancel);
    node.addEventListener("pointerdown", onPointerDown);
    return () => {
      node.removeEventListener("close", onClose);
      node.removeEventListener("cancel", onCancel);
      node.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, isDismissable, node]);

  return (
    <dialog
      aria-describedby={description == null ? undefined : descriptionId}
      aria-labelledby={titleId}
      {...props}
      className={cx("kc-dialog", className)}
      data-placement={placement}
      ref={setNode}
    >
      {/*
        The context carries the element only while the dialog is open. Closed, it
        is `undefined` and a nested overlay portals wherever React Aria would
        have put it — which matters because the subtree stays mounted between
        opens.
      */}
      <OverlayPortalContext.Provider value={isOpen && node ? node : undefined}>
        <div className="kc-dialog__head">
          <div className="kc-dialog__heading">
            {/*
              `h2` rather than a level prop. A dialog is not in the page's
              outline — it replaces it while it is open — so the level is a
              constant here in a way it is not for `PageHeader`, where the
              surface genuinely decides.
            */}
            <h2 className="kc-dialog__title" id={titleId}>
              {title}
            </h2>
            {description == null ? null : (
              <p className="kc-dialog__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          {/*
            Rendered by construction rather than passed. Escape is the other way
            out and it is invisible; a caller who forgets the close control ships
            a dialog that looks inescapable, which is the same reasoning that
            makes the app shell render its own skip link.
          */}
          <Button
            aria-label={closeLabel}
            className="kc-dialog__close"
            iconOnly
            onPress={close}
            variant="quiet"
          >
            <Icon name="x" />
          </Button>
        </div>
        <div className="kc-dialog__body">{children}</div>
        {footer == null ? null : <div className="kc-dialog__footer">{footer}</div>}
      </OverlayPortalContext.Provider>
    </dialog>
  );
}
