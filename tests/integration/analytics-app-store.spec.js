const { test, expect } = require("@playwright/test");

const APP_STORE_SELECTOR = "a[href*='apps.apple.com/app/prosepal/id6757088726']";

/**
 * Normalize Vercel analytics event signatures.
 * @param {unknown[][]} capturedCalls
 * @returns {{name: string, properties: Record<string, unknown>}[]}
 */
function normalizeEvents(capturedCalls) {
  /** @type {{name: string, properties: Record<string, unknown>}[]} */
  const normalized = [];

  for (const call of capturedCalls) {
    if (!Array.isArray(call) || call[0] !== "event") {
      continue;
    }

    const second = call[1];
    const third = call[2];

    if (second && typeof second === "object" && !Array.isArray(second)) {
      const payload = second;
      const name = typeof payload.name === "string" ? payload.name : "";
      if (!name) {
        continue;
      }
      const { name: _ignored, ...properties } = payload;
      normalized.push({ name, properties });
      continue;
    }

    if (typeof second === "string" && third && typeof third === "object" && !Array.isArray(third)) {
      normalized.push({ name: second, properties: third });
      continue;
    }

    if (typeof second === "string") {
      normalized.push({ name: second, properties: {} });
    }
  }

  return normalized;
}

/**
 * Click one App Store link without navigating away from the tested page.
 * @param {import("@playwright/test").Page} page
 * @param {string} path
 * @param {string} selector
 * @returns {Promise<void>}
 */
async function clickTrackedLink(page, path, selector) {
  await page.goto(path, { waitUntil: "networkidle" });
  const link = page.locator(selector).first();
  await expect(link).toBeVisible();
  await link.evaluate((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      },
      { once: true },
    );
  });
  await link.click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__analyticsCalls = [];
    window.va = (...args) => {
      window.__analyticsCalls.push(args);
      const queue = window.vaq || [];
      queue.push(args);
      window.vaq = queue;
    };
  });
});

test("@smoke app store clicks include page context on home and content pages", async ({ page }) => {
  const cases = [
    { path: "/", selector: "#hero-app-store", pageType: "home" },
    { path: "/blog/", selector: `.cta-section ${APP_STORE_SELECTOR}`, pageType: "blog_hub" },
    {
      path: "/blog/birthday-card-messages.html",
      selector: `.cta-box ${APP_STORE_SELECTOR}`,
      pageType: "blog_article",
    },
    {
      path: "/messages/",
      selector: `.cta-section ${APP_STORE_SELECTOR}`,
      pageType: "messages_hub",
    },
    {
      path: "/messages/birthday-card-message-for-friend.html",
      selector: `.cta-box ${APP_STORE_SELECTOR}`,
      pageType: "message_detail",
    },
  ];

  for (const testCase of cases) {
    await clickTrackedLink(page, testCase.path, testCase.selector);
    const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
    const appStoreEvents = normalizeEvents(capturedCalls).filter(
      (event) => event.name === "app_store_click",
    );

    const matchedEvent = appStoreEvents.find((event) => {
      const pageType =
        typeof event.properties.page_type === "string" ? event.properties.page_type : "";
      const pagePath =
        typeof event.properties.page_path === "string" ? event.properties.page_path : "";
      return pageType === testCase.pageType && pagePath === testCase.path;
    });

    expect(matchedEvent, `missing app_store_click for ${testCase.path}`).toBeTruthy();
    const location =
      matchedEvent && typeof matchedEvent.properties.location === "string"
        ? matchedEvent.properties.location
        : "";
    expect(location.length).toBeGreaterThan(0);
  }
});
