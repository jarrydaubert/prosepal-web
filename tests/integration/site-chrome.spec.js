const { test, expect } = require("@playwright/test");

test("homepage typography uses the Playfair display stack", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const fontLoaderSource = await page.evaluate(async () => {
    const response = await fetch("/js/home-font-loader.js");
    return response.text();
  });

  expect(fontLoaderSource).toContain("Playfair+Display");
  expect(fontLoaderSource).not.toContain("Space+Grotesk");

  const headingFamily = await page
    .locator("h1")
    .evaluate((node) => getComputedStyle(node).fontFamily);
  expect(headingFamily).toContain("Playfair Display");
});

test("content-heavy pages start with an opaque navigation backdrop", async ({ page }) => {
  const pages = ["/privacy.html", "/blog/", "/messages/"];

  for (const pathname of pages) {
    await page.goto(pathname, { waitUntil: "networkidle" });

    const selector = pathname === "/privacy.html" ? ".nav" : ".site-header";
    const alpha = await page.locator(selector).evaluate((node) => {
      const background = getComputedStyle(node).backgroundColor;
      const match = background.match(/rgba?\(([^)]+)\)/);
      if (!match) {
        return 0;
      }

      const parts = match[1].split(",").map((part) => part.trim());
      if (parts.length < 4) {
        return 1;
      }

      return Number(parts[3]);
    });

    expect(alpha).toBeGreaterThan(0);
  }
});

test("light brand containers keep dark readable text on hub and article surfaces", async ({
  page,
}) => {
  const checks = [
    {
      path: "/messages/",
      surfaceSelector: ".post-tag",
      textSelector: ".post-tag",
    },
    {
      path: "/messages/sympathy-card-message-for-coworker.html",
      surfaceSelector: ".tips-box",
      textSelector: ".tips-box h3",
    },
    {
      path: "/blog/what-to-write-in-sympathy-card.html",
      surfaceSelector: ".tips-box",
      textSelector: ".tips-box h3",
    },
  ];

  for (const check of checks) {
    await page.goto(check.path, { waitUntil: "networkidle" });

    const surfaceStyles = await page
      .locator(check.surfaceSelector)
      .first()
      .evaluate((node) => {
        const computed = getComputedStyle(node);
        return {
          backgroundColor: computed.backgroundColor,
        };
      });

    const textStyles = await page
      .locator(check.textSelector)
      .first()
      .evaluate((node) => {
        const computed = getComputedStyle(node);
        return {
          color: computed.color,
        };
      });

    expect(surfaceStyles.backgroundColor).toContain("252, 233, 231");
    expect(textStyles.color).toContain("40, 54, 72");
    expect(textStyles.color).not.toContain("255, 255, 255");
  }
});
