const { test, expect } = require("@playwright/test");

const APP_STORE_SELECTOR = "a[href*='apps.apple.com/app/prosepal/id6757088726']";
const ATTRIBUTION_QUERY =
  "utm_source=e2e_source&utm_medium=e2e_medium&utm_campaign=e2e_campaign&utm_term=e2e_term&utm_content=e2e_content&gclid=e2e_gclid&fbclid=e2e_fbclid";
const REQUIRED_ATTRIBUTION = {
  utm_source: "e2e_source",
  utm_medium: "e2e_medium",
  utm_campaign: "e2e_campaign",
  utm_term: "e2e_term",
  utm_content: "e2e_content",
  gclid: "e2e_gclid",
  fbclid: "e2e_fbclid",
};

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
async function clickTrackedLink(page, path, selector, viewport = null) {
  if (viewport) {
    await page.setViewportSize(viewport);
  }
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

/**
 * Open mobile navigation on the current page.
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<void>}
 */
async function openMobileMenu(page) {
  const hamburger = page.locator("#nav-hamburger");
  await expect(hamburger).toBeVisible();
  await hamburger.click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "true");
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__analyticsCalls = window.__analyticsCalls || [];
    window.va = (...args) => {
      window.__analyticsCalls.push(args);
      const queue = window.vaq || [];
      queue.push(args);
      window.vaq = queue;
    };
  });
});

test("@smoke app store clicks include normalized page context and locations", async ({ page }) => {
  const cases = [
    { path: "/", selector: "#hero-app-store", pageType: "home", location: "hero_primary" },
    {
      path: "/",
      selector: ".nav-cta",
      pageType: "home",
      location: "header_nav",
      viewport: { width: 1280, height: 900 },
    },
    {
      path: "/blog/",
      selector: ".conversion-assist a[data-analytics-location='blog_hub_top_assist']",
      pageType: "blog_hub",
      location: "blog_hub_top_assist",
    },
    {
      path: "/blog/",
      selector: `.cta-section ${APP_STORE_SELECTOR}`,
      pageType: "blog_hub",
      location: "content_cta",
    },
    {
      path: "/blog/",
      selector: "nav.header-content .header-cta",
      pageType: "blog_hub",
      location: "header_nav",
      viewport: { width: 1280, height: 900 },
    },
    {
      path: "/blog/birthday-card-messages.html",
      selector: `.cta-box ${APP_STORE_SELECTOR}`,
      pageType: "blog_article",
      location: "content_cta",
    },
    {
      path: "/messages/",
      selector: ".conversion-assist a[data-analytics-location='messages_hub_top_assist']",
      pageType: "messages_hub",
      location: "messages_hub_top_assist",
    },
    {
      path: "/messages/",
      selector: `.cta-section ${APP_STORE_SELECTOR}`,
      pageType: "messages_hub",
      location: "content_cta",
    },
    {
      path: "/messages/birthday-card-message-for-friend.html",
      selector: `.cta-box ${APP_STORE_SELECTOR}`,
      pageType: "message_detail",
      location: "content_cta",
    },
  ];

  for (const testCase of cases) {
    await clickTrackedLink(page, testCase.path, testCase.selector, testCase.viewport);
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
    expect(matchedEvent?.properties.location).toBe(testCase.location);
  }
});

test("demo chip click emits interaction method click", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.click(".demo-chip[data-key='birthday']");

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const demoEvents = normalizeEvents(capturedCalls).filter(
    (event) => event.name === "demo_chip_click",
  );
  const clickEvent = demoEvents.find(
    (event) => event.properties.variant === "birthday" && event.properties.interaction === "click",
  );

  expect(clickEvent, "missing click demo_chip_click event for birthday").toBeTruthy();
});

test("demo chip keyboard navigation emits one keyboard interaction event", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const firstChip = page.locator(".demo-chip").first();
  await firstChip.focus();
  await page.keyboard.press("ArrowRight");

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const demoEvents = normalizeEvents(capturedCalls).filter(
    (event) => event.name === "demo_chip_click",
  );
  const keyboardEvents = demoEvents.filter((event) => event.properties.interaction === "keyboard");
  const clickEvents = demoEvents.filter((event) => event.properties.interaction === "click");

  expect(keyboardEvents).toHaveLength(1);
  expect(keyboardEvents[0]?.properties.variant).toBe("birthday");
  expect(clickEvents).toHaveLength(0);
});

