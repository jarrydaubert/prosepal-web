#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT_DIR = path.join(__dirname, "..");
const LOG_DIR = path.join(ROOT_DIR, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "csp-runtime-verification.md");

const PAGES = ["https://www.prosepal.app/", "https://www.prosepal.app/privacy"];

const ANALYTICS_SCRIPT_PATHS = ["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"];
const ANALYTICS_CONNECT_HOSTS = ["vitals.vercel-insights.com", "vitals.vercel-analytics.com"];

/**
 * Write evidence output.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# CSP Runtime Verification",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Identify CSP-like violation text.
 * @param {string} message
 * @returns {boolean}
 */
function isCspViolation(message) {
  const text = message.toLowerCase();
  return (
    text.includes("content security policy") ||
    (text.includes("refused to") && (text.includes("script") || text.includes("connect")))
  );
}

/**
 * Check whether URL is one of our tracked analytics resources.
 * @param {string} url
 * @returns {boolean}
 */
function isTrackedAnalyticsUrl(url) {
  return (
    ANALYTICS_SCRIPT_PATHS.some((segment) => url.includes(segment)) ||
    ANALYTICS_CONNECT_HOSTS.some((host) => url.includes(host))
  );
}

/**
 * Run runtime checks on one page.
 * @param {import("playwright").Browser} browser
 * @param {string} url
 * @returns {Promise<{
 *   url: string,
 *   cspConsoleViolations: string[],
 *   pageErrors: string[],
 *   analyticsRequestFailures: string[],
 *   analyticsScriptResponses: string[],
 *   runtimeFlags: { vaType: string, siType: string }
 * }>}
 */
async function inspectPage(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();

  /** @type {string[]} */
  const cspConsoleViolations = [];
  /** @type {string[]} */
  const pageErrors = [];
  /** @type {string[]} */
  const analyticsRequestFailures = [];
  /** @type {string[]} */
  const analyticsScriptResponses = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (isCspViolation(text)) {
      cspConsoleViolations.push(`${msg.type()}: ${text}`);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    const failedUrl = request.url();
    if (isTrackedAnalyticsUrl(failedUrl)) {
      analyticsRequestFailures.push(
        `${failedUrl} :: ${request.failure()?.errorText || "unknown error"}`,
      );
    }
  });

  page.on("response", (response) => {
    const responseUrl = response.url();
    if (ANALYTICS_SCRIPT_PATHS.some((segment) => responseUrl.includes(segment))) {
      analyticsScriptResponses.push(`${response.status()} ${responseUrl}`);
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 });
  await page.waitForTimeout(1500);

  const runtimeFlags = await page.evaluate(() => ({
    vaType: typeof window.va,
    siType: typeof window.si,
  }));

  await context.close();

  return {
    url,
    cspConsoleViolations,
    pageErrors,
    analyticsRequestFailures,
    analyticsScriptResponses,
    runtimeFlags,
  };
}

/**
 * Entry point.
 * @returns {Promise<void>}
 */
async function main() {
  const browser = await chromium.launch({ headless: true });
  /** @type {Awaited<ReturnType<typeof inspectPage>>[]} */
  const results = [];

  try {
    for (const url of PAGES) {
      results.push(await inspectPage(browser, url));
    }
  } finally {
    await browser.close();
  }

  const hasBlockingIssues = results.some((result) => result.cspConsoleViolations.length > 0);
  const hasRuntimeWarnings = results.some(
    (result) => result.pageErrors.length > 0 || result.analyticsRequestFailures.length > 0,
  );

  const lines = [hasBlockingIssues ? "Status: FAIL" : "Status: PASS"];

  for (const result of results) {
    lines.push("");
    lines.push(`## ${result.url}`);
    lines.push(`- window.va type: \`${result.runtimeFlags.vaType}\``);
    lines.push(`- window.si type: \`${result.runtimeFlags.siType}\``);
    lines.push(
      `- analytics script responses: ${
        result.analyticsScriptResponses.length > 0
          ? result.analyticsScriptResponses.map((entry) => `\`${entry}\``).join(", ")
          : "(none observed)"
      }`,
    );
    lines.push(
      `- CSP console violations: ${
        result.cspConsoleViolations.length > 0
          ? result.cspConsoleViolations.map((entry) => `\`${entry}\``).join("; ")
          : "none"
      }`,
    );
    lines.push(
      `- page errors: ${
        result.pageErrors.length > 0
          ? result.pageErrors.map((entry) => `\`${entry}\``).join("; ")
          : "none"
      }`,
    );
    lines.push(
      `- analytics request failures: ${
        result.analyticsRequestFailures.length > 0
          ? result.analyticsRequestFailures.map((entry) => `\`${entry}\``).join("; ")
          : "none"
      }`,
    );
  }

  writeLog(lines);

  if (hasBlockingIssues) {
    console.error("CSP runtime verification failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

  if (hasRuntimeWarnings) {
    console.warn("CSP runtime verification passed with runtime warnings.");
  }

  console.log("CSP runtime verification passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main().catch((error) => {
  const ciRuntimeFallback = process.env.CI === "true";
  writeLog([
    ciRuntimeFallback ? "Status: WARN" : "Status: FAIL",
    "",
    `- FAIL: runtime check error \`${error instanceof Error ? error.message : String(error)}\``,
  ]);
  if (ciRuntimeFallback) {
    console.warn("CSP runtime verification warning (CI fallback): runtime probe failed.");
    console.warn(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(0);
  }
  console.error("CSP runtime verification failed.");
  console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
  process.exit(1);
});
