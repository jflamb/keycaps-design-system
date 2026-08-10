import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "./Badge.js";
import { Disclosure } from "./Disclosure.js";
import { Field } from "./Field.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Disclosure",
  component: Disclosure,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A summary you can press, and the content it was hiding.",
          "",
          "### Why it exists",
          "",
          "Thirteen disclosures across three repos, behind nine class names. `retirement-dashboard` alone ships five treatments — `.data-source-disclosure`, `.tl-row`, `.drawer-disclosure`, `.assistant-privacy`, `.tiller-picker-*` — and draws the chevron three different ways: a 7px square with two 2px borders rotated 45°, the same square again with one extra declaration, and a `›` character in a `<span aria-hidden=\"true\">` set at `--text-3xl` and rotated 90°. Six of the thirteen have no custom affordance at all and ship the browser's own marker, which is exactly the thing the other seven set `list-style: none` to remove.",
          "",
          "None of the thirteen has a bottom edge, and none of them travels.",
          "",
          "### It is the same disclosure `prose.css` styles — the same rule",
          "",
          "Not a matching one. Every selector in the treatment names both `.kc-prose summary` and `.kc-disclosure > summary`, in one block in `base.css`, so the article's disclosure and the product's are one declaration set that cannot drift. The data table shipped as two parallel blocks with a test comparing them; this one removes the second block instead.",
          "",
          "`DESIGN.md` had already decided the look, by name: under the Pressable Edge Rule a `summary` takes input, so it owes travel and a wall — 3px down, 4px compressing to 1px, from the same tokens a Button reads. The press is implemented differently from the Button's, though. A Button pins its border box with `min-block-size`; a summary wraps to as many lines as its label needs and has no fixed height to pin, so the padding does that job instead. The edge gives up exactly what the padding takes, over the same duration, and the border box is the same height on every frame.",
          "",
          "### Native `<details>`, deliberately",
          "",
          "React Aria ships a `Disclosure` and this does not use it. That would put the open state in a client runtime, and this component is the only remaining Tier 2 entry the two Mode 1 repos could ever use — a version that rendered a dead key into static markup would be worse than none. The platform element brings the press, the keyboard, the announcement, and `name`-based exclusive grouping, all with no JavaScript.",
          "",
          "The consequence is that its treatment lives in `base.css` rather than `styles.css`. `styles.css` is data-attribute-only so hand-authored `.kc-` markup is visibly inert; a `<details>` breaks that rule's premise rather than the rule, because its press belongs to the browser and hand-authored markup genuinely works. So `styles.css` gains nothing from this component, and `static.css` gains nothing either — there is no state for a prerender path to restore. `SkipLink` is the only other component in the system that works this way.",
          "",
          "### What it deliberately does not do",
          "",
          "There is no controlled `open` prop. `<details>` owns its own state, which is what lets it work with no JavaScript, and all thirteen consumer uses set an initial state rather than driving one. `onToggle` is there for an app that needs to know.",
          "",
          "`assistant-workbench`'s body rule does not survive the migration: `.technical-detail p` carries a `border-left: 2px solid var(--divider)`. Under the Leading Edge Rule a weighted inline-start border marks a block quoted from or attributed to something outside the flow, and a disclosure's own body is not quoted from anywhere — it is the thing the summary promised. It is also `border-left` rather than `border-inline-start`, so it never flipped for RTL.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    summary: {
      description: "The key's label — the question, or the name of what is behind it.",
      control: "text",
    },
    description: {
      description:
        "A second line under the label, for what the reader needs in order to decide whether to open it.",
      control: "text",
    },
    defaultOpen: {
      description:
        "Whether it starts open. There is no controlled counterpart: `<details>` owns its own state, which is what makes it work with no JavaScript.",
      control: "boolean",
    },
    name: {
      description:
        "Groups siblings into an exclusive accordion. A pass-through to the native attribute, so it costs no runtime.",
      control: "text",
    },
  },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The plain shape: a question, and the answer folded behind it.
 *
 * Press and hold it. The cap descends 3px while its wall compresses from 4px to
 * 1px, so the border box is the same height on every frame and the paragraph
 * below never moves — the same physics a Button has, arrived at differently
 * because a summary has no fixed height to pin.
 */
export const Default: Story = {
  args: { summary: "What does the token layer set on the root element?" },
  render: (args) => (
    <Disclosure {...args}>
      <p>
        Nothing, unless the app wants an explicit choice. Keycaps follows the
        system color scheme and the system motion preference by default;{" "}
        <code>data-theme</code> and <code>data-kc-motion</code> override them.
      </p>
    </Disclosure>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByText(
      "What does the token layer set on the root element?",
    );
    // The native element is the whole behavior: no runtime state, no
    // `aria-expanded` to keep in step, and this works identically on a page
    // that ships no JavaScript at all.
    await expect(summary.closest("details")).not.toHaveAttribute("open");
    await userEvent.click(summary);
    await expect(summary.closest("details")).toHaveAttribute("open");
  },
};