test("mobile-menu app store click emits mobile_menu location", async ({ page }) => {
  await page.goto("/blog/", { waitUntil: "networkidle" });
  await openMobileMenu(page);
  const mobileCta = page.locator("#mobile-menu .header-cta").first();
  await expect(mobileCta).toBeVisible();
  await mobileCta.evaluate((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      },
      { once: true },
    );
  });
  await mobileCta.click();

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const appStoreEvents = normalizeEvents(capturedCalls).filter(
    (event) => event.name === "app_store_click",
  );
  const mobileMenuEvent = appStoreEvents.find(
    (event) =>
      event.properties.page_path === "/blog/" && event.properties.location === "mobile_menu",
  );

  expect(mobileMenuEvent, "missing mobile_menu app_store_click on /blog/").toBeTruthy();
  expect(mobileMenuEvent?.properties.page_type).toBe("blog_hub");
});

test("app store clicks include persisted attribution properties when URL params are present", async ({
  page,
}) => {
  await page.goto(`/?${ATTRIBUTION_QUERY}`, { waitUntil: "networkidle" });
  await clickTrackedLink(page, "/blog/", `.cta-section ${APP_STORE_SELECTOR}`);

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const appStoreEvents = normalizeEvents(capturedCalls).filter(
    (event) => event.name === "app_store_click",
  );
  const eventForPath = appStoreEvents.find((event) => event.properties.page_path === "/blog/");

  expect(eventForPath, "missing app_store_click for /blog/").toBeTruthy();
  for (const [key, value] of Object.entries(REQUIRED_ATTRIBUTION)) {
    expect(eventForPath?.properties[key]).toBe(value);
  }
});

test("hero waitlist submit start/success include attribution properties when URL params are present", async ({
  page,
}) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto(`/?${ATTRIBUTION_QUERY}`, { waitUntil: "networkidle" });
  await page.fill("#android-waitlist-email", "qa+utm-waitlist@prosepal.app");
  await page.click("#android-waitlist-form button[type='submit']");
  await page.waitForFunction(
    () => document.querySelector("#android-waitlist-status")?.textContent?.includes("Thanks"),
    null,
    { timeout: 10000 },
  );

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const events = normalizeEvents(capturedCalls);

  for (const eventName of ["waitlist_submit_start", "waitlist_submit_success"]) {
    const event = events.find(
      (entry) =>
        entry.name === eventName &&
        entry.properties.surface === "hero_waitlist" &&
        entry.properties.page_path === undefined,
    );
    expect(event, `missing ${eventName} for hero_waitlist`).toBeTruthy();
    for (const [key, value] of Object.entries(REQUIRED_ATTRIBUTION)) {
      expect(event?.properties[key]).toBe(value);
    }
  }
});

test("analytics page-type classifier handles non-trailing slash hubs", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const pageTypeMap = await page.evaluate(() => {
    const analytics = window.prosepalAnalytics;
    return {
      blogNoSlash: analytics?.getPageType?.("/blog"),
      blogSlash: analytics?.getPageType?.("/blog/"),
      messagesNoSlash: analytics?.getPageType?.("/messages"),
      messagesSlash: analytics?.getPageType?.("/messages/"),
    };
  });

  expect(pageTypeMap.blogNoSlash).toBe("blog_hub");
  expect(pageTypeMap.blogSlash).toBe("blog_hub");
  expect(pageTypeMap.messagesNoSlash).toBe("messages_hub");
  expect(pageTypeMap.messagesSlash).toBe("messages_hub");
});

test("404 route emits page_not_found_view when tracking is allowed", async ({ page }) => {
  await page.goto("/404.html", { waitUntil: "networkidle" });

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const events = normalizeEvents(capturedCalls);
  const notFoundEvent = events.find((event) => event.name === "page_not_found_view");

  expect(notFoundEvent, "missing page_not_found_view on /404.html").toBeTruthy();
  expect(notFoundEvent?.properties.page_path).toBe("/404.html");
  expect(typeof notFoundEvent?.properties.referrer_present).toBe("boolean");
});

test("404 route does not emit page_not_found_view when analytics opt-out is enabled", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("prosepal_analytics_opt_out", "1");
  });

  await page.goto("/404.html", { waitUntil: "networkidle" });

  const capturedCalls = await page.evaluate(() => window.__analyticsCalls || []);
  const events = normalizeEvents(capturedCalls);
  const notFoundEvent = events.find((event) => event.name === "page_not_found_view");

  expect(notFoundEvent).toBeFalsy();
});
