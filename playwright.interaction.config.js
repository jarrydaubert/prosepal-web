const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/integration",
  timeout: 30_000,
  outputDir: "/tmp/prosepal-playwright-interaction-results",
  use: {
    baseURL: "http://127.0.0.1:4174",
    headless: true,
    ...devices["Pixel 5"],
  },
  webServer: {
    command: "python3 -m http.server 4174 --directory public",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
