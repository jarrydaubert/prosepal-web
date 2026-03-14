const { test, expect } = require("@playwright/test");
const { installAnalyticsSpy, normalizeEvents } = require("../helpers/analytics-events");

const EXPERIMENT_ID = "hero_copy_clarity_v1";
const EXPERIMENT_QUERY = "exp_hero_copy_clarity_v1=treatment";

test.beforeEach(async ({ page }) => {
  await installAnalyticsSpy(page);
});

test("hero copy experiment supports QA override and treatment rendering", async ({ page }) => {
  await page.goto(`/?${EXPERIMENT_QUERY}`, { waitUntil: "networkidle" });

  await expect(page.locator("#hero-headline")).toContainText("What to write when the words");
  await expect(page.locator("#hero-category-badge-text")).toHaveText("For hard-to-write cards");

  const storedAssignment = await page.evaluate(() => {
    const raw = localStorage.getItem("prosepal_experiment_assignments_v1");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed?.hero_copy_clarity_v1 || null;
  });

  expect(storedAssignment).toBe("treatment");
});

test("experiment assignment is stable across reload for the same user", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const firstAssignment = await page.evaluate(() =>
    window.prosepalExperiments?.getAssignment?.("hero_copy_clarity_v1"),
  );
  expect(["control", "treatment"]).toContain(firstAssignment);

  await page.reload({ waitUntil: "networkidle" });

  const secondAssignment = await page.evaluate(() =>
    window.prosepalExperiments?.getAssignment?.("hero_copy_clarity_v1"),
  );
  expect(secondAssignment).toBe(firstAssignment);
});

test("exposure emits once per session and conversion includes experiment context", async ({
  page,
}) => {
  await page.goto(`/?${EXPERIMENT_QUERY}`, { waitUntil: "networkidle" });

  await page.waitForFunction(() => {
    return (window.__analyticsCalls || []).some((call) => {
      if (!Array.isArray(call) || call[0] !== "event") {
        return false;
      }
      const second = call[1];
      if (second && typeof second === "object" && !Array.isArray(second)) {
        return second.name === "experiment_exposure";
      }
      return second === "experiment_exposure";
    });
  });

  await page.locator("#hero-app-store").evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
  });
  await page.click("#hero-app-store");

  let events = await page.evaluate(() => window.__analyticsCalls || []);
  let normalized = normalizeEvents(events);

  const exposureEvents = normalized.filter((event) => event.name === "experiment_exposure");
  expect(exposureEvents).toHaveLength(1);
  expect(exposureEvents[0]?.properties.experiment_id).toBe(EXPERIMENT_ID);
  expect(exposureEvents[0]?.properties.variant_id).toBe("treatment");

  const conversionEvent = normalized.find((event) => event.name === "app_store_click");
  expect(conversionEvent).toBeTruthy();
  expect(conversionEvent?.properties.experiment_id).toBe(EXPERIMENT_ID);
  expect(conversionEvent?.properties.variant_id).toBe("treatment");

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(200);

  events = await page.evaluate(() => window.__analyticsCalls || []);
  normalized = normalizeEvents(events);
  const postReloadExposureEvents = normalized.filter(
    (event) => event.name === "experiment_exposure",
  );
  expect(postReloadExposureEvents).toHaveLength(0);
});
