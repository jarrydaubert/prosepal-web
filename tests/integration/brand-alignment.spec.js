const { test, expect } = require("@playwright/test");

const POPUP_DISMISS_KEY = "prosepal_tips_popup_dismissed_until";

const pageChecks = [
  {
    name: "home",
    path: "/",
    accentSelector: ".nav-cta",
    accentProperty: "backgroundColor",
    ambientSelector: ".ambient-bg",
    expectsAmbient: true,
  },
  {
    name: "blog hub",
    path: "/blog/",
    accentSelector: ".header-cta",
    accentProperty: "backgroundColor",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "blog article",
    path: "/blog/is-prosepal-pro-worth-it.html",
    accentSelector: ".header-cta",
    accentProperty: "backgroundColor",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "messages hub",
    path: "/messages/",
    accentSelector: ".header-cta",
    accentProperty: "backgroundColor",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "message article",
    path: "/messages/birthday-card-message-for-friend.html",
    accentSelector: ".header-cta",
    accentProperty: "backgroundColor",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "privacy",
    path: "/privacy.html",
    accentSelector: ".nav-cta",
    accentProperty: "backgroundColor",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "support",
    path: "/support.html",
    accentSelector: ".email-link",
    accentProperty: "color",
    ambientSelector: "body",
    expectsAmbient: true,
  },
  {
    name: "404",
    path: "/404.html",
    accentSelector: ".error-btn-primary",
    accentProperty: "backgroundColor",
    expectsAmbient: false,
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    try {
      localStorage.setItem(key, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
    } catch {
      // Ignore storage restrictions.
    }
  }, POPUP_DISMISS_KEY);
});

test("brand tokens and ambient styling stay aligned across page families", async ({ page }) => {
  for (const pageCheck of pageChecks) {
    await page.goto(pageCheck.path, { waitUntil: "networkidle" });

    const rootStyles = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      return {
        primary: root.getPropertyValue("--md-primary").trim().toLowerCase(),
        background: root.getPropertyValue("--md-background").trim().toLowerCase(),
        displayFont: root.getPropertyValue("--font-family-display").trim(),
        bodyBgColor: body.backgroundColor,
      };
    });

    expect(rootStyles.primary, `${pageCheck.name} should use coral primary`).toBe("#d4736b");
    expect(rootStyles.background, `${pageCheck.name} should use slate background`).toBe("#151c26");
    expect(rootStyles.displayFont, `${pageCheck.name} should use app display font`).toContain(
      '"Fraunces"',
    );
    if (pageCheck.expectsAmbient) {
      const ambientBackground = await page
        .locator(pageCheck.ambientSelector)
        .evaluate((element) => {
          return getComputedStyle(element).backgroundImage;
        });

      expect(ambientBackground, `${pageCheck.name} should not use old plum ambient`).not.toContain(
        "139, 92, 246",
      );
      expect(ambientBackground, `${pageCheck.name} should not use old blue ambient`).not.toContain(
        "37, 99, 235",
      );
      expect(ambientBackground, `${pageCheck.name} should include coral ambient`).toContain(
        "212, 115, 107",
      );
    } else {
      expect(rootStyles.bodyBgColor, `${pageCheck.name} should fall back to slate background`).toBe(
        "rgb(21, 28, 38)",
      );
    }

    const accentValue = await page
      .locator(pageCheck.accentSelector)
      .first()
      .evaluate((element, property) => {
        const styles = getComputedStyle(element);
        return styles[property];
      }, pageCheck.accentProperty);

    expect(accentValue, `${pageCheck.name} should keep a coral-led accent`).toContain(
      "212, 115, 107",
    );
  }
});
