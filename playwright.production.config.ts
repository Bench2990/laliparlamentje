import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./test-results/production",
  testMatch: "production.spec.ts",
  timeout: 120_000,
  expect: { timeout: 45_000 },
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    baseURL: "http://127.0.0.1:3200",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run start -- --port 3200",
    url: "http://127.0.0.1:3200",
    env: { NEXT_PUBLIC_E2E: "0", NEXT_TELEMETRY_DISABLED: "1" },
    timeout: 90_000,
  },
});
