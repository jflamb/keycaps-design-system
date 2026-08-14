import { createThemeBootstrapScript } from "@jflamb/keycaps-react/theme";
import { defineConfig } from "vite";

/**
 * A real Mode 2 consumption proof. Vite injects the package-owned classic
 * script at the end of the head, after the theme-color meta and before the
 * deferred application module, so the stored preference lands before paint.
 */
export default defineConfig({
  plugins: [
    {
      name: "keycaps-theme-bootstrap",
      transformIndexHtml: {
        order: "pre",
        handler: () => [
          {
            tag: "script",
            children: createThemeBootstrapScript({
              storageKey: "jflamb-theme",
              themeColorSelector: "#theme-color",
            }),
            injectTo: "head",
          },
        ],
      },
    },
  ],
});
