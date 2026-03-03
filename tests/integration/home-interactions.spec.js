const { test, expect } = require("@playwright/test");

const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    try {
      localStorage.setItem(key, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
    } catch {
      // Ignore storage restrictions.
    }
  }, POPUP_DISMISS_KEY);
});

test("@smoke mobile nav opens/closes with focus return on homepage", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const hamburger = page.locator("#nav-hamburger");
  const mobileMenu = page.locator("#mobile-menu");
  const firstLink = page.locator("#mobile-menu a").first();

  await hamburger.click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "true");
  await expect(mobileMenu).toHaveClass(/open/);
  await expect(firstLink).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  await expect(mobileMenu).not.toHaveClass(/open/);
  await expect(hamburger).toBeFocused();

  await hamburger.click();
  await firstLink.click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  await expect(mobileMenu).not.toHaveClass(/open/);
});

test("mobile nav opens/closes with focus return on non-home page", async ({ page }) => {
  await page.goto("/privacy.html", { waitUntil: "networkidle" });

  const hamburger = page.locator("#nav-hamburger");
  const mobileMenu = page.locator("#mobile-menu");
  const firstLink = page.locator("#mobile-menu a").first();

  await hamburger.click();
  await expect(hamburger).toHaveAttribute("aria-expanded", "true");
  await expect(mobileMenu).toHaveClass(/open/);
  await expect(firstLink).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  await expect(mobileMenu).not.toHaveClass(/open/);
  await expect(hamburger).toBeFocused();
});

test("demo chips support Arrow/Home/End keyboard navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const chips = page.locator(".demo-chip");
  await expect(chips).toHaveCount(4);

  const first = chips.nth(0);
  const second = chips.nth(1);
  const last = chips.nth(3);

  await first.focus();

  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(first).toHaveAttribute("aria-selected", "false");

  await page.keyboard.press("End");
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-selected", "true");
});

test("@smoke waitlist form shows success state on 200 response", async ({ page }) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.fill("#android-waitlist-email", "qa+success@prosepal.app");
  await page.click("#android-waitlist-form button[type='submit']");

  const status = page.locator("#android-waitlist-status");
  await expect(status).toHaveAttribute("data-state", "success");
  await expect(status).toContainText("Thanks");
});

test("@smoke waitlist form shows error state on non-200 response", async ({ page }) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.fill("#android-waitlist-email", "qa+error@prosepal.app");
  await page.click("#android-waitlist-form button[type='submit']");

  const status = page.locator("#android-waitlist-status");
  await expect(status).toHaveAttribute("data-state", "error");
  await expect(status).toContainText("Submission failed");
});
