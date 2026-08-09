import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { CodeBlock, CodeToken } from "./CodeBlock";

const RELEASE_STATUS_LINK =
  '<a href="./?path=/docs/foundations-release-status--guidance" target="_top">Release status</a>';

const meta = {
  title: "Components/Code block",
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component: [
          `<span class="kc-badge" data-tone="warning">Experimental</span> See ${RELEASE_STATUS_LINK} for what that covers.`,
          "",
          "A block of code. Three consumer repos have one — `mcp-dnsimple`'s `.code-block` with hand-authored `.tk-*` spans, `mcp-unifi`'s `.prompt-transcript`, and `knowledge`'s fenced markdown. `prose.css` covers the article case only.",
          "",
          "The treatment is deliberately identical to `prose.css`'s `pre`: a code sample in a product surface and one in an article are the same thing, and the reader should not have to notice which page they are on. What the component adds is the two halves CSS cannot do on its own — the `tabindex=\"0\"` the Prose Markup Rule requires, because a block that scrolls and cannot be focused is a 2.1.1 failure, and a copy control whose visible state is real rather than a hover reveal.",
          "",
          "**No focus rule ships with this component.** `base.css` rings every `:focus-visible` at zero specificity, so the indicator arrives from the token layer in every delivery mode — including statically rendered markup that never loads the component stylesheet.",
        ].join("\n"),
      },
    },
  },
  args: {
    children: "npx @jflamb/mcp-dnsimple --transport stdio",
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: "Terminal",
    children: "npx @jflamb/mcp-dnsimple --transport stdio",
  },
};

/**
 * The copy control. It needs a client runtime and the async Clipboard API, so
 * leave it off on a Mode 1 page — a copy button with no React attached is a
 * control that silently does nothing, which is worse than not offering one.
 *
 * Supply `copyText` whenever the children are anything but a plain string.
 * There is no DOM read to fall back on, and a copy button that copies the wrong
 * thing is a bug nobody reports.
 */
export const Copyable: Story = {
  args: {
    label: "claude_desktop_config.json",
    copyable: true,
    children: "npx @jflamb/mcp-dnsimple --transport stdio",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Copy code" }),
    ).toBeVisible();
  },
};

/**
 * Four syntax roles, where a highlighter offers thirty, and only two of them are
 * colors.
 *
 * The plate stays quiet because the system spends color almost nowhere, and a
 * `pre` carrying five hues is the loudest thing on any page it appears on. So:
 * comments and punctuation recede to the muted ink, a string — usually the value
 * the reader is scanning for — takes the accent, and a keyword is carried by
 * weight rather than hue. Coral appears nowhere, because nothing in a code
 * sample commits to anything.
 *
 * `mcp-dnsimple` hand-authors `.tk-brace`, `.tk-str`, `.tk-key`, and
 * `.tk-comment` today, which is exactly this set.
 */
export const SyntaxTokens: Story = {
  args: {
    label: "claude_desktop_config.json",
    children: (
      <>
        <CodeToken kind="comment">{"// Add this to your MCP client config\n"}</CodeToken>
        <CodeToken kind="punctuation">{"{\n  "}</CodeToken>
        <CodeToken kind="keyword">{'"mcpServers"'}</CodeToken>
        <CodeToken kind="punctuation">{": {\n    "}</CodeToken>
        <CodeToken kind="keyword">{'"dnsimple"'}</CodeToken>
        <CodeToken kind="punctuation">{": {\n      "}</CodeToken>
        <CodeToken kind="keyword">{'"command"'}</CodeToken>
        <CodeToken kind="punctuation">{": "}</CodeToken>
        <CodeToken kind="string">{'"npx"'}</CodeToken>
        <CodeToken kind="punctuation">{",\n      "}</CodeToken>
        <CodeToken kind="keyword">{'"args"'}</CodeToken>
        <CodeToken kind="punctuation">{": ["}</CodeToken>
        <CodeToken kind="string">{'"@jflamb/mcp-dnsimple"'}</CodeToken>
        <CodeToken kind="punctuation">{"]\n    }\n  }\n}"}</CodeToken>
      </>
    ),
  },
};

/**
 * A transcript, which is what `mcp-unifi` uses its block for. Long prose lines
 * wrap rather than scroll, because a conversation read sideways is not a
 * conversation.
 */
export const Wrapped: Story = {
  args: {
    label: "Prompt",
    wrap: true,
    children:
      "Which of my access points is carrying the most clients right now, and is any of them close to its channel utilisation ceiling? If one is, tell me which band and what you would change.",
  },
};

/**
 * The focus contract. The block scrolls, so it has to be reachable by keyboard —
 * a scrollable region a keyboard cannot enter is a WCAG 2.1.1 failure, and long
 * code lines scroll by default.
 */
export const Focusable: Story = {
  args: {
    children:
      "curl -sS https://dnsimple.mcp.jflamb.com/mcp -H 'Accept: application/json, text/event-stream' -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
  },
  play: async ({ canvasElement }) => {
    const pre = canvasElement.querySelector(".kc-code__pre");
    await expect(pre).toHaveAttribute("tabindex", "0");
  },
};
