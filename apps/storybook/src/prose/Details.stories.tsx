import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Details",
  parameters: {
    docs: {
      description: {
        component: [
          "A native `<details>` disclosure, and the one element in the prose stylesheet that genuinely is a control.",
          "",
          "That matters, because it is what earns the keycap's bottom edge. Under the Pressable Edge Rule the edge is a promise that the object travels when activated, and `summary` keeps it — 3px down, 4px compressing to 1px, from the same tokens a Button reads.",
          "",
          "The press is implemented differently than the Button's, though. A Button pins its border box with `min-block-size` and lets the compressing wall redistribute space inside it; a `summary` wraps to as many lines as its label needs and has no fixed height to pin. So the padding does that job instead: the edge gives up exactly what the padding takes, over the same duration, and the border box is the same height on every frame. Nothing below the disclosure reflows while the key is down.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Prose>
      <h2>Press one and watch the paragraph below it</h2>
      <details>
        <summary>Why is the press transform-only?</summary>
        <p>
          Animating the box height holds the outer boundary still on paper and in
          practice relayouts every frame. In a container that centers its items
          the key re-centers as it shrinks: measured as a 1.1px upward flick
          followed by a slide landing 1.5px low. A wobble, not a press.
        </p>
      </details>
      <details>
        <summary>
          Does the chevron still turn when the reader asks for reduced motion?
        </summary>
        <p>
          No. <code>--kc-chevron-open-turn</code> resolves to <code>0deg</code>,
          the same token the Select trigger reads, and the whole substitution
          lives in the token layer. The open state stays legible either way —
          the content below is the signal and the rotation is the flourish.
        </p>
      </details>
      <p>
        This paragraph is the test. Hold a disclosure down: it should not move.
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("Why is the press transform-only?");
    await userEvent.click(first);
    expect(first.closest("details")).toHaveAttribute("open");
  },
};

/**
 * The shape most documentation actually needs: a run of questions, each one
 * closed until asked for. Grouping them in a section with a heading keeps the
 * page outline honest — a disclosure is not a heading, and screen reader users
 * navigating by heading would otherwise find nothing here.
 */
export const QuestionList: Story = {
  render: () => (
    <Prose aria-labelledby="faq-title">
      <h2 id="faq-title">Adopting the token layer</h2>

      <details>
        <summary>Can I use the tokens without React?</summary>
        <p>
          Yes. <code>@jflamb/keycaps-tokens</code> is plain CSS and plain custom
          properties with no framework dependency, and it is the layer that
          carries both themes, forced colors, and the motion contract.
        </p>
      </details>

      <details>
        <summary>What does a consuming app have to set on the root?</summary>
        <p>
          Nothing, unless it wants an explicit choice. Keycaps follows the system
          color scheme and the system motion preference by default;{" "}
          <code>data-theme</code> and <code>data-kc-motion</code> override them,
          and both belong on the root element and nowhere else.
        </p>
      </details>

      <details>
        <summary>Is the prose stylesheet part of the default import?</summary>
        <p>
          No. It is an opt-in subpath, because a product surface that renders no
          articles should not pay for it. Everything in it is scoped to{" "}
          <code>.kc-prose</code>, so importing it changes nothing until that
          class appears.
        </p>
      </details>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The section keeps a real heading, so heading navigation still works even
    // though every question below it is a summary rather than an h3.
    expect(
      canvas.getByRole("heading", { level: 2, name: /adopting the token layer/i }),
    ).toBeVisible();
  },
};
