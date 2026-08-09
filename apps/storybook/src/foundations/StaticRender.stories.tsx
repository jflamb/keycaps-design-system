import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import staticCss from "../../../../packages/react/src/static.css?raw";

/**
 * The two halves of ADR 0002's structural guarantee, rendered side by side over
 * two stories.
 *
 * Both stories render the *same* hand-authored markup: the exact attribute set
 * `renderToStaticMarkup` produces for a Keycaps component, with none of React
 * Aria's runtime data attributes, because nothing is running to put them there.
 *
 * - **Inert** loads `styles.css` only, which is what the preview frame already
 *   imports. The keys render correctly at rest and do nothing on hover, press,
 *   or focus.
 * - **Live** additionally injects `static.css`, which is what a Mode 1 prerender
 *   path imports. The same markup becomes a working key.
 *
 * The pair is the point. If someone ever "helpfully" moves a `:hover` rule into
 * `styles.css`, the first story starts reacting — and the e2e suite fails on it
 * rather than a consumer discovering that hand-authored `.kc-button` markup
 * suddenly looks supported.
 */
const meta = {
  title: "Foundations/Static render",
  parameters: {
    docs: {
      description: {
        component: [
          "Two stories carrying identical hand-authored markup, under two different stylesheet sets.",
          "",
          "`packages/react/src/styles.css` expresses every interactive state through React Aria's data attributes — `[data-hovered]`, `[data-pressed]`, `[data-focus-visible]` — and contains no `:hover`, `:active`, or `:focus-visible` rule. Statically rendered output carries none of those attributes, so a Mode 1 page needs the real pseudo-classes. They ship separately as `@jflamb/keycaps-react/static.css`, imported only by a prerender path.",
          "",
          "Adding them to `styles.css` instead would also make hand-authored markup work — which is the delivery model ADR 0002 rejected, and the one that produced `ledger.css`. Keeping them apart means the guarantee is structural rather than documentary: there is nothing to enforce, because there is nothing to forget.",
          "",
          "`Select` and `Popover` appear in neither file. Their behavior cannot degrade to CSS, and `renderStatic` throws rather than letting one onto a page that ships no JavaScript.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The markup a Mode 1 prerender emits, minus React Aria's runtime state
 * attributes. Written by hand here rather than rendered, because the whole point
 * is what happens when no React is attached.
 */
function StaticMarkupSample({ mode }: { mode: "inert" | "live" }) {
  return (
    <div className="kc-story-section" data-static-mode={mode}>
      <p className="kc-story-lede">
        {mode === "inert"
          ? "styles.css only. Hover, press, and focus these — nothing happens. That is the guarantee."
          : "styles.css plus static.css. The same markup, now a working key."}
      </p>
      <div className="kc-story-stack">
        <button
          className="kc-button"
          data-size="medium"
          data-static-probe={mode}
          data-variant="primary"
          type="button"
        >
          Get started
        </button>
        <button className="kc-button" data-size="medium" data-variant="secondary" type="button">
          Read the docs
        </button>
        <button className="kc-button" data-size="medium" data-variant="danger" type="button">
          Delete zone
        </button>
        <a className="kc-button" data-size="medium" data-variant="quiet" href="#static-render">
          Learn more
        </a>
      </div>
      <label className="kc-field" style={{ display: "grid" }}>
        <span className="kc-field__label">Zone name</span>
        <input className="kc-field__input" defaultValue="jflamb.com" />
      </label>
    </div>
  );
}

/**
 * Hand-authored `.kc-` markup under `styles.css` alone. Correct at rest,
 * completely inert on interaction — which is what makes hand-authoring an
 * unsupported path in practice rather than only in a document.
 */
export const HandAuthoredMarkupIsInert: Story = {
  render: () => <StaticMarkupSample mode="inert" />,
};

/**
 * The same markup with `static.css` also loaded. Hover warms the face, `:active`
 * travels 3px while the wall compresses to 1px, and `:focus-visible` rings at
 * 3px and 3px offset — the same values, from the same tokens, as the React path.
 *
 * The stylesheet is injected on mount and removed on unmount, so it does not
 * leak into the story beside it.
 */
export const StaticCssRestoresTheStates: Story = {
  render: function Render() {
    useEffect(() => {
      const element = document.createElement("style");
      element.dataset.kcStaticCss = "true";
      element.textContent = staticCss;
      document.head.append(element);
      return () => element.remove();
    }, []);

    return <StaticMarkupSample mode="live" />;
  },
};
