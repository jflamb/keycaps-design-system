import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge.js";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Beta</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "Badge is a compact, non-interactive status or category label. Keep text short and always include words; color alone never carries meaning.",
          "",
          "A badge wears a uniform 1px border on all four sides and no weighted bottom edge. That is deliberate: under the Pressable Edge Rule an object with a heavier bottom border promises travel, and a badge never receives input.",
        ].join("\n"),
      },
    },
  },
  args: { children: "Beta", tone: "neutral" },
  argTypes: {
    children: {
      description:
        "The label. One or two words, and always words — the tone is a second carrier, never the only one.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="kc-story-stack" aria-label="Badge tones">
      <Badge>Draft</Badge>
      <Badge tone="info">In review</Badge>
      <Badge tone="success">Complete</Badge>
      <Badge tone="warning">Needs attention</Badge>
      <Badge tone="danger">Blocked</Badge>
    </div>
  ),
};

/**
 * The Tone Trio Rule's second carrier, finally implemented.
 *
 * The rule says every status tone needs a distinct icon *shape* — not the same
 * shape in a different color — so the distinction survives forced colors,
 * monochrome printing, and color vision deficiency. Until now the package
 * shipped two icons, neither of them a status, so the obligation had no
 * implementation on the component side.
 *
 * `icon` takes a boolean rather than a node on purpose: the shape is selected by
 * tone, so a warning cannot be given a check. These are the same four paths
 * `prose.css` masks for its callouts, so a warning in an article and a warning
 * on a badge are one glyph rather than two drawings of one idea.
 *
 * `neutral` has no shape of its own and renders none.
 */
export const WithToneIcon: Story = {
  render: () => (
    <div className="kc-story-stack" aria-label="Badge tones with icons">
      <Badge icon>Draft</Badge>
      <Badge icon tone="info">
        In review
      </Badge>
      <Badge icon tone="success">
        Complete
      </Badge>
      <Badge icon tone="warning">
        Needs attention
      </Badge>
      <Badge icon tone="danger">
        Blocked
      </Badge>
    </div>
  ),
};

/**
 * The 999px radius `DESIGN.md` describes as available and deliberately unused,
 * because "a pill reads as a floating token rather than a seated object."
 *
 * That reading is exactly why the shape is offered rather than left out. Two
 * consumers use a pill for a status that changes underneath the reader —
 * `assistant-workbench`'s `.status-pill` and `retirement-dashboard`'s
 * `.now-chip` — beside seated badges labelling things that do not move.
 * Floating is right for the first and wrong for the second, so the shape is
 * carrying a real distinction rather than a preference.
 *
 * The seated badge stays the default. Reach for the pill only when the thing it
 * labels is genuinely in motion.
 */
export const Pill: Story = {
  render: () => (
    <div className="kc-story-stack" aria-label="Pill badges">
      <Badge icon shape="pill" tone="success">
        Live
      </Badge>
      <Badge icon shape="pill" tone="warning">
        Syncing
      </Badge>
      <Badge icon shape="pill" tone="danger">
        Disconnected
      </Badge>
      <Badge shape="pill">Idle</Badge>
    </div>
  ),
};

/**
 * The two shapes together, which is the arrangement that decides whether the
 * pill was worth adding: a live connection state beside a fixed version label.
 */
export const ShapesTogether: Story = {
  render: () => (
    <div className="kc-story-stack" aria-label="Seated and floating badges">
      <Badge>v0.1.0</Badge>
      <Badge tone="info">Beta</Badge>
      <Badge icon shape="pill" tone="success">
        Connected
      </Badge>
    </div>
  ),
};
