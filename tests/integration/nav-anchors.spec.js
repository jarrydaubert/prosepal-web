const { test, expect, devices } = require("@playwright/test");

test.use({
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
});

async function assertAnchorTargetVisible(page, href, sectionId) {
  await page.locator(`.nav .nav-links a[href=\"${href}\"]`).click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));

  const top = await page.evaluate((id) => {
    const element = document.querySelector(id);
    if (!element) {
      return Number.NEGATIVE_INFINITY;
    }
    return element.getBoundingClientRect().top;
  }, sectionId);

  expect(top).toBeGreaterThanOrEqual(0);
}

test("sticky nav anchor offsets keep section headings visible", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await assertAnchorTargetVisible(page, "#features", "#features");
  await assertAnchorTargetVisible(page, "#how-it-works", "#how-it-works");
  await assertAnchorTargetVisible(page, "#faq", "#faq");
});
