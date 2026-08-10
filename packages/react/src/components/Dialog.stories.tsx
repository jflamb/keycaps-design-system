import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./Button.js";
import { Dialog, type DialogProps } from "./Dialog.js";
import { Field } from "./Field.js";
import { Select } from "./Select.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

/**
 * A trigger and a controlled dialog, which is what every real use of this
 * component looks like.
 *
 * `startOpen` is wired to the view mode rather than hard-coded. On a docs page
 * the dialog starts closed, because a modal that opens itself over the
 * documentation covers the documentation. In `viewMode=story` — which is how the
 * browser suite reaches these — it starts open, so a test can assert an initial
 * state without a `play` function having to produce it first.
 */
function DialogDemo({
  children,
  startOpen,
  triggerLabel,
  ...props
}: Omit<DialogProps, "isOpen" | "onOpenChange"> & {
  children: ReactNode;
  startOpen: boolean;
  triggerLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <>
      <Button onPress={() => setIsOpen(true)} variant="secondary">
        {triggerLabel}
      </Button>
      <Dialog {...props} isOpen={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Dialog>
    </>
  );
}

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    kcCanvas: "drop",
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A modal, and the drawer is the same object at a different placement.",
          "",
          "### It is a native `<dialog>`, opened with `showModal()`",
          "",
          "That is where inertness, the focus trap, Escape, and top-layer stacking come from, and none of them is something a component should be re-implementing. `retirement-dashboard` already reached this conclusion — three `<dialog>` elements, all opened with `showModal()`. `assistant-workbench` hand-rolls `<div role=\"dialog\" aria-modal=\"true\">` over a hidden backdrop and re-implements a strict subset: Escape and initial focus, with **no inertness and no focus trap at all**. So this is not Keycaps choosing between two looks; it is one repo having the platform and the other having part of it.",
          "",
          "It is also why `renderStatic` throws on it. The component contract carries an exception for a platform element that provides the whole behavior with no runtime, and `Disclosure` took it — but a `<dialog>` needs a `showModal()` call, so it cannot open without a runtime. A modal that cannot open is not a degraded dialog, and the Mode 1 exclusion belongs in the build rather than in a note.",
          "",
          "### A Select or a Popover inside it works, and that took deliberate effort",
          "",
          "`showModal()` puts the dialog in the top layer and makes everything outside it inert. React Aria portals its overlays to `document.body` by default, so a `Select` inside a native `<dialog>` is portalled *outside* it — where it paints under the scrim and cannot be opened at all. Both dialogs this component replaces hold exactly that kind of content: RD's Tiller picker is a chooser, AW's approval dialog carries a form.",
          "",
          "The system solves it between its own parts. `Dialog` publishes its element on a context; `Popover` and `Select` read it and portal themselves into the dialog. A consumer writes `<Dialog><Select …/></Dialog>` and passes nothing. The alternative was a prop on every nested overlay, and a carrier a caller can forget to pass is not a carrier — the failure it would leak is a menu that silently never opens.",
          "",
          "### The drawer is a `placement` prop",
          "",
          "RD's `.assumptions-drawer` is this same `<dialog>` pinned to the inline-end edge at full height — `margin: 0 0 0 auto`, `height: 100%`, `width: min(560px, 100%)`. That is geometry, not a second component. Keycaps states it logically, so it flips for RTL, which RD's physical `margin-left` does not.",
          "",
          "### The head holds still",
          "",
          "The body is the scroll container, so the head and the footer are flex items that do not shrink. RD makes its head `position: sticky` to reach the same guarantee from a whole-panel scroll; AW scrolls the whole panel including its header, so its close control leaves the viewport in a long dialog.",
          "",
          "### Depth, radius, and the scrim",
          "",
          "Under the Overlay Exception Rule a dialog is genuinely detached, so it casts `--kc-shadow-overlay` in both themes. AW's panel takes `--shadow-plate`, which is `none` in dark, so its dialogs have no depth in dark mode at all. It takes `--kc-radius-plate`, because a dialog is a plate that has detached — the same sentence that puts its title in the display face.",
          "",
          "Neither repo's scrim survives: both are raw literals. The token layer shipped no scrim at all, so this component adds `--kc-color-scrim` in both themes. What survives from the repos is the alpha — they picked different colours and the same 0.68 without coordinating.",
          "",
          "### Scroll locking",
          "",
          "A native `<dialog>` does not lock the page behind it. This one does, compensating exactly for the scrollbar it removes so the page does not jump sideways as the dialog opens — and only when a scrollbar was really there.",
        ].join("\n"),
      },
    },
  },
  args: {
    title: "Delete this plan",
    isOpen: true,
    onOpenChange: () => {},
  },
  argTypes: {
    placement: {
      description:
        "Where the dialog sits. `inline-end` and `inline-start` are the drawer — the same dialog pinned to one edge at full height.",
      control: "inline-radio",
      options: ["center", "inline-end", "inline-start"],
      table: { defaultValue: { summary: '"center"' } },
    },
    isDismissable: {
      description:
        "Whether Escape and a press on the scrim close the dialog. The close control stays either way — a modal with no way out is a trap.",
      control: "boolean",
      table: { defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The plain modal: a title, a body, and two actions. */
export const Default: Story = {
  render: (_args, context) => (
    <DialogDemo
      description="This removes the plan and every scenario saved against it."
      footer={
        <>
          <Button variant="secondary">Keep it</Button>
          <Button variant="danger">Delete plan</Button>
        </>
      }
      startOpen={context.viewMode !== "docs"}
      title="Delete this plan"
      triggerLabel="Delete plan"
    >
      <p>
        Deleting a plan cannot be undone. Any scenarios saved against it are
        removed at the same time.
      </p>
    </DialogDemo>
  ),
};

/**
 * The case that decided the architecture: a chooser inside a modal. The menu has
 * to open, be clickable, and paint above the scrim — which it only does because
 * `Select` portals itself into the dialog rather than into `document.body`.
 */
export const WithAChooser: Story = {
  render: (_args, context) => (
    <DialogDemo
      description="Pick the spreadsheet this dashboard reads from."
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button>Connect</Button>
        </>
      }
      startOpen={context.viewMode !== "docs"}
      title="Connect a spreadsheet"
      triggerLabel="Connect a spreadsheet"
    >
      <Select
        label="Spreadsheet"
        options={[
          { id: "household", label: "Household budget" },
          { id: "retirement", label: "Retirement plan", description: "Last synced yesterday" },
          { id: "cashflow", label: "Cash flow" },
        ]}
      />
      <Field label="Sheet name" description="The tab the transactions live on." />
    </DialogDemo>
  ),
};

/** The drawer. The same dialog, pinned to the inline-end edge at full height. */
export const Drawer: Story = {
  render: (_args, context) => (
    <DialogDemo
      description="These feed every projection on the page."
      placement="inline-end"
      startOpen={context.viewMode !== "docs"}
      title="Assumptions"
      triggerLabel="Edit assumptions"
    >
      <Field label="Inflation" description="Annual, as a percentage." />
      <Field label="Real return" description="After inflation, as a percentage." />
      <Field label="Retirement age" />
    </DialogDemo>
  ),
};

/**
 * A body long enough to scroll. The head and the footer hold still while it
 * does, so the close control is reachable at every scroll offset.
 */
export const LongBody: Story = {
  render: (_args, context) => (
    <DialogDemo
      description="Everything this plan assumes, in the order it applies them."
      footer={<Button variant="secondary">Close</Button>}
      startOpen={context.viewMode !== "docs"}
      title="Model notes"
      triggerLabel="Read model notes"
    >
      {Array.from({ length: 14 }, (_, index) => (
        <p key={index}>
          Assumption {index + 1}. Returns are modelled net of fees and before tax,
          and the sequence is drawn from the historical record rather than
          sampled independently each year.
        </p>
      ))}
    </DialogDemo>
  ),
};

/**
 * A dialog the reader has to answer. Escape and the scrim do nothing; the close
 * control stays, because a modal with no way out is a trap.
 */
export const NotDismissable: Story = {
  render: (_args, context) => (
    <DialogDemo
      description="Your changes have not been saved."
      footer={
        <>
          <Button variant="secondary">Discard</Button>
          <Button>Save and close</Button>
        </>
      }
      isDismissable={false}
      startOpen={context.viewMode !== "docs"}
      title="Save before leaving?"
      triggerLabel="Leave without saving"
    >
      <p>Saving keeps the assumptions you edited. Discarding returns them to their last saved values.</p>
    </DialogDemo>
  ),
};

/**
 * Opening from a trigger and closing returns focus to it. Performed rather than
 * asserted in prose.
 *
 * **Escape is deliberately not exercised here.** A native `<dialog>` closes on a
 * *trusted* key event — the browser's close-request machinery — and
 * `userEvent.keyboard("{Escape}")` dispatches a synthetic one, which it ignores.
 * That is a genuine difference from `Popover`, whose Escape is React Aria's own
 * `keydown` handler and does respond to a synthetic event. Asserting it here
 * would have been asserting something that cannot happen, so Escape is covered
 * in the Playwright suite, where the key press is real.
 */
export const ClosingReturnsFocus: Story = {
  render: () => (
    <DialogDemo startOpen={false} title="Export data" triggerLabel="Export data">
      <p>Choose a format and a date range.</p>
    </DialogDemo>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Export data" });

    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAccessibleName("Export data");

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    );
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
