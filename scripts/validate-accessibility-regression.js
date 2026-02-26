#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const LOG_DIR = path.join(ROOT_DIR, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "accessibility-regression.md");
const SKIP_LINK_PATTERN = /<a(?=[^>]*class="skip-link")(?=[^>]*href="#main-content")[^>]*>/i;

const PAGE_RULES = [
  {
    file: "index.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main-content anchor exists", pattern: /\sid="main-content"/i },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "waitlist label association",
        pattern: /<label[^>]*for="android-waitlist-email"[^>]*>/i,
      },
      {
        label: "tips popup label association",
        pattern: /<label[^>]*for="tips-popup-email"[^>]*>/i,
      },
    ],
  },
  {
    file: "messages/index.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "mobile navigation aria-label",
        pattern: /<nav[^>]*class="mobile-menu"[^>]*aria-label="Mobile navigation"/i,
      },
    ],
  },
  {
    file: "blog/index.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "mobile navigation aria-label",
        pattern: /<nav[^>]*class="mobile-menu"[^>]*aria-label="Mobile navigation"/i,
      },
    ],
  },
  {
    file: "privacy.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "mobile navigation aria-label",
        pattern: /<nav[^>]*class="mobile-menu"[^>]*aria-label="Mobile navigation"/i,
      },
    ],
  },
  {
    file: "terms.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "mobile navigation aria-label",
        pattern: /<nav[^>]*class="mobile-menu"[^>]*aria-label="Mobile navigation"/i,
      },
    ],
  },
  {
    file: "support.html",
    checks: [
      { label: "skip link present", pattern: SKIP_LINK_PATTERN },
      { label: "main navigation aria-label", pattern: /<nav[^>]*aria-label="Main navigation"/i },
      {
        label: "mobile navigation aria-label",
        pattern: /<nav[^>]*class="mobile-menu"[^>]*aria-label="Mobile navigation"/i,
      },
    ],
  },
];

const CSS_RULES = [
  {
    file: "css/home.css",
    checks: [
      {
        label: "waitlist input focus-visible outline",
        pattern:
          /\.hero-waitlist-form input\[type="email"\]:focus-visible\s*{[^}]*outline:\s*2px\s+solid/i,
      },
      {
        label: "no outline:none on waitlist email focus",
        pattern: /\.hero-waitlist-form input\[type="email"\]:focus\s*{[^}]*outline:\s*none/i,
        negate: true,
      },
    ],
  },
];

/**
 * Write evidence output.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# Accessibility Regression Baseline",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Evaluate regex checks.
 * @param {string} source
 * @param {{label: string, pattern: RegExp, negate?: boolean}[]} checks
 * @param {string} scope
 * @returns {{ok: boolean, lines: string[]}}
 */
function evaluateChecks(source, checks, scope) {
  const lines = [];
  let ok = true;

  for (const check of checks) {
    const matched = check.pattern.test(source);
    const passed = check.negate ? !matched : matched;
    if (!passed) {
      ok = false;
      lines.push(`- FAIL: ${scope} :: ${check.label}`);
    } else {
      lines.push(`- PASS: ${scope} :: ${check.label}`);
    }
  }

  return { ok, lines };
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  const outputLines = [];
  let hasFailures = false;

  for (const rule of PAGE_RULES) {
    const filePath = path.join(PUBLIC_DIR, rule.file);
    const html = fs.readFileSync(filePath, "utf8");
    const result = evaluateChecks(html, rule.checks, rule.file);
    outputLines.push(...result.lines);
    if (!result.ok) hasFailures = true;
  }

  for (const rule of CSS_RULES) {
    const filePath = path.join(PUBLIC_DIR, rule.file);
    const css = fs.readFileSync(filePath, "utf8");
    const result = evaluateChecks(css, rule.checks, rule.file);
    outputLines.push(...result.lines);
    if (!result.ok) hasFailures = true;
  }

  const lines = [hasFailures ? "Status: FAIL" : "Status: PASS", ...outputLines];
  writeLog(lines);

  if (hasFailures) {
    console.error("Accessibility regression baseline failed.");
    console.error(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
    process.exit(1);
  }

  console.log("Accessibility regression baseline passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
