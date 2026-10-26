import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./test-results/browser",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  projects: [
    { name: "desktop", testMatch: "desktop.spec.ts", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testMatch: "mobile.spec.ts", use: { ...devices["Pixel 7"] } },
    { name: "webkit", testMatch: "webkit.spec.ts", use: { ...devices["iPhone 13"], browserName: "webkit", launchOptions: {} } },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    env: { NEXT_PUBLIC_E2E: "1", NEXT_TELEMETRY_DISABLED: "1" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
