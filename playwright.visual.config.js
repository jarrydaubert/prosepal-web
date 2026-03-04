const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/visual",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  timeout: 30_000,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.04,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    locale: "en-US",
    timezoneId: "UTC",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "python3 -m http.server 4173 --directory public",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});
