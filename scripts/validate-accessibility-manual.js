#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT_DIR = path.join(__dirname, "..");
const BASELINE_SCRIPT = path.join(__dirname, "validate-accessibility-regression.js");
const EVIDENCE_FILE = path.join(ROOT_DIR, "docs", "evidence", "accessibility-regression.md");
const MANUAL_SECTION_HEADER = "## Manual Keyboard/Focus Checks";

const PAGE_TARGETS = [
  { label: "homepage", url: "https://www.prosepal.app/" },
  { label: "messages-hub", url: "https://www.prosepal.app/messages/" },
  { label: "blog-hub", url: "https://www.prosepal.app/blog/" },
  { label: "privacy", url: "https://www.prosepal.app/privacy" },
  { label: "terms", url: "https://www.prosepal.app/terms" },
  { label: "support", url: "https://www.prosepal.app/support" },
];

/**
 * Strip any pre-existing manual section from baseline evidence body.
 * @param {string} content
 * @returns {string}
 */
function stripManualSection(content) {
  const markerIndex = content.indexOf(MANUAL_SECTION_HEADER);
  if (markerIndex < 0) {
    return content.trimEnd();
  }
  return content.slice(0, markerIndex).trimEnd();
}

/**
 * Ensure first tab lands on skip-link and enter jumps to #main-content.
 * @param {import("playwright").Page} page
 * @returns {Promise<boolean>}
 */
async function checkSkipLink(page) {
  await page.keyboard.press("Tab");
  const skipFocused = await page.evaluate(
    () => document.activeElement?.classList?.contains("skip-link") === true,
  );
  if (!skipFocused) {
    return false;
  }

  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  const hash = await page.evaluate(() => window.location.hash);
  return hash === "#main-content";
}

/**
 * Validate mobile menu open/close focus behavior.
 * @param {import("playwright").Page} page
 * @returns {Promise<boolean>}
 */
async function checkMobileMenuKeyboard(page) {
  const exists = await page.locator("#nav-hamburger").count();
  if (exists === 0) {
    return false;
  }

  await page.click("#nav-hamburger");
  await page.waitForTimeout(120);

  const openedState = await page.evaluate(() => {
    const hamburger = document.getElementById("nav-hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const firstLink = mobileMenu?.querySelector("a");
    const firstLinkFocused = firstLink ? document.activeElement === firstLink : false;
    return {
      expanded: hamburger?.getAttribute("aria-expanded") === "true",
      menuOpen: mobileMenu?.classList.contains("open") === true,
      firstLinkFocused,
    };
  });

  if (!(openedState.expanded && openedState.menuOpen && openedState.firstLinkFocused)) {
    return false;
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);

  const closedState = await page.evaluate(() => {
    const hamburger = document.getElementById("nav-hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    return {
      expanded: hamburger?.getAttribute("aria-expanded") === "false",
      menuClosed: mobileMenu?.classList.contains("open") === false,
      focusReturned: document.activeElement === hamburger,
    };
  });

  return closedState.expanded && closedState.menuClosed && closedState.focusReturned;
}

/**
 * Validate homepage popup focus behavior.
 * @param {import("playwright").Page} page
 * @returns {Promise<boolean>}
 */
async function checkHomepagePopup(page) {
  await page.focus(".nav-brand");
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent("mouseout", { clientY: 0, bubbles: true }));
  });
  await page.waitForTimeout(250);

  const opened = await page.evaluate(() => {
    const overlay = document.getElementById("tips-popup-overlay");
    const email = document.getElementById("tips-popup-email");
    return (
      overlay?.classList.contains("open") === true &&
      overlay?.getAttribute("aria-hidden") === "false" &&
      document.activeElement === email
    );
  });
  if (!opened) {
    return false;
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  return await page.evaluate(() => {
    const overlay = document.getElementById("tips-popup-overlay");
    return (
      overlay?.classList.contains("open") === false &&
      overlay?.getAttribute("aria-hidden") === "true"
    );
  });
}

/**
 * Entry point.
 * @returns {Promise<void>}
 */
async function main() {
  execFileSync("node", [BASELINE_SCRIPT], { stdio: "inherit" });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  /** @type {string[]} */
  const manualLines = [];
  let hasFailures = false;

  try {
    for (const target of PAGE_TARGETS) {
      const page = await context.newPage();
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 30000 });

      const skipPass = await checkSkipLink(page);
      manualLines.push(
        `- ${skipPass ? "PASS" : "FAIL"}: ${target.label} :: skip-link keyboard jump`,
      );
      if (!skipPass) {
        hasFailures = true;
      }

      const menuPass = await checkMobileMenuKeyboard(page);
      manualLines.push(
        `- ${menuPass ? "PASS" : "FAIL"}: ${target.label} :: mobile-menu keyboard open/close`,
      );
      if (!menuPass) {
        hasFailures = true;
      }

      if (target.label === "homepage") {
        const popupPass = await checkHomepagePopup(page);
        manualLines.push(
          `- ${popupPass ? "PASS" : "FAIL"}: homepage :: tips-popup focus/escape behavior`,
        );
        if (!popupPass) {
          hasFailures = true;
        }
      }

      await page.close();
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const baseline = fs.readFileSync(EVIDENCE_FILE, "utf8");
  const baselineBody = stripManualSection(baseline);
  const manualSection = [
    "",
    MANUAL_SECTION_HEADER,
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    `Manual Status: ${hasFailures ? "FAIL" : "PASS"}`,
    ...manualLines,
    "",
  ].join("\n");

  fs.writeFileSync(EVIDENCE_FILE, `${baselineBody}${manualSection}`, "utf8");

  if (hasFailures) {
    console.error("Accessibility manual regression failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), EVIDENCE_FILE)}`);
    process.exit(1);
  }

  console.log("Accessibility manual regression passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), EVIDENCE_FILE)}`);
}

main().catch((error) => {
  console.error(
    `Accessibility manual regression error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
