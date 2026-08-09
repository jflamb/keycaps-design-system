import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Progress & meter",
  parameters: {
    docs: {
      description: {
        component: [
          "The two native gauge elements, which an article needs far more often than an app does — a coverage figure, a budget consumed, a quota.",
          "",
          "They are different things and are colored differently on purpose. `progress` reports how far along a task is and takes the mint accent; `meter` reports a measurement against a range and speaks in the status tones, so the same mint, mustard, and red a Banner uses for the same three verdicts.",
          "",
          "Neither element exposes its own value to a sighted reader, so the number beside it is not decoration — it is the only place the value is legible without hovering.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Progress: Story = {
  render: () => (
    <Prose>
      <h2>Migration status</h2>

      <div className="kc-prose__gauge">
        <label htmlFor="progress-tokens">Call sites moved to `--kc-*`</label>
        <progress id="progress-tokens" max={100} value={72} />
        <span className="kc-prose__gauge-value">72 of 100</span>
      </div>

      <div className="kc-prose__gauge">
        <label htmlFor="progress-scan">Scanning the remaining packages</label>
        <progress id="progress-scan" />
        <span className="kc-prose__gauge-value">Working…</span>
      </div>

      <p>
        The indeterminate bar animates its stripes. Under reduced motion it holds
        still — <code>base.css</code> collapses every animation in the document
        when the preference is set, so this stylesheet carries no branch for it.
      </p>
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both bars are labelled, which is the whole accessible name — neither
    // element announces its own purpose.
    expect(
      canvas.getByRole("progressbar", { name: /call sites moved/i }),
    ).toBeVisible();
  },
};

export const Meter: Story = {
  render: () => (
    <Prose>
      <h2>Contrast headroom by surface</h2>

      <div className="kc-prose__gauge">
        <label htmlFor="meter-body">Body text on the plate</label>
        <meter
          high={7}
          id="meter-body"
          low={4.5}
          max={21}
          optimum={21}
          value={10.4}
        />
        <span className="kc-prose__gauge-value">10.4 : 1</span>
      </div>

      <div className="kc-prose__gauge">
        <label htmlFor="meter-muted">Muted text on a raised surface</label>
        <meter
          high={7}
          id="meter-muted"
          low={4.5}
          max={21}
          optimum={21}
          value={5.8}
        />
        <span className="kc-prose__gauge-value">5.8 : 1</span>
      </div>

      <div className="kc-prose__gauge">
        <label htmlFor="meter-fail">A value below the AA floor</label>
        <meter
          high={7}
          id="meter-fail"
          low={4.5}
          max={21}
          optimum={21}
          value={3.2}
        />
        <span className="kc-prose__gauge-value">3.2 : 1</span>
      </div>

      <p>
        The bar color follows <code>low</code>, <code>high</code>, and{" "}
        <code>optimum</code> — the browser decides which of the three tones
        applies, and the stylesheet only says what each tone looks like. The
        number beside each bar is what makes the reading available without color.
      </p>
    </Prose>
  ),
};
