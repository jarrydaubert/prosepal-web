const { test, expect } = require("@playwright/test");

const HUB_CASES = [
  {
    key: "blog",
    path: "/blog/",
    waitlistSurface: "blog_hub_waitlist",
    assistLocation: "blog_hub_top_assist",
    waitlistAnchor: "#blog-hub-waitlist-form",
  },
  {
    key: "messages",
    path: "/messages/",
    waitlistSurface: "messages_hub_waitlist",
    assistLocation: "messages_hub_top_assist",
    waitlistAnchor: "#messages-hub-waitlist-form",
  },
];

test("@smoke conversion assist renders with actionable links on blog and messages hubs", async ({
  page,
}) => {
  for (const hub of HUB_CASES) {
    await page.goto(hub.path, { waitUntil: "networkidle" });

    const assist = page.locator(".conversion-assist").first();
    await expect(assist).toBeVisible();
    await expect(assist.locator(".assist-primary")).toBeVisible();
    await expect(assist.locator(".assist-secondary")).toBeVisible();

    await expect(assist.locator(".assist-primary")).toHaveAttribute(
      "data-analytics-location",
      hub.assistLocation,
    );
    await expect(assist.locator(".assist-secondary")).toHaveAttribute("href", hub.waitlistAnchor);
    await expect(page.locator(hub.waitlistAnchor)).toHaveCount(1);
  }
});

for (const hub of HUB_CASES) {
  const waitlistSelector = `.waitlist-inline-form[data-waitlist-surface='${hub.waitlistSurface}']`;

  test(`@smoke ${hub.key} hub waitlist form shows success state on 200 response`, async ({
    page,
  }) => {
    await page.route("https://formspree.io/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto(hub.path, { waitUntil: "networkidle" });

    const form = page.locator(waitlistSelector).first();
    await expect(form).toBeVisible();
    await form.locator("input[name='email']").fill(`qa+${hub.key}-success@prosepal.app`);
    await form.locator("button[type='submit']").click();

    const status = form.locator("[data-waitlist-status]");
    await expect(status).toHaveAttribute("data-state", "success");
    await expect(status).toContainText("Thanks");
  });

  test(`@smoke ${hub.key} hub waitlist form shows error state on non-200 response`, async ({
    page,
  }) => {
    await page.route("https://formspree.io/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto(hub.path, { waitUntil: "networkidle" });

    const form = page.locator(waitlistSelector).first();
    await expect(form).toBeVisible();
    await form.locator("input[name='email']").fill(`qa+${hub.key}-error@prosepal.app`);
    await form.locator("button[type='submit']").click();

    const status = form.locator("[data-waitlist-status]");
    await expect(status).toHaveAttribute("data-state", "error");
    await expect(status).toContainText("Submission failed");
  });
}
