export function selectReviewStories(entries, changedFiles) {
  const stories = entries.filter(
    (entry) => entry && entry.type === "story" && typeof entry.id === "string",
  );
  const directComponent = /^packages\/react\/src\/components\/[^/]+\.(tsx|ts|css)$/;
  const storyFile = /\.stories\.(tsx|ts|jsx|js)$/;
  const globalSurfaceChanged = changedFiles.some((path) =>
    path.startsWith("packages/tokens/") ||
    (path.startsWith("packages/react/src/") && !directComponent.test(path)) ||
    path.startsWith("apps/storybook/.storybook/") ||
    (path.startsWith("apps/storybook/src/") && !storyFile.test(path)) ||
    path === "playwright.config.ts" ||
    path === "package.json" ||
    path === "pnpm-lock.yaml" ||
    path === "pnpm-workspace.yaml" ||
    path === "tests/e2e/review-affected.spec.ts" ||
    path.startsWith("scripts/select-review-stories.") ||
    path.startsWith("scripts/run-review."),
  );
  const componentNames = new Set(
    changedFiles
      .filter((path) => directComponent.test(path))
      .map((path) => path.split("/").at(-1).replace(/\.(tsx|ts|css)$/, "")),
  );
  const storyPathChanged = (importPath) => {
    const normalized = String(importPath).replace(/^\.\//, "");
    return changedFiles.some(
      (path) =>
        normalized.endsWith(path) ||
        path.endsWith(normalized) ||
        (path.includes(".stories.") &&
          normalized.endsWith(path.split("apps/storybook/").at(-1))),
    );
  };
  let selected = stories.filter((entry) => {
    if (globalSurfaceChanged) return true;
    if (storyPathChanged(entry.importPath)) return true;
    return [...componentNames].some((name) =>
      String(entry.importPath).endsWith(`/${name}.stories.tsx`),
    );
  });
  if (!selected.length) {
    const baseline = new Set([
      "foundations-component-showcase--default",
      "components-app-shell--default",
      "components-button--primary",
      "components-data-table--wide-and-scrolling",
    ]);
    selected = stories.filter((entry) => baseline.has(entry.id));
  }
  return {
    selected,
    globalSurfaceChanged,
    selectionMode: globalSurfaceChanged
      ? "all-stories"
      : componentNames.size > 0 || changedFiles.some((path) => path.includes(".stories."))
        ? "changed-stories"
        : "representative-baseline",
  };
}
