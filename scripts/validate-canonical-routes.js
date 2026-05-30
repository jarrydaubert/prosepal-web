#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const VERCEL_CONFIG = path.join(ROOT, "vercel.json");
const LOG_DIR = path.join(ROOT, "docs", "evidence");
const LOG_FILE = path.join(LOG_DIR, "canonical-route-validation.md");

const EXPECTED_ROUTES = [
  { cleanPath: "/privacy", htmlPath: "/privacy.html", file: "privacy.html" },
  { cleanPath: "/terms", htmlPath: "/terms.html", file: "terms.html" },
  { cleanPath: "/support", htmlPath: "/support.html", file: "support.html" },
];

/**
 * Extract canonical href from an HTML document.
 * @param {string} html
 * @returns {string}
 */
function extractCanonical(html) {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match ? match[1] : "";
}

/**
 * Extract og:url content from an HTML document.
 * @param {string} html
 * @returns {string}
 */
function extractOgUrl(html) {
  const match = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
  return match ? match[1] : "";
}

/**
 * Write evidence file.
 * @param {string[]} lines
 * @returns {void}
 */
function writeLog(lines) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const output = [
    "# Canonical Route Validation",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    ...lines,
    "",
  ];
  fs.writeFileSync(LOG_FILE, output.join("\n"), "utf8");
}

/**
 * Entry point.
 * @returns {void}
 */
function main() {
  const errors = [];
  const results = ["Status: PASS"];
  const siteOrigin = "https://www.prosepal.app";

  const vercel = JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8"));
  const redirects = Array.isArray(vercel.redirects) ? vercel.redirects : [];
  const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];

  for (const route of EXPECTED_ROUTES) {
    const redirect = redirects.find(
      (entry) => entry.source === route.htmlPath && entry.destination === route.cleanPath,
    );

    if (redirect?.permanent !== true) {
      errors.push(`missing permanent redirect ${route.htmlPath} -> ${route.cleanPath}`);
      continue;
    }

    const rewrite = rewrites.find(
      (entry) => entry.source === route.cleanPath && entry.destination === route.htmlPath,
    );

    if (!rewrite) {
      errors.push(`missing rewrite ${route.cleanPath} -> ${route.htmlPath}`);
      continue;
    }

    const htmlPath = path.join(PUBLIC_DIR, route.file);
    const html = fs.readFileSync(htmlPath, "utf8");
    const expectedUrl = `${siteOrigin}${route.cleanPath}`;
    const canonical = extractCanonical(html);
    const ogUrl = extractOgUrl(html);

    if (canonical !== expectedUrl) {
      errors.push(
        `${route.file} canonical mismatch: expected ${expectedUrl}, got ${canonical || "(missing)"}`,
      );
    }

    if (ogUrl !== expectedUrl) {
      errors.push(
        `${route.file} og:url mismatch: expected ${expectedUrl}, got ${ogUrl || "(missing)"}`,
      );
    }

    if (canonical === expectedUrl && ogUrl === expectedUrl) {
      results.push(`- ${route.file}: pass`);
    }
  }

  if (errors.length > 0) {
    results[0] = "Status: FAIL";
    results.push(...errors.map((error) => `- ${error}`));
  }

  writeLog(results);

  if (errors.length > 0) {
    console.error("Canonical route validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Canonical route validation passed.");
  console.log(`Evidence written: ${path.relative(process.cwd(), LOG_FILE)}`);
}

main();
