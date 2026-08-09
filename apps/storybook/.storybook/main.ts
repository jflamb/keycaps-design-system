import type { StorybookConfig } from "@storybook/react-vite";

const favicon =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Crect%20width%3D%2232%22%20height%3D%2232%22%20rx%3D%227%22%20fill%3D%22%23f5f5f3%22%2F%3E%3Crect%20x%3D%226%22%20y%3D%228%22%20width%3D%2220%22%20height%3D%2217%22%20rx%3D%225%22%20fill%3D%22%238f2d1a%22%2F%3E%3Crect%20x%3D%226%22%20y%3D%228%22%20width%3D%2220%22%20height%3D%2214%22%20rx%3D%225%22%20fill%3D%22%23c7452c%22%2F%3E%3C%2Fsvg%3E";

/**
 * Storybook registers its own copy of Nunito Sans from `sb-common-assets` in the
 * manager template, which no configuration hook can remove. These declarations
 * come later in the cascade and claim the same family, so they win the match and
 * the chrome paints with the design system's own files — Storybook's 700 weight
 * is never activated. Measured caveat: the browser still fetches and activates
 * Storybook's 400 weight alongside ours, so one redundant same-origin font
 * request remains. Fraunces is added here for the wordmark.
 */
const managerFonts = `
  @font-face {
    font-family: "Nunito Sans";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("./kc-fonts/nunito-sans-latin-400-normal.woff2") format("woff2");
  }
  @font-face {
    font-family: "Nunito Sans";
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url("./kc-fonts/nunito-sans-latin-600-normal.woff2") format("woff2");
  }
  @font-face {
    font-family: "Nunito Sans";
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url("./kc-fonts/nunito-sans-latin-700-normal.woff2") format("woff2");
  }
  @font-face {
    font-family: "Fraunces Variable";
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url("./kc-fonts/fraunces-latin-full-normal.woff2") format("woff2-variations");
  }
`;

/**
 * The manager carries the token contract (see the tokens stylesheet below), so
 * everything here resolves from `--kc-*` rather than leaving Storybook to derive
 * a color of its own. Two rules matter beyond the wordmark:
 *
 * - Selection wears the Select option's treatment — accent wash plus the mint
 *   marker on the leading edge — because a sidebar is a list of options. Coral
 *   marks commitment, and navigating somewhere commits to nothing.
 * - The toolbar globals are quiet by default. Storybook renders every toolbar
 *   control in its "active" style permanently, which said nothing while shouting.
 */
const managerChrome = `
  .sidebar-header a[href="./"],
  [class*="sidebar-header"] a[href="./"] {
    font-family: "Fraunces Variable", Georgia, "Times New Roman", serif;
    font-variation-settings: "opsz" 11, "SOFT" 80;
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: 0.01em;
  }

  /* Doubled class: Storybook's Emotion rule matches the same specificity and is
     injected later, so a plain selector loses the tie. */
  .sidebar-item.sidebar-item[data-selected="true"] {
    background: var(--kc-color-accent-surface);
    box-shadow: inset 3px 0 0 var(--kc-color-accent-border);
  }

  .sidebar-item.sidebar-item[data-selected="true"],
  .sidebar-item.sidebar-item[data-selected="true"] a,
  .sidebar-item.sidebar-item[data-selected="true"] svg {
    color: var(--kc-color-accent-text);
  }

  /* Hovering the selected item must not invert it. Storybook floods the anchor
     with a solid \`colorSecondary\` on hover, which is the same mint this rule
     uses for the label — mint ink on a mint fill reads as an empty green bar.
     A selected row is already selected; hover leaves it where it is. */
  .sidebar-item.sidebar-item[data-selected="true"]:hover,
  .sidebar-item.sidebar-item[data-selected="true"]:focus-within,
  .sidebar-item.sidebar-item[data-selected="true"] a:hover,
  .sidebar-item.sidebar-item[data-selected="true"] a:focus {
    background: var(--kc-color-accent-surface);
    color: var(--kc-color-accent-text);
  }

  /* An unselected row warms one step, the way hover does everywhere else in the
     system, rather than taking a saturated fill of its own. */
  .sidebar-item.sidebar-item:not([data-selected="true"]) a:hover,
  .sidebar-item.sidebar-item:not([data-selected="true"]) a:focus {
    background: var(--kc-color-surface-hover);
    color: var(--kc-color-text);
  }

  /* The row's trailing "Open context menu" button is painted a solid
     \`colorSecondary\` with a 5px glow of the same color — Storybook's way of
     blending it into the saturated row it expects behind a selection. Against an
     accent wash that reads as a dark blob with an invisible glyph, so the button
     goes transparent at rest and takes a raised chip on hover. */
  .sidebar-item.sidebar-item[data-selected="true"] button {
    background: transparent;
    box-shadow: none;
    color: var(--kc-color-accent-text);
  }

  .sidebar-item.sidebar-item button:hover,
  .sidebar-item.sidebar-item button:focus-visible,
  .sidebar-item.sidebar-item[data-selected="true"] button:hover,
  .sidebar-item.sidebar-item[data-selected="true"] button:focus-visible {
    background: var(--kc-color-surface-raised);
    color: var(--kc-color-accent-text);
    box-shadow: none;
  }

  .sb-bar [role="button"][aria-haspopup="listbox"] {
    background: transparent;
    color: var(--kc-color-text-muted);
  }

  .sb-bar [role="button"][aria-haspopup="listbox"]:hover {
    background: var(--kc-color-surface-hover);
    color: var(--kc-color-text);
  }

  .sb-bar button:focus-visible,
  .sidebar-item a:focus-visible {
    outline: var(--kc-focus-ring);
    outline-offset: var(--kc-focus-ring-offset);
    box-shadow: none;
  }

  /* The toolbar is nowrap flex rows nested three deep that scroll inside
     themselves, so on a phone the last control — forced colors — sat off-screen
     with no affordance. Every level has to be allowed to wrap and shrink, or the
     outer one wraps a single 475px child and nothing moves. */
  @media (max-width: 600px) {
    .sb-bar.sb-bar,
    .sb-bar.sb-bar > div,
    .sb-bar.sb-bar > div > div {
      flex-wrap: wrap;
      overflow-x: visible;
    }

    .sb-bar.sb-bar > div,
    .sb-bar.sb-bar > div > div {
      min-width: 0;
      flex-shrink: 1;
    }

    /* The bar carries a fixed 40px height, so a wrapped second row was laid out
       correctly and then clipped. Inner rows stay content-height so the wrap
       costs one row, not an empty band per group. */
    .sb-bar.sb-bar {
      height: auto;
      min-height: 40px;
    }

    .sb-bar.sb-bar > div,
    .sb-bar.sb-bar > div > div {
      height: auto;
      align-content: center;
    }
  }
`;

const config: StorybookConfig & { title?: string } = {
  // Feeds the built manager's <title>: "Keycaps design system - Storybook".
  // Without it Storybook falls back to the directory name.
  title: "Keycaps design system",
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    "../../../packages/react/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: [
    { from: "../../../packages/tokens/fonts", to: "/kc-fonts" },
    { from: "../../../packages/tokens/src", to: "/kc-tokens" },
  ],
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  managerHead: (head) => `${head}
    <link rel="icon" type="image/svg+xml" href="${favicon}" />
    <meta name="description" content="Keycaps — the owned design tokens, React components, and interaction guidance for jflamb.com projects." />
    <link rel="stylesheet" href="./kc-tokens/tokens.css" />
    <style>${managerFonts}${managerChrome}</style>
  `,
  docs: {
    defaultName: "Guidance",
  },
};

export default config;
