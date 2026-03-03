const { test, expect } = require("@playwright/test");

async function stabilizeVisualState(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      .scroll-progress,
      .hero-scroll-arrow {
        display: none !important;
      }
    `,
  });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

async function assertContentScreenshot(page, name, testInfo, mobileDiffRatio = 0.07) {
  const screenshotOptions =
    testInfo.project.name === "mobile-chromium"
      ? { maxDiffPixelRatio: mobileDiffRatio }
      : undefined;
  await expect(page).toHaveScreenshot(name, screenshotOptions);
}

test("blog article visual baseline", async ({ page }, testInfo) => {
  await page.goto("/blog/birthday-card-messages.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await assertContentScreenshot(page, "blog-birthday-card-messages.png", testInfo);
});

test("message detail visual baseline", async ({ page }, testInfo) => {
  await page.goto("/messages/birthday-card-message-for-friend.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await assertContentScreenshot(page, "message-birthday-card-for-friend.png", testInfo, 0.09);
});
