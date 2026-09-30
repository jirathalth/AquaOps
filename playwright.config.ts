import { defineConfig, devices } from "@playwright/test";

const port = process.env.E2E_PORT ?? "3000";
const appDirectory = process.env.E2E_APP_DIR;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "on-first-retry" },
  webServer: { command: appDirectory ? `cd ${JSON.stringify(appDirectory)} && npm run dev -- --webpack --port ${port}` : `npm run dev -- --port ${port}`, url: `http://localhost:${port}/login`, reuseExistingServer: !process.env.CI && !process.env.E2E_PORT },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
