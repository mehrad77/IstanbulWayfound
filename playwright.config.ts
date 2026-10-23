import { defineConfig, devices } from "@playwright/test";

/** Gate checks run against the local stack started by `pnpm dev`. */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { trace: "retain-on-failure", locale: "en-GB" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4321/en/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
