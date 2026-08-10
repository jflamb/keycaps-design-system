import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  outputDir: "test-results/playwright",
  use: {
    baseURL: "http://127.0.0.1:6006",
    colorScheme: "light",
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm build && node scripts/serve-storybook.mjs",
    url: "http://127.0.0.1:6006/index.html",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
