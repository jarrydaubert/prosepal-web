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
