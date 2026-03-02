const { test, expect } = require("@playwright/test");

test("homepage hero and nav visual baseline", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

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

  // Enables deterministic "intentional diff" evidence runs without touching app source.
  if (process.env.FORCE_VISUAL_DIFF === "1") {
    await page.addStyleTag({
      content: `
        body {
          filter: hue-rotate(145deg) saturate(1.35) !important;
        }
      `,
    });
  }

  await expect(page.locator("body")).toHaveScreenshot("home-hero-nav.png");
});
