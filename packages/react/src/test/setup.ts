import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(globalThis, "matchMedia", {
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }),
});

/*
 * jsdom ships `sessionStorage` here but not `localStorage`: Node has its own
 * experimental `localStorage` global, unavailable unless the process was started
 * with `--localstorage-file`, and it collides with the one jsdom would install.
 * Components read storage through `window` and survive its absence — every
 * access is inside a try/catch, because a browser blocking storage is a real
 * state — but a test asserting what was persisted needs somewhere to persist to.
 */
if (!window.localStorage) {
  const entries = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      get length() {
        return entries.size;
      },
      clear: () => entries.clear(),
      getItem: (key: string) => entries.get(String(key)) ?? null,
      key: (index: number) => [...entries.keys()][index] ?? null,
      removeItem: (key: string) => void entries.delete(String(key)),
      setItem: (key: string, value: string) => void entries.set(String(key), String(value)),
    },
  });
}

if (!globalThis.PointerEvent) {
  Object.defineProperty(globalThis, "PointerEvent", {
    configurable: true,
    value: MouseEvent,
  });
}

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

/*
 * jsdom 28 ships `HTMLDialogElement` with its `open` property and none of its
 * methods, so `showModal()` throws. This shim is the smallest thing that lets a
 * unit test drive the element: `open` tracks the attribute, and `close` and
 * `cancel` fire where the platform fires them, which is what `Dialog` listens
 * for.
 *
 * What it deliberately does *not* fake is the reason the component exists — the
 * top layer, the focus trap, inertness, and the `::backdrop`. None of those can
 * be shimmed honestly, so none of them is asserted here. They are verified in
 * the browser suite instead, against a real Chromium, and that split is the
 * point: a passing unit test must not be able to claim a guarantee jsdom is
 * incapable of providing.
 */
if (!HTMLDialogElement.prototype.showModal) {
  const setOpen = (dialog: HTMLDialogElement, open: boolean) => {
    if (open) dialog.setAttribute("open", "");
    else dialog.removeAttribute("open");
  };

  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    setOpen(this, true);
  };

  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    setOpen(this, true);
  };

  HTMLDialogElement.prototype.close = function close(
    this: HTMLDialogElement,
    returnValue?: string,
  ) {
    if (!this.hasAttribute("open")) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    setOpen(this, false);
    this.dispatchEvent(new Event("close"));
  };
}
