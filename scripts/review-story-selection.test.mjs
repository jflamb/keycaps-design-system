import assert from "node:assert/strict";
import test from "node:test";
import { selectReviewStories } from "./review-story-selection.mjs";

const entries = [
  { id: "components-button--primary", type: "story", importPath: "./src/Button.stories.tsx" },
  { id: "components-input--default", type: "story", importPath: "./src/Input.stories.tsx" },
  { id: "components-dialog--default", type: "story", importPath: "./src/Dialog.stories.tsx" },
  { id: "components-select--default", type: "story", importPath: "./src/Select.stories.tsx" },
  { id: "components-data-table--wide-and-scrolling", type: "story", importPath: "./src/DataTable.stories.tsx" },
  { id: "foundations-component-showcase--default", type: "story", importPath: "./src/Showcase.stories.tsx" },
  { id: "components-app-shell--default", type: "story", importPath: "./src/AppShell.stories.tsx" },
];

for (const shared of [
  "packages/react/src/styles.css",
  "packages/react/src/utils.ts",
  "packages/react/src/icons.tsx",
  "packages/react/src/index.ts",
  "apps/storybook/src/prose/prose.tsx",
]) {
  test(`shared UI change selects all stories: ${shared}`, () => {
    const result = selectReviewStories(entries, [shared]);
    assert.equal(result.selectionMode, "all-stories");
    assert.equal(result.selected.length, entries.length);
  });
}

test("direct component change selects its story", () => {
  const result = selectReviewStories(entries, ["packages/react/src/components/Button.tsx"]);
  assert.deepEqual(result.selected.map((entry) => entry.id), ["components-button--primary"]);
});

test("documentation-only change uses the bounded representative baseline", () => {
  const result = selectReviewStories(entries, ["README.md"]);
  assert.equal(result.selectionMode, "representative-baseline");
  assert.equal(result.selected.length, 4);
});
