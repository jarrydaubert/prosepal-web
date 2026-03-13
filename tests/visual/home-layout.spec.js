const { test, expect } = require("@playwright/test");

const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";

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

async function assertHomeScreenshot(page, testInfo) {
  const screenshotOptions =
    testInfo.project.name === "mobile-chromium" ? { maxDiffPixelRatio: 0.07 } : undefined;
  await expect(page).toHaveScreenshot("home-hero-nav.png", screenshotOptions);
}

async function assertPopupScreenshot(page, testInfo) {
  const screenshotOptions =
    testInfo.project.name === "mobile-chromium" ? { maxDiffPixelRatio: 0.08 } : undefined;
  await expect(page).toHaveScreenshot("home-tips-popup.png", screenshotOptions);
}

test("homepage hero and nav visual baseline", async ({ page }, testInfo) => {
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

  await waitForAsyncFonts(page);

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

  await assertHomeScreenshot(page, testInfo);
});

test("homepage tips popup visual baseline", async ({ page }, testInfo) => {
  await page.addInitScript((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage restrictions.
    }
  }, POPUP_DISMISS_KEY);

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

  await waitForAsyncFonts(page);

  await page.evaluate(() => {
    const overlay = document.getElementById("tips-popup-overlay");
    if (!overlay) {
      return;
    }

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });

  await assertPopupScreenshot(page, testInfo);
});
