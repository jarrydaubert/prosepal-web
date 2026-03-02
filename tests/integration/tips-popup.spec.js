const { test, expect } = require("@playwright/test");

const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function openPopupFromExitIntent(page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.focus(".nav-brand");
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, bubbles: true }));
  });

  const overlay = page.locator("#tips-popup-overlay");
  await expect(overlay).toHaveClass(/open/);
  await expect(overlay).toHaveAttribute("aria-hidden", "false");
}

async function getStoredDismissDays(page) {
  const msRemaining = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return 0;
    }

    const until = Number(raw);
    return until - Date.now();
  }, POPUP_DISMISS_KEY);

  return msRemaining / MS_PER_DAY;
}

test("tips popup traps focus and closes on Escape with focus restore", async ({ page }) => {
  await openPopupFromExitIntent(page);

  const closeButton = page.locator("#tips-popup-close");
  const dismissButton = page.locator("#tips-popup-dismiss");
  const emailInput = page.locator("#tips-popup-email");
  const overlay = page.locator("#tips-popup-overlay");

  await expect(emailInput).toBeFocused();

  await dismissButton.focus();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  await closeButton.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dismissButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(overlay).not.toHaveClass(/open/);
  await expect(overlay).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".nav-brand")).toBeFocused();
});

test("overlay click closes popup and stores ~14 day dismissal", async ({ page }) => {
  await openPopupFromExitIntent(page);

  const overlay = page.locator("#tips-popup-overlay");
  await overlay.click({ position: { x: 6, y: 6 } });

  await expect(overlay).not.toHaveClass(/open/);
  await expect(overlay).toHaveAttribute("aria-hidden", "true");

  const storedDays = await getStoredDismissDays(page);
  expect(storedDays).toBeGreaterThan(13);
  expect(storedDays).toBeLessThan(15);
});

test("dismiss button stores ~14 day suppression and blocks reopen", async ({ page }) => {
  await openPopupFromExitIntent(page);

  await page.click("#tips-popup-dismiss");

  const storedDays = await getStoredDismissDays(page);
  expect(storedDays).toBeGreaterThan(13);
  expect(storedDays).toBeLessThan(15);

  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, bubbles: true }));
  });

  const overlay = page.locator("#tips-popup-overlay");
  await expect(overlay).not.toHaveClass(/open/);
  await expect(overlay).toHaveAttribute("aria-hidden", "true");
});

test("successful submit stores ~90 day suppression and blocks reopen", async ({ page }) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await openPopupFromExitIntent(page);

  await page.fill("#tips-popup-email", "qa+popup@prosepal.app");
  await page.click("#tips-popup-form button[type='submit']");

  const status = page.locator("#tips-popup-status");
  await expect(status).toHaveAttribute("data-state", "success");
  await expect(status).toContainText("Thanks");
  await expect(page.locator("#tips-popup-overlay")).not.toHaveClass(/open/, { timeout: 4000 });

  const storedDays = await getStoredDismissDays(page);
  expect(storedDays).toBeGreaterThan(89);
  expect(storedDays).toBeLessThan(91);

  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, bubbles: true }));
  });

  const overlay = page.locator("#tips-popup-overlay");
  await expect(overlay).not.toHaveClass(/open/);
  await expect(overlay).toHaveAttribute("aria-hidden", "true");
});
