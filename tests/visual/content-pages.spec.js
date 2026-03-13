const { test, expect } = require("@playwright/test");

async function waitForAsyncFonts(page) {
  await page.waitForFunction(() => {
    const asyncFontLinks = Array.from(document.querySelectorAll("link[data-async-fonts='true']"));
    return asyncFontLinks.every((link) => link.media === "all");
  });

  await page.evaluate(async () => {
    const asyncFontLinks = Array.from(document.querySelectorAll("link[data-async-fonts='true']"));
    await Promise.all(
      asyncFontLinks.map(
        (link) =>
          new Promise((resolve) => {
            if (link.media === "all") {
              resolve();
              return;
            }

            const settle = () => resolve();
            link.addEventListener("load", settle, { once: true });
            link.addEventListener("error", settle, { once: true });
          }),
      ),
    );

    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load('600 1rem "Inter"'),
        document.fonts.load('600 1rem "Playfair Display"'),
      ]);
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

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

  await waitForAsyncFonts(page);
}

async function assertContentScreenshot(page, name, testInfo, mobileDiffRatio = 0.07) {
  const screenshotOptions =
    testInfo.project.name === "mobile-chromium"
      ? { maxDiffPixelRatio: mobileDiffRatio }
      : name === "blog-birthday-card-messages.png"
        ? { maxDiffPixelRatio: 0.06 }
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

test("privacy page visual baseline", async ({ page }, testInfo) => {
  await page.goto("/privacy.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await assertContentScreenshot(page, "privacy-page.png", testInfo, 0.08);
});

test("support page visual baseline", async ({ page }, testInfo) => {
  await page.goto("/support.html", { waitUntil: "networkidle" });
  await stabilizeVisualState(page);
  await assertContentScreenshot(page, "support-page.png", testInfo, 0.08);
});