/**
 * The two-slot summary, which is the one API decision the survey made rather
 * than the designer: `knowledge` and `retirement-dashboard` independently wrote
 * the same `<span>` label with a `<small>` under it, without coordinating.
 *
 * Under it rather than beside it, which is where both repos put it and where
 * neither survives 320 CSS pixels — one gives the second slot a fixed 250px
 * column and the other an `auto` one, and both squeeze the label to nothing on a
 * narrow viewport. A description wraps; a column does not.
 */
export const WithDescriptions: Story = {
  args: { summary: "Household goals" },
  render: (args) => (
    <div style={{ display: "grid", gap: "0.75rem", maxInlineSize: "34rem" }}>
      <Disclosure
        {...args}
        description="Success, spending, family, survivor, and safety reserve"
      >
        <p>Four controls, each with a documented default.</p>
      </Disclosure>
      <Disclosure
        summary="Retirement timing"
        description="Who retires when, and when Social Security begins"
      >
        <p>Changing either shifts every year in the projection.</p>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The description is a `<small>` rather than a class, so an article writing
    // the same two-slot summary by hand gets the same treatment from the same
    // rule.
    const description = canvas.getByText(
      "Success, spending, family, survivor, and safety reserve",
    );
    await expect(description.tagName).toBe("SMALL");
  },
};

/**
 * `name` groups siblings into an exclusive accordion: opening one closes the
 * rest. It is a pass-through to the native attribute, so the behavior costs no
 * JavaScript and works on a statically rendered page.
 *
 * This is `retirement-dashboard`'s assumptions drawer, which already groups four
 * sections this way — a functional difference rather than a visual one, which is
 * what makes it a prop rather than a variant.
 */
export const ExclusiveGroup: Story = {
  args: { summary: "Household goals", name: "assumption-section" },
  render: (args) => (
    <div style={{ display: "grid", gap: "0.75rem", maxInlineSize: "34rem" }}>
      <Disclosure {...args} defaultOpen description="Success, spending, and survivor cover">
        <Field defaultValue="85%" label="Modeled success floor" />
      </Disclosure>
      <Disclosure
        name={args.name}
        summary="Stress tests"
        description="A 2008 sequence starting the year after the exit"
      >
        <p>Three scenarios run against the same assumptions.</p>
      </Disclosure>
      <Disclosure
        name={args.name}
        summary="Advanced model"
        description="Returns, spending policy, gifts, and Roth conversions"
      >
        <p>Changing these invalidates any saved snapshot.</p>
      </Disclosure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("Household goals").closest("details")!;
    const second = canvas.getByText("Stress tests");
    await expect(first).toHaveAttribute("open");
    await userEvent.click(second);
    // The browser closed the first one. Nothing in this file did.
    await expect(second.closest("details")).toHaveAttribute("open");
    await expect(first).not.toHaveAttribute("open");
  },
};

/**
 * A disclosure holding whole components rather than a paragraph — which is what
 * `assistant-workbench`'s "Technical details" and `retirement-dashboard`'s
 * assumption drawers actually contain.
 *
 * The body takes the summary's inline padding so its content lines up with the
 * label above it, and the last child's bottom margin is dropped so the open
 * panel does not end in a gap.
 */
export const RichBody: Story = {
  args: { summary: "Technical details", description: "Request payload and routing" },
  render: (args) => (
    <div style={{ maxInlineSize: "34rem" }}>
      <Disclosure {...args} defaultOpen>
        <p>
          <Badge icon tone="warning">
            Awaiting approval
          </Badge>
        </p>
        <Field defaultValue="req_5308874" label="Correlation id" />
      </Disclosure>
    </div>
  ),
};

/**
 * Opening a long disclosure is where the animation earns its place:
 * `::details-content` is what lets a native `<details>` animate on every open
 * *and* close rather than only the first expansion. A browser without it keeps
 * the instant native toggle, which is a fine outcome rather than a broken one,
 * and under reduced motion the whole thing collapses from the token layer with
 * no branch in any component.
 */
export const LongBody: Story = {
  args: { summary: "Why is the press transform-only?" },
  render: (args) => (
    <div style={{ maxInlineSize: "34rem" }}>
      <Disclosure {...args}>
        <p>
          Animating the box height holds the outer boundary still on paper and in
          practice relayouts every frame. In a container that centers its items
          the key re-centers as it shrinks: measured as a 1.1px upward flick
          followed by a slide landing 1.5px low. A wobble, not a press.
        </p>
        <p>
          The summary reaches the same place from the other side. It has no fixed
          height to pin, so the padding gives up exactly what the edge takes and
          the border box holds still while the key travels.
        </p>
      </Disclosure>
      <p>This paragraph is the test. Hold the key down: it should not move.</p>
    </div>
  ),
};
