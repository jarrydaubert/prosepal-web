const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/integration",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  outputDir: "/tmp/prosepal-playwright-interaction-results",
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4174",
    headless: true,
    locale: "en-US",
    timezoneId: "UTC",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    ...devices["Pixel 5"],
  },
  webServer: {
    command: "python3 -m http.server 4174 --directory public",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
