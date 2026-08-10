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
