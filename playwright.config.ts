import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "3100";
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `cd frontend && ./node_modules/.bin/next dev --hostname 127.0.0.1 -p ${e2ePort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        env: { NEXTAUTH_SECRET: "e2e-local-secret-not-for-production", NEXTAUTH_URL: baseURL },
      },
});
