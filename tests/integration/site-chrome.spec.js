const { test, expect } = require("@playwright/test");

test("homepage typography uses the Fraunces display stack", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const fontLoaderSource = await page.evaluate(async () => {
    const response = await fetch("/js/home-font-loader.js");
    return response.text();
  });

  expect(fontLoaderSource).toContain("Fraunces");
  expect(fontLoaderSource).toContain("Source+Sans+3");
  expect(fontLoaderSource).not.toContain("Space+Grotesk");

  const headingFamily = await page
    .locator("h1")
    .evaluate((node) => getComputedStyle(node).fontFamily);
  expect(headingFamily).toContain("Fraunces");
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

test("gold accent metadata and badges stay present across core surfaces", async ({ page }) => {
  const checks = [
    {
      path: "/",
      selector: ".hero-badge",
      property: "borderColor",
    },
    {
      path: "/privacy.html",
      selector: ".updated",
      property: "backgroundColor",
    },
    {
      path: "/support.html",
      selector: ".updated",
      property: "backgroundColor",
    },
    {
      path: "/blog/",
      selector: ".hub-breadcrumb",
      property: "backgroundColor",
    },
    {
      path: "/blog/birthday-card-messages.html",
      selector: ".article-meta",
      property: "backgroundColor",
    },
    {
      path: "/messages/",
      selector: ".hub-breadcrumb",
      property: "backgroundColor",
    },
    {
      path: "/messages/birthday-card-message-for-friend.html",
      selector: ".article-meta",
      property: "backgroundColor",
    },
  ];

  for (const check of checks) {
    await page.goto(check.path, { waitUntil: "networkidle" });

    const value = await page
      .locator(check.selector)
      .first()
      .evaluate((node, property) => {
        return getComputedStyle(node)[property];
      }, check.property);

    expect(value, `${check.path} should retain the gold accent`).toContain("251, 191, 36");
  }
});
