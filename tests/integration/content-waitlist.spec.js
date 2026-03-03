const { test, expect } = require("@playwright/test");

const BLOG_WAITLIST_SELECTOR = ".waitlist-inline-form[data-waitlist-surface='blog_hub_waitlist']";

test("@smoke blog hub waitlist form shows success state on 200 response", async ({ page }) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/blog/", { waitUntil: "networkidle" });

  const form = page.locator(BLOG_WAITLIST_SELECTOR).first();
  await expect(form).toBeVisible();
  await form.locator("input[name='email']").fill("qa+blog-success@prosepal.app");
  await form.locator("button[type='submit']").click();

  const status = form.locator("[data-waitlist-status]");
  await expect(status).toHaveAttribute("data-state", "success");
  await expect(status).toContainText("Thanks");
});

test("@smoke blog hub waitlist form shows error state on non-200 response", async ({ page }) => {
  await page.route("https://formspree.io/**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto("/blog/", { waitUntil: "networkidle" });

  const form = page.locator(BLOG_WAITLIST_SELECTOR).first();
  await expect(form).toBeVisible();
  await form.locator("input[name='email']").fill("qa+blog-error@prosepal.app");
  await form.locator("button[type='submit']").click();

  const status = form.locator("[data-waitlist-status]");
  await expect(status).toHaveAttribute("data-state", "error");
  await expect(status).toContainText("Submission failed");
});
