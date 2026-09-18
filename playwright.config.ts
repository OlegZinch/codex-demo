import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run --bun next start -p 3100",
    env: {
      APP_URL: baseURL,
      AUTH_SECRET: "tinynotes-e2e-secret-not-for-production",
      DB_PATH: resolve(process.cwd(), ".test-data/tinynotes-e2e.db"),
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
