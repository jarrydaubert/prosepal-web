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

test("blog article visual baseline", async ({ page }) => {
  await page.goto("/blog/birthday-card-messages.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await expect(page).toHaveScreenshot("blog-birthday-card-messages.png");
});

test("message detail visual baseline", async ({ page }) => {
  await page.goto("/messages/birthday-card-message-for-friend.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await expect(page).toHaveScreenshot("message-birthday-card-for-friend.png");
});
